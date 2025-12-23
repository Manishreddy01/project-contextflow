# project-aurora
Installation Guide

1. Clone the repository
    git clone https://github.com/ManishReddy01/project-aurora.git
    cd project-aurora

2. Setting Up the Backend (FastAPI + LangChain + Qdrant)
    cd backend
    /opt/homebrew/bin/python3.11 -m venv venv        
    # Create virtual environment
    # Windows:
    venv\Scripts\activate
    # macOS/Linux:
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    Setup Environment Variables
        Create a .env file in /backend directory:
            OPENROUTER_API_KEY=your_openrouter_key
            TAVILY_API_KEY=your_tavily_key (optional)
            QDRANT_HOST=http://localhost:6333
    Run the FastAPI Server
    python -m uvicorn main:app --reload

3. Setting Up the Frontend (React + Tailwind)
    (only if you're starting from scratch)
        npm create vite@latest frontend --template react
        # Install Tailwind CSS & its dependencies
        npm install -D tailwindcss postcss autoprefixer
        npx tailwindcss init -p 
    cd frontend
    npm install
    npm run dev
    Runs on: http://localhost:5173 
    Connecting Frontend with Backend
    // Example in frontend ChatInput.jsx
    const backendUrl = "http://localhost:8000/query/";
    You can also create a .env file in /frontend:
        VITE_BACKEND_URL=http://localhost:8000
        Then in code:
        const url = `${import.meta.env.VITE_BACKEND_URL}/query`;
4. Run Qdrant Locally (via Docker)
    Ensure Docker is installed and running.
    docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant 
        This exposes:

        Qdrant UI: http://localhost:6334

        Qdrant API: http://localhost:6333

🔁 Start Everything (Quick Recap)

# In one terminal
docker run -p 6333:6333 qdrant/qdrant

# In second terminal
cd backend
source venv/bin/activate
uvicorn main:app --reload

# In third terminal
cd frontend
npm run dev



