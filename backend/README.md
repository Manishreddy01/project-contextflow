# Project Aurora — Backend API (FastAPI)

This folder contains the backend for Project Aurora's AI chatbot, built with FastAPI and integrated with a LangChain RAG pipeline + Qdrant vector store.

---

## Backend Setup Guide

### Step 1: Clone & Create Virtual Environment

#### Mac/Linux
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

#### Windows (CMD)
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
```

---

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

If starting fresh:
```bash
pip install fastapi uvicorn python-multipart openai qdrant-client langchain httpx python-dotenv
pip install langchain_qdrant
 pip install langchain_huggingface
 pip install langchain_community  
pip freeze > requirements.
```

---

### Step 3: Create `.env` File

```env
OPENAI_API_KEY=your-openai-key
TAVILY_API_KEY=your-tavily-key
QDRANT_URL=http://localhost:6333
OPENROUTER_API_KEY=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
```

---

### Step 4: Run Backend Server

```bash
python -m uvicorn main:app --reload
```

Visit:  
- http://localhost:8000/health → server OK  
- http://localhost:8000/docs → Swagger UI

---

## API Endpoints

| Method | Route         | Description                          |
|--------|---------------|--------------------------------------|
| POST   | /upload/      | Upload files or pasted text          |
| POST   | /query/       | Ask question using RAG + fallback    |
| GET    | /health       | Health check                         |

---

## Run Local Qdrant via Docker

```bash
docker run -p 6333:6333 -v qdrant_data:/qdrant/storage qdrant/qdrant
```

Dashboard: http://localhost:6333/dashboard

---

## Folder Structure

```
backend/
├── routes/
│   ├── upload.py
│   └── query.py
├── services/
│   ├── rag_service.py
│   └── web_search.py
├── utils/
├── .env
├── main.py
├── requirements.txt
└── README.md
```

---

## Notes

- `run_rag_pipeline()` will be updated by Manesh with real LangChain + Qdrant logic.
- Fallback web search uses Tavily with confidence threshold: 0.85.
- All variables follow camelCase and match frontend & RAG integration conventions.

---

You’re ready to connect frontend ↔ backend ↔ RAG pipeline!
txt