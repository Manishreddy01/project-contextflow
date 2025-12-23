# services/web_search.py
import os
import requests
from dotenv import load_dotenv

load_dotenv()
tavily_key = os.getenv("TAVILY_API_KEY")


def search_web_with_tavily(query: str) -> dict:
    """
    Search the web using Tavily and return a dict compatible with QueryResponse:
    {
        "answer": str,
        "sources": List[str],
        "type": "web",
        "confidence": float,
    }
    """
    if not tavily_key:
        # Web search not configured – return a safe fallback
        return {
            "answer": "Web search is not configured (missing TAVILY_API_KEY).",
            "sources": [],
            "type": "web",
            "confidence": 0.0,
        }

    url = "https://api.tavily.com/search"
    headers = {"Content-Type": "application/json"}
    payload = {
        "api_key": tavily_key,
        "query": query,
        "search_depth": "basic",
        "include_answer": True,
        "include_raw_content": False,
        "max_results": 3,
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=15)
        response.raise_for_status()
        data = response.json()

        # Tavily usually returns "answer" and "results"
        answer_text = data.get("answer") or "No web result found."
        results = data.get("results") or []

        sources = []
        for item in results:
            url = item.get("url")
            if url:
                sources.append(url)

        return {
            "answer": answer_text,     # ✅ always a string
            "sources": sources,        # ✅ list of strings
            "type": "web",
            "confidence": 0.7,         # you can tune this
        }

    except Exception as e:
        # On any error, still return a valid object
        return {
            "answer": f"❌ Web search failed: {str(e)}",
            "sources": [],
            "type": "web",
            "confidence": 0.0,
        }
