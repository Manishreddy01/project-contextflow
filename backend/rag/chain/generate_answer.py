# backend/rag/chain/generate_answer.py

import os
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.chat_models import ChatOpenAI
from langchain.schema import Document
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue

from services.chat_history import add_to_chat_history

# ----------------- CONFIG -----------------
openrouter_key = os.getenv("OPENROUTER_API_KEY")
if not openrouter_key:
    raise ValueError("OPENROUTER_API_KEY not set")
# ------------------------------------------


def generate_answer(query, chat_history=None, conversation_id="", k=8):
    """
    Stable RAG implementation using:
    - qdrant-client (direct)
    - HuggingFace embeddings
    - OpenRouter LLM
    """

    chat_history = chat_history or []

    # -------- Embeddings --------
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    # -------- Qdrant Client --------
    client = QdrantClient(url="http://localhost:6333")

    # Embed query
    query_vector = embeddings.embed_query(query)

    # -------- Vector search (CORRECT API for qdrant-client 1.16.2) --------
    search_result = client.query_points(
        collection_name="rag_collection",
        query=query_vector,
        limit=k,
        with_payload=True,
        query_filter=Filter(
            must=[
                FieldCondition(
                    key="metadata.conversationId",
                    match=MatchValue(value=conversation_id)
                )
            ]
        ),
    )

    # Convert points → LangChain Documents
    docs = []
    for point in search_result.points:
        payload = point.payload or {}
        inner_meta = payload.get("metadata", {})
        page_content = payload.get("page_content", inner_meta.get("page_content", ""))

        docs.append(
            Document(
                page_content=page_content,
                metadata=inner_meta,  # just the inner metadata dict
            )
        )

    if not docs:
        return {
            "answer": "",
            "sources": [],
            "type": "document",
            "confidence": 0.0,
        }

    # -------- Build context --------
    context = "\n\n".join(d.page_content for d in docs)

    # -------- LLM --------
    llm = ChatOpenAI(
        temperature=0,
        openai_api_base="https://openrouter.ai/api/v1",
        openai_api_key=openrouter_key,
        model="openai/gpt-4o-mini",
    )

    prompt = f"""
Use ONLY the context below to answer the question.

Context:
{context}

Question:
{query}

If the context is clearly unrelated to the question, say:
"I don't have enough information in the documents."

If the context contains partial or implied information, use your best judgment and answer based on it.
"""

    answer_text = llm.invoke(prompt).content

    # -------- Sources --------
    sources = [
        d.metadata.get("source", "unknown")
        for d in docs
    ]

    # -------- Adjust confidence based on answer content --------
    fallback_phrase = "I don't have enough information in the documents."
    if fallback_phrase in answer_text:
        confidence = 0.3   # low → triggers fallback in query.py
    else:
        confidence = 0.9   # normal high-confidence RAG

    # -------- Save chat history (optional) --------
    try:
        add_to_chat_history(conversation_id, query, answer_text)
    except Exception:
        pass

    return {
        "answer": answer_text,
        "sources": sources,
        "type": "document",
        "confidence": confidence,
    }