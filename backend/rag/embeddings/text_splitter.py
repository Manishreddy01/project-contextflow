import sys
import os

# Add root folder to path so 'loaders' can be found
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from loaders.load_documents import load_documents
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document


def chunk_documents(
    documents: list[Document],
    chunk_size: int = 800,
    chunk_overlap: int = 200,
    metadata: dict = None,
):
    """
    Split documents into overlapping chunks.

    Defaults:
    - chunk_size=800: larger chunks keep related sentences together.
    - chunk_overlap=200: overlap avoids cutting important info between chunks.
    """

    if metadata:
        for doc in documents:
            doc.metadata.update(metadata)

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )

    chunks = splitter.split_documents(documents)
    print(
        f"🧩 Chunked into {len(chunks)} segments "
        f"(chunk_size={chunk_size}, overlap={chunk_overlap})"
    )
    return chunks


# Test only (will move to main.py later)
if __name__ == "__main__":
    from loaders.load_documents import load_documents

    docs = load_documents("sample.txt")
    chunk_documents(docs)
