import sys
from pathlib import Path
from typing import Union

sys.path.append(str(Path(__file__).resolve().parents[1]))

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
from langchain_community.vectorstores import Qdrant
from langchain_community.embeddings import HuggingFaceEmbeddings

from embeddings.text_splitter import chunk_documents
from loaders.load_documents import load_documents


def get_qdrant_client():
    return QdrantClient(url="http://localhost:6333")


def create_collection(client, collection_name: str = "rag_collection"):
    if not client.collection_exists(collection_name):
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE),
        )


def store_in_qdrant(chunks, collection_name: str = "rag_collection", metadata=None):
    embedder = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    client = get_qdrant_client()
    create_collection(client, collection_name)

    # Add metadata
    if metadata:
        for i, chunk in enumerate(chunks):
            chunk.metadata = {
                "conversationId": metadata.get("conversationId"),
                "source": metadata.get("fileName"),
                "chunkIndex": i,
            }

    Qdrant.from_documents(
        documents=chunks,
        embedding=embedder,
        url="http://localhost:6333",
        collection_name=collection_name,
    )

    print(
        f"✅ Stored {len(chunks)} chunks in Qdrant under collection '{collection_name}'."
    )


def store_vectors(*, content: Union[str, bytes], file_name: str, conversation_id: str):
    """
    Handles:
    - bytes -> uploaded file contents
    - str   -> raw text (pasted or extracted)
    NO MORE Path(content) nonsense that treats long text as a file path.
    """
    try:
        # Case 1: uploaded file bytes
        if isinstance(content, bytes):
            documents = load_documents(content, file_name)

        # Case 2: raw text
        elif isinstance(content, str):
            documents = load_documents(content.encode("utf-8"), file_name)

        else:
            raise ValueError(
                f"Unsupported content type in store_vectors(): {type(content)}"
            )

        print(f"📥 store_vectors() file_name={file_name!r}, docs={len(documents)}")

        chunks = chunk_documents(documents)

        if not chunks:
            print(f"⚠️ No chunks generated from: {file_name}. Skipping embedding.")
            return

        store_in_qdrant(
            chunks,
            metadata={
                "fileName": file_name,
                "conversationId": conversation_id,
            },
        )

    except Exception as e:
        print(f"[ERROR] store_vectors failed: {e}")
        raise
