# ContextFlow

ContextFlow is an AI-powered document assistant I built that runs locally and privately.  

It lets you:
- Upload your own documents (PDF, PPTX, TXT)
- Ask natural language questions about them
- Get grounded answers using Retrieval-Augmented Generation (RAG)
- Fall back to web search or pure chat when there’s no relevant context

It’s designed as a **full-stack, production-style project**: auth, persistence, vector search, and a polished UI — something a recruiter or hiring manager can actually click through and use.

---

## 🧱 Tech Stack

**Frontend**

- React (Vite)
- Tailwind CSS
- Framer Motion

**Backend**

- FastAPI (Python)
- Uvicorn
- LangChain (RAG + LLM orchestration)
- OpenRouter (LLM API)
- HuggingFace sentence transformer embeddings

**Vector Store**

- Qdrant (running in its own Docker container)

**Other**

- Tavily (web search fallback)
- Google OAuth (sign-in)
- Docker & Docker Compose

---

## 🐳 Run Locally with Docker

### 1. Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running
- A copy of this repository on your machine

```bash
git clone https://github.com/Manishreddy01/project-aurora.git
cd project-aurora


2. Backend Environment Variables
Create a .env file inside the backend folder:

bash
Copy code
cd backend
touch .env
Fill backend/.env with your own keys, for example:

env

# LLM / embeddings
OPENROUTER_API_KEY=your_openrouter_key
HUGGINGFACEHUB_API_TOKEN=your_huggingface_token
OPENAI_API_KEY=your_openai_key_optional

# Qdrant (Docker Compose will use the qdrant service name)
QDRANT_URL=http://qdrant:6333

# Web search
TAVILY_API_KEY=your_tavily_key

# Google auth + JWT
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET_KEY=some-secret-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60

# Frontend origin (for CORS)
FRONTEND_ORIGIN=http://localhost:5173
.env is already in .gitignore, so it will not be committed.

Then go back to the project root:

cd ..
3. Start the Stack with Docker Compose
From the project root (where docker-compose.yml lives), run:

docker compose up --build
This will start:

Qdrant on port 6333

Backend (FastAPI) on port 8000

Frontend (React) on port 5173

Once everything is up, open:

http://localhost:5173
You can now:

Sign in with Google

Start a new chat

Upload documents with the + button

Ask questions like “summarize this file” or “what are the key points?”

4. Stopping the Stack
To stop all containers started by Docker Compose:

docker compose down


### 💼 For recruiters / reviewers

I built ContextFlow to practice:
- Designing a realistic RAG pipeline (Qdrant + LangChain)
- Full-stack integration (React + FastAPI + OAuth)
- Containerization with Docker Compose

If you’d like a quick walkthrough of the architecture or code, feel free to reach out at:shanuma8@asu.edu.
