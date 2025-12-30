import sys
from pathlib import Path

# Add project root to sys.path
sys.path.append(str(Path(__file__).resolve().parents[1]))
from rag.config import EMBEDDING_MODEL_NAME
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Qdrant
from qdrant_client import QdrantClient


def get_retriever(query: str, k: int = 3):
    embedder = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)

    client = QdrantClient(url="http://localhost:6333")
    vectorstore = Qdrant(
        client=client,
        collection_name="rag_collection",
        embedding=embedder
    )

    retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": k})
    results = retriever.get_relevant_documents(query)

    print(f"\n🔍 Query: {query}")
    for i, doc in enumerate(results, 1):
        print(f"\n📄 Result {i}:\n{doc.page_content}\n---")

if __name__ == "__main__":
    get_retriever("What is LangChain?")
