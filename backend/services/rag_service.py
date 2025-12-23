# services/rag_service.py
import sys
import os
from typing import List

# Ensure we can import from the backend/ folder (where chain/ lives)
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

from chain.generate_answer import generate_answer  # ← correct import

def run_rag_pipeline(question: str, chat_history: List[dict], conversation_id: str):
    """
    Returns a normalized dict consumed by routes/query.py:
    {
      "answer": str,
      "sources": list,
      "type": "document" | "web",
      "confidence": float
    }
    Note: chat_history & conversation_id are kept for future use but not required by generate_answer().
    """
    try:
        # generate_answer accepts only (query: str, k: int = 3)
        result = generate_answer(
            query=question,
            chat_history=chat_history,
            conversation_id=conversation_id
        )


        # Be defensive in case fields are missing
        answer = result.get("answer") or result.get("result") or ""
        sources = result.get("sources", [])
        resp_type = result.get("type", "document")
        confidence = float(result.get("confidence", 0.9))

        return {
            "answer": answer,
            "sources": sources,
            "type": resp_type,
            "confidence": confidence
        }

    except Exception as e:
        print(f"[ERROR] Failed in run_rag_pipeline: {e}")
        return {
            "answer": "An error occurred while generating a response.",
            "sources": [],
            "type": "document",
            "confidence": 0.0
        }
