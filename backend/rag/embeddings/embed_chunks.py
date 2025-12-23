import sys
from pathlib import Path

# Add project root to sys.path
sys.path.append(str(Path(__file__).resolve().parents[1]))

from loaders.load_documents import load_documents
from text_splitter import chunk_documents
from sentence_transformers import SentenceTransformer
from langchain_community.embeddings import HuggingFaceEmbeddings



def get_huggingface_embedder(model_name="all-MiniLM-L6-v2"):
    print(f"🚀 Loading HuggingFace model: {model_name}")
    model = HuggingFaceEmbeddings(model_name=model_name)
    return model

if __name__ == "__main__":
    docs = load_documents("sample.txt")
    chunks = chunk_documents(docs)

    embedder = get_huggingface_embedder()
    vectors = embedder.embed_documents([doc.page_content for doc in chunks])

    print(f"🧠 Embedded {len(vectors)} chunks → each vector has {len(vectors[0])} dimensions.")
