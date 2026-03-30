<div align="center">

# 🧠 ContextFlow

### AI-Powered Document Assistant — Private, Local, and Production-Ready

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![LangChain](https://img.shields.io/badge/LangChain-RAG-1C3C3C?style=for-the-badge&logo=chainlink&logoColor=white)](https://langchain.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**Upload your documents. Ask anything. Get grounded, private answers — no data leaves your machine.**

[🚀 Run Locally](#-run-locally-with-docker) · [🧱 Tech Stack](#-tech-stack) · [✨ Features](#-features) · [👔 For Recruiters](#-for-recruiters--reviewers)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **Document Upload** | Supports PDF, PPTX, and TXT files |
| 💬 **Natural Language Q&A** | Ask questions about your documents in plain English |
| 🔍 **RAG Pipeline** | Retrieval-Augmented Generation via Qdrant + LangChain |
| 🌐 **Web Search Fallback** | Powered by Tavily when no local context is found |
| 🔐 **Google OAuth** | Secure sign-in with JWT-based session management |
| 🐳 **One-Command Setup** | Fully containerized with Docker Compose |
| 🎨 **Polished UI** | React + Tailwind + Framer Motion for smooth interactions |

---

## 🧱 Tech Stack

### Frontend
- **React** (Vite) — fast, modern UI tooling
- **Tailwind CSS** — utility-first styling
- **Framer Motion** — smooth animations

### Backend
- **FastAPI** (Python) — high-performance async API
- **LangChain** — RAG orchestration and LLM chaining
- **OpenRouter** — unified LLM API gateway
- **HuggingFace** — sentence transformer embeddings

### Infrastructure
- **Qdrant** — vector database (runs in its own container)
- **Docker & Docker Compose** — one-command local deployment
- **Google OAuth** — authentication
- **Tavily** — web search fallback

---

## 🚀 Run Locally with Docker

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- API keys for: OpenRouter, HuggingFace, Tavily, and Google OAuth

### 1. Clone the Repository

```bash
git clone https://github.com/Manishreddy01/project-contextflow.git
cd project-contextflow
```

### 2. Configure Backend Environment Variables

```bash
cd backend
touch .env
```

Populate `backend/.env` with your keys:

```env
# LLM & Embeddings
OPENROUTER_API_KEY=your_openrouter_key
HUGGINGFACEHUB_API_TOKEN=your_huggingface_token
OPENAI_API_KEY=your_openai_key_optional

# Qdrant (uses Docker Compose service name)
QDRANT_URL=http://qdrant:6333

# Web Search
TAVILY_API_KEY=your_tavily_key

# Google OAuth & JWT
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET_KEY=some-secret-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS
FRONTEND_ORIGIN=http://localhost:5173
```

> `.env` is in `.gitignore` and will never be committed.

### 3. Start the Stack

```bash
cd ..
docker compose up --build
```

This spins up three services:

| Service | Port |
|---|---|
| **Qdrant** (vector DB) | `6333` |
| **Backend** (FastAPI) | `8000` |
| **Frontend** (React) | `5173` |

Open **http://localhost:5173** in your browser. You can now:

- 🔑 Sign in with Google
- 💬 Start a new chat
- 📎 Upload documents via the `+` button
- 🤔 Ask questions like *"Summarize this file"* or *"What are the key points?"*

### 4. Stop the Stack

```bash
docker compose down
```

---

## 🗂️ Project Structure

```
project-contextflow/
├── backend/           # FastAPI app — RAG pipeline, auth, vector search
├── frontend/          # React + Vite app — chat UI, file upload
├── qdrant_storage/    # Persisted vector data
├── docker-compose.yml # Orchestrates all three services
└── .gitignore
```

---

## 👔 For Recruiters & Reviewers

I built ContextFlow to demonstrate real-world, production-style engineering skills:

- **RAG Pipeline Design** — Qdrant vector store + LangChain + sentence transformer embeddings
- **Full-Stack Integration** — React frontend talking to a FastAPI backend with Google OAuth
- **DevOps / Containerization** — Multi-service Docker Compose setup with persistent storage
- **Clean UX** — Framer Motion animations, Tailwind styling, and an intuitive chat interface

📬 Want a walkthrough of the architecture or codebase? Reach out at **mponnapa@asu.edu**

---

<div align="center">

Built with ❤️ by [Manishreddy01](https://github.com/Manishreddy01) · [saisravyaa](https://github.com/saisravyaa) · [kartheekpanyam](https://github.com/kartheekpanyam)

</div>
