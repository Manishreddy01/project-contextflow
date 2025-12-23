# backend/routes/query.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Literal
import time
import os

from langchain_community.chat_models import ChatOpenAI

from services.rag_service import run_rag_pipeline
from services.web_search import search_web_with_tavily

router = APIRouter()

# Confidence threshold for deciding if RAG is "good enough"
CONFIDENCE_THRESHOLD = 0.85

openrouter_key = os.getenv("OPENROUTER_API_KEY")
if not openrouter_key:
    raise RuntimeError("OPENROUTER_API_KEY not set")


# ---------- Schemas ----------

class QueryRequest(BaseModel):
    question: str
    conversationId: str


class QueryResponse(BaseModel):
    answer: str
    sources: List[str]
    type: Literal["document", "web"]
    confidence: float


# ---------- Helpers ----------

def is_conversational_message(text: str) -> bool:
    """
    Detects greetings / small talk / emotional check-ins that should be
    answered conversationally by the LLM instead of web search.
    """
    t = text.lower().strip()
    words = t.split()

    if not t:
        return True

    # 1) Classic greetings / small talk
    greeting_keywords = [
        "hi", "hello", "hey",
        "good morning", "good afternoon", "good evening",
        "what's up", "whats up",
        "how are you", "how are u",
        "how's it going", "hows it going",
        "how are you doing",
    ]
    if any(kw in t for kw in greeting_keywords):
        return True

    # 2) Emotional / wellbeing statements
    first_person = any(p in t for p in ["i ", "i'm", "i am", "im ", "my "])
    emotion_keywords = [
        "not so great", "not great", "down", "sad", "low",
        "tired", "exhausted", "stressed", "anxious", "anxiety",
        "overwhelmed", "burned out", "burnt out",
        "lonely", "depressed", "upset", "worried",
        "clumsy", "off today", "meh", "bad", "awful", "terrible",
    ]
    if first_person and any(kw in t for kw in emotion_keywords):
        return True
    preference_keywords = [
        "like", "love", "enjoy", "hate", "don't like", "do not like",
        "prefer", "i'm a fan of", "im a fan of",
    ]
    if first_person and any(kw in t for kw in preference_keywords):
        # e.g. "but i like drinking coffee", "i love coffee"
        return True

    # 3) Very short, no question mark → often chit-chat like "hey there"
    if len(words) <= 4 and "?" not in t:
        return True

    return False


def generate_small_talk_reply(question: str) -> dict:
    """
    Use the LLM directly to respond conversationally,
    without RAG or web search.
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
        "sources": [],          # no external sources; just a chatty reply
        "type": "document",     # fits QueryResponse Literal["document", "web"]
        "confidence": 0.9,
    }


# ---------- Route ----------

@router.post("/", response_model=QueryResponse)
async def handle_query(payload: QueryRequest):
    start_time = time.time()

    question = payload.question
    conversation_id = payload.conversationId
    print("QUERY conversationId:", conversation_id)

    if not question or not conversation_id:
        raise HTTPException(status_code=400, detail="Missing question or conversationId")

    try:
        chat_history = []  # reserved for future use

        # 1) Run RAG pipeline
        rag_result = run_rag_pipeline(question, chat_history, conversation_id)

        # 2) If RAG is weak, decide between conversational reply vs web search
        if rag_result.get("confidence", 0.0) < CONFIDENCE_THRESHOLD:
            if is_conversational_message(question):
                print("Low RAG confidence, conversational message detected → using LLM chat reply.")
                reply = generate_small_talk_reply(question)
                print(f"[Query] Processed in {round(time.time() - start_time, 2)}s")
                return reply

            print("RAG confidence too low. Switching to web search fallback.")
            web_result = search_web_with_tavily(question)
            print(f"[Query] Processed in {round(time.time() - start_time, 2)}s")
            return web_result

        # 3) RAG was confident enough → return document answer
        print(f"[Query] Processed in {round(time.time() - start_time, 2)}s")
        return rag_result

    except Exception as e:
        print(f"[ERROR] Exception in /query: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")
