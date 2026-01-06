# backend/routes/conversations.py

from fastapi import APIRouter
from pydantic import BaseModel
from uuid import uuid4

router = APIRouter()

class ConversationResponse(BaseModel):
    conversationId: str

@router.post("/conversations", response_model=ConversationResponse)
def create_conversation():
    """
    Minimal endpoint to satisfy frontend's POST /conversations.
    Right now we just return a fresh UUID. Frontend can ignore
    this if it's already generating IDs locally.
    """
    return ConversationResponse(conversationId=str(uuid4()))
