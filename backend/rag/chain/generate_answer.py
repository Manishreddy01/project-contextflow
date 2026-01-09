import os
from typing import Optional

from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.chat_models import ChatOpenAI
from langchain.schema import Document
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue

from services.chat_history import add_to_chat_history
from rag.config import EMBEDDING_MODEL_NAME  # make sure this exists

# ----------------- CONFIG -----------------
openrouter_key = os.getenv("OPENROUTER_API_KEY")
if not openrouter_key:
    raise ValueError("OPENROUTER_API_KEY not set")

# Similarity threshold for deciding if retrieved docs are relevant enough
SIM_THRESHOLD = 0.55
# ------------------------------------------


def generate_answer(
    query,
    chat_history=None,
    conversation_id: str = "",
    user_id: Optional[str] = None,
    k: int = 8,
):
    """
    RAG implementation using:
    - qdrant-client (direct)
    - HuggingFace embeddings
    - OpenRouter LLM

    Retrieval strategy:
    1) First search scoped to this userId + conversationId.
    2) If no docs, run a user-scoped global search (userId only).
       Only keep global docs if their similarity score is above SIM_THRESHOLD.
    """

    chat_history = chat_history or []

    print(
        f"[RAG] generate_answer() conv_id={conversation_id} user_id={user_id} question={query!r}"
    )

    # -------- Embeddings --------
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)
    print(f"[Embeddings] Using model: {EMBEDDING_MODEL_NAME}")

    # -------- Qdrant Client --------
    QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")

    client = QdrantClient(url=QDRANT_URL)

    # Embed query
    query_vector = embeddings.embed_query(query)

    docs = []
    used_conversation_filter = False
    top_score = 0.0

    # Helper for top score
    def _top_score(points):
        if not points:
            return 0.0
        scores = [getattr(p, "score", 0.0) or 0.0 for p in points]
        return max(scores) if scores else 0.0

    # -------- 1) Conversation-scoped vector search (userId + conversationId) --------
    scoped_must = []

    if user_id:
        scoped_must.append(
            FieldCondition(
                key="metadata.userId",
                match=MatchValue(value=user_id),
            )
        )

    if conversation_id:
        scoped_must.append(
            FieldCondition(
                key="metadata.conversationId",
                match=MatchValue(value=conversation_id),
            )
        )

    scoped_filter = Filter(must=scoped_must) if scoped_must else None

    scoped_result = client.query_points(
        collection_name="rag_collection",
        query=query_vector,
        limit=k,
        with_payload=True,
        query_filter=scoped_filter,
    )

    scoped_points = scoped_result.points
    print(
        f"[RAG] Scoped search hits: {len(scoped_points)} for conv_id={conversation_id}"
    )

    if scoped_points:
        top_score = _top_score(scoped_points)
        print(f"[RAG] Scoped top score: {top_score:.3f}")

        for point in scoped_points:
            payload = point.payload or {}
            inner_meta = payload.get("metadata", {})
            page_content = payload.get(
                "page_content", inner_meta.get("page_content", "")
            )

            docs.append(
                Document(
                    page_content=page_content,
                    metadata=inner_meta,
                )
            )

        used_conversation_filter = True

    # -------- 2) Global fallback search (userId only, any conversation) --------
    if not docs:
        print("[RAG] No scoped docs found, running GLOBAL fallback search...")

        global_must = []
        if user_id:
            global_must.append(
                FieldCondition(
                    key="metadata.userId",
                    match=MatchValue(value=user_id),
                )
            )

        global_filter = Filter(must=global_must) if global_must else None

        global_result = client.query_points(
            collection_name="rag_collection",
            query=query_vector,
            limit=k,
            with_payload=True,
            query_filter=global_filter,
        )

        global_points = global_result.points
        print(f"[RAG] Global fallback hits: {len(global_points)}")

        if global_points:
            global_top_score = _top_score(global_points)
            print(f"[RAG] Global fallback top score: {global_top_score:.3f}")

            if global_top_score >= SIM_THRESHOLD:
                top_score = global_top_score
                for point in global_points:
                    payload = point.payload or {}
                    inner_meta = payload.get("metadata", {})
                    page_content = payload.get(
                        "page_content", inner_meta.get("page_content", "")
                    )

                    docs.append(
                        Document(
                            page_content=page_content,
                            metadata=inner_meta,
                        )
                    )
                used_conversation_filter = False
                print("[RAG] Global docs accepted (above similarity threshold).")
            else:
                print(
                    "[RAG] Global matches below similarity threshold → treated as NO docs."
                )

    # -------- 3) No docs at all --------
    if not docs:
        print("[RAG] No docs found at all (even globally). Returning empty result.")
        return {
            "answer": "",
            "sources": [],
            "type": "document",
            "confidence": 0.0,
        }

    # -------- Build context --------
    context = "\n\n".join(d.page_content for d in docs)

    # -------- LLM client --------
    llm = ChatOpenAI(
        temperature=0,
        openai_api_base="https://openrouter.ai/api/v1",
        openai_api_key=openrouter_key,
        model="openai/gpt-4o-mini",
    )

    # -------- 4) First-pass prompt (with fallback) --------
    first_prompt = f"""
You are a helpful assistant that must answer using ONLY the information in the provided context.

Guidelines:
- First, look carefully for any information in the context that is even partially related to the question.
- If you find anything relevant, use it to construct the best possible answer in your own words.
- It is OK to say that some details are not specified in the documents, but still answer based on what is available.
- ONLY if there is truly no relevant information in the context at all, respond exactly with:
"I don't have enough information in the documents."

Context:
{context}

Question:
{query}
"""

    answer_text = llm.invoke(first_prompt).content

    fallback_phrase = "I don't have enough information in the documents."

    # -------- 5) Second-pass override when docs are clearly relevant --------
    if fallback_phrase in answer_text and top_score >= SIM_THRESHOLD:
        print(
            f"[RAG] High-sim docs (top_score={top_score:.3f}) but fallback phrase returned. "
            "Running SECOND-PASS LLM call without fallback option."
        )

        second_prompt = f"""
You are a helpful assistant. You MUST answer the question using ONLY the information
in the provided context. The context IS related to the question.

Guidelines:
- Use any information in the context that is even partially relevant.
- If some details are missing, say things like "the documents do not specify X, but they do say Y..."
- Do NOT say "I don't have enough information in the documents."
- Do NOT refuse to answer. Give your best effort answer based on the context.

Context:
{context}

Question:
{query}
"""

        second_answer = llm.invoke(second_prompt).content
        answer_text = second_answer

    # -------- Sources --------
    sources = [d.metadata.get("source", "unknown") for d in docs]

    # -------- 6) Confidence logic (domain-agnostic) --------
    if fallback_phrase in answer_text and top_score < SIM_THRESHOLD:
        confidence = 0.3
        print(
            f"[RAG] LLM fallback phrase + low similarity (top_score={top_score:.3f}) → confidence=0.3"
        )
    else:
        if used_conversation_filter:
            confidence = 0.9
            print(
                f"[RAG] Using SCOPED docs → confidence={confidence}, top_score={top_score:.3f}"
            )
        else:
            confidence = 0.8
            print(
                f"[RAG] Using GLOBAL docs → confidence={confidence}, top_score={top_score:.3f}"
            )

    # -------- Save chat history (optional) --------
    try:
        add_to_chat_history(conversation_id, query, answer_text)
    except Exception as e:
        print(f"[RAG] add_to_chat_history failed: {e}")

    print(f"[RAG] Final answer confidence={confidence}, sources={sources}")

    return {
        "answer": answer_text,
        "sources": sources,
        "type": "document",
        "confidence": confidence,
    }
