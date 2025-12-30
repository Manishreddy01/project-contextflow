# services/web_search.py

import os
import requests
from dotenv import load_dotenv

load_dotenv()
tavily_key = os.getenv("TAVILY_API_KEY")

TAVILY_URL = "https://api.tavily.com/search"


def search_web_with_tavily(query: str) -> dict:
    """
    Searches the web using Tavily and returns a QueryResponse-shaped dict.
    """
    if not tavily_key:
        # Fail gracefully but still satisfy the QueryResponse model
        return {
            "answer": "❌ Web search is not configured (missing TAVILY_API_KEY).",
            "sources": [],
            "type": "web",
            "confidence": 0.0,
        }

    payload = {
        "api_key": tavily_key,
        "query": query,
        "search_depth": "basic",
        "include_answer": True,
        "include_raw_content": False,
        "max_results": 3,
    }
    headers = {"Content-Type": "application/json"}

    try:
        resp = requests.post(TAVILY_URL, json=payload, headers=headers, timeout=20)
        resp.raise_for_status()
        data = resp.json()

        answer = data.get("answer") or "No web result found."

        sources = []
        for item in data.get("results", []):
            url = item.get("url") or item.get("source")
            if url:
                sources.append(url)

        return {
            "answer": answer,
            "sources": sources,
            "type": "web",
            "confidence": 0.75,  # web answers are decent but not as trusted as strong RAG
        }
    except Exception as e:
        # Still return a valid QueryResponse-like dict
        return {
            "answer": f"❌ Web search failed: {str(e)}",
            "sources": [],
            "type": "web",
            "confidence": 0.0,
        }
