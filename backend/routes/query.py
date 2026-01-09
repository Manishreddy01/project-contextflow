from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Literal, Optional
import time
import os

from langchain_community.chat_models import ChatOpenAI

from services.rag_service import run_rag_pipeline
from services.web_search import search_web_with_tavily  # see web_search.py below

router = APIRouter()

# Confidence threshold for accepting RAG answers
CONFIDENCE_THRESHOLD = 0.7

openrouter_key = os.getenv("OPENROUTER_API_KEY")
if not openrouter_key:
    raise ValueError("OPENROUTER_API_KEY not set")


# ---------- Models ----------


class QueryRequest(BaseModel):
    question: str
    conversationId: str
    userId: Optional[str] = None


class QueryResponse(BaseModel):
    answer: str
    sources: List[str]
    type: Literal["document", "web"]
    confidence: float


# ---------- Heuristics: conversational vs factual ----------

def is_conversational_message(text: str) -> bool:
    """
    Detects greetings / small talk / emotional check-ins / personal preferences
    that should be answered conversationally by the LLM instead of web search.
    """
    if not text:
        return True

    t = text.lower().strip()
    words = t.split()

    question_prefixes = ("who ", "what ", "why ", "when ", "where ", "which ", "how ")
    if t.startswith(question_prefixes):
        small_talk_phrases = [
            "how are you",
            "how are u",
            "how's it going",
            "hows it going",
            "how are you doing",
        ]
        if not any(p in t for p in small_talk_phrases):
            return False

    greeting_keywords = [
        "hi",
        "hello",
        "hey",
        "good morning",
        "good afternoon",
        "good evening",
        "what's up",
        "whats up",
        "how are you",
        "how are u",
        "how's it going",
        "hows it going",
        "how are you doing",
    ]
    if any(kw in t for kw in greeting_keywords):
        return True

    first_person = any(p in t for p in ["i ", "i'm", "i am", "im ", "my "])
    emotion_keywords = [
        "not so great",
        "not great",
        "down",
        "sad",
        "low",
        "tired",
        "exhausted",
        "stressed",
        "anxious",
        "anxiety",
        "overwhelmed",
        "burned out",
        "burnt out",
        "lonely",
        "depressed",
        "upset",
        "worried",
        "clumsy",
        "off today",
        "meh",
        "bad",
        "awful",
        "terrible",
    ]
    if first_person and any(kw in t for kw in emotion_keywords):
        return True

    preference_keywords = [
        "like",
        "love",
        "enjoy",
        "hate",
        "don't like",
        "do not like",
        "prefer",
        "i'm a fan of",
        "im a fan of",
    ]
    if first_person and any(kw in t for kw in preference_keywords):
        return True

    if len(words) <= 4 and "?" not in t:
        return True

    return False


# ---------- Small-talk LLM path ----------


def generate_small_talk_reply(question: str) -> dict:
    """
    Friendly, conversational reply that does NOT use web search.
    This is used when RAG is weak but the message is clearly conversational.
    """
    llm = ChatOpenAI(
        temperature=0.7,
        openai_api_base="https://openrouter.ai/api/v1",
        openai_api_key=openrouter_key,
        model="openai/gpt-4o-mini",
    )

    prompt = f"""
You are a friendly, supportive AI assistant chatting with a user.
Respond naturally and briefly to the message below.

If the user shares feelings (e.g., "I'm not doing great") or preferences
(e.g., "I like drinking coffee"), respond empathetically and conversationally.
You can gently relate it to healthy sleep habits if it's relevant,
but do NOT give textbook-style medical advice or long health essays.

User: {question}
"""

    answer_text = llm.invoke(prompt).content

    return {
        "answer": answer_text,
        "sources": [],
        "type": "document",
        "confidence": 0.9,
    }


# ---------- Main route ----------


@router.post("/", response_model=QueryResponse)
async def handle_query(payload: QueryRequest):
    start_time = time.time()

    question = (payload.question or "").strip()
    conversation_id = payload.conversationId
    user_id = payload.userId
    print("QUERY conversationId:", conversation_id, "userId:", user_id)

    if not question or not conversation_id:
        raise HTTPException(
            status_code=400, detail="Missing question or conversationId"
        )

    try:
        chat_history = []  # reserved for future use

        # ---- 1) Run RAG pipeline first ----
        rag_result = run_rag_pipeline(
            question, chat_history, conversation_id, user_id=user_id
        )
        rag_conf = rag_result.get("confidence", 0.0)

        if rag_conf >= CONFIDENCE_THRESHOLD:
            print(f"[Query] RAG accepted (conf={rag_conf}).")
            print(f"[Query] Processed in {round(time.time() - start_time, 2)}s")
            return rag_result

        print(
            f"[Query] RAG weak (conf={rag_conf}). Checking conversational heuristics..."
        )

        if is_conversational_message(question):
            print(
                "[Query] Detected conversational / small-talk message → LLM chat mode."
            )
            small_talk = generate_small_talk_reply(question)
            print(f"[Query] Processed in {round(time.time() - start_time, 2)}s")
            return small_talk

        print(
            "RAG confidence too low & not conversational. Switching to web search fallback."
        )
        web_result = search_web_with_tavily(question)
        print(f"[Query] Processed in {round(time.time() - start_time, 2)}s")
        return web_result

    except Exception as e:
        print(f"[ERROR] Exception in /query: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")
