import os
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from routes.upload import router as uploadRouter
from routes.query import router as queryRouter
from fastapi.middleware.cors import CORSMiddleware
from routes import conversations
from routes.auth import router as auth_router

app = FastAPI()
# CORS setup — update this with actual frontend URL if known
base_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Optional: extra origin from env (for deployed frontend)
extra_origin = os.getenv("FRONTEND_ORIGIN")

allow_origins = base_origins.copy()
if extra_origin and extra_origin not in allow_origins:
    allow_origins.append(extra_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(uploadRouter, prefix="/upload")
app.include_router(queryRouter, prefix="/query")
app.include_router(auth_router)


@app.get("/health")
async def health_check():
    return { "status": "ok" }
