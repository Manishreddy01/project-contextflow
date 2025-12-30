import json
import os
from pathlib import Path
import sys

from dotenv import load_dotenv

# Make sure backend root is on sys.path
ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT_DIR))

# 🔹 Load .env from the backend root (adjust path if your .env is elsewhere)
env_path = ROOT_DIR / ".env"
load_dotenv(env_path)

# Now imports that rely on env vars will see them
from rag.chain.generate_answer import generate_answer

EVAL_FILE = Path(__file__).parent / "qa_sleep.json"


def load_eval_cases():
    with open(EVAL_FILE, "r") as f:
        return json.load(f)


def evaluate_case(case):
    q = case["question"]
    conv_id = case.get("conversation_id", "")  # can be "" for global eval
    expected_source = case["expected_source"]
    must_contain = [s.lower() for s in case.get("must_contain", [])]

    result = generate_answer(q, chat_history=None, conversation_id=conv_id, k=8)

    answer = (result.get("answer") or "").lower()
    sources = result.get("sources") or []
    conf = result.get("confidence", 0.0)

    # Retrieval metric: did we hit the expected source?
    retrieved_correct_source = expected_source in sources

    # Answer metric: does answer contain at least one of the expected phrases?
    coverage_count = sum(1 for phrase in must_contain if phrase in answer)
    has_any_coverage = coverage_count > 0

    return {
        "id": case["id"],
        "question": q,
        "answer": result.get("answer", ""),
        "sources": sources,
        "confidence": conf,
        "retrieved_correct_source": retrieved_correct_source,
        "coverage_count": coverage_count,
        "must_contain": must_contain,
    }


def main():
    cases = load_eval_cases()
    results = []

    correct_source_count = 0
    some_coverage_count = 0

    for case in cases:
        print("=" * 80)
        print(f"Case: {case['id']} | Q: {case['question']}")
        res = evaluate_case(case)
        results.append(res)

        print(f"Answer: {res['answer']}\n")
        print(f"Sources: {res['sources']}")
        print(f"Confidence: {res['confidence']:.2f}")
        print(f"Retrieved correct source? {res['retrieved_correct_source']}")
        print(f"Coverage count (must_contain hit): {res['coverage_count']}/{len(res['must_contain'])}")

        if res["retrieved_correct_source"]:
            correct_source_count += 1
        if res["coverage_count"] > 0:
            some_coverage_count += 1

    n = len(cases)
    print("\n" + "#" * 80)
    print("SUMMARY")
    print(f"Total cases: {n}")
    print(f"Retrieval accuracy (expected source in sources): {correct_source_count}/{n}")
    print(f"Answer coverage (at least one key phrase in answer): {some_coverage_count}/{n}")


if __name__ == "__main__":
    main()
