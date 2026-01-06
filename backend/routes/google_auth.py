# backend/routes/google_auth.py

import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from auth.auth_jwt import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
if not GOOGLE_CLIENT_ID:
    raise RuntimeError("GOOGLE_CLIENT_ID not set in environment")


class GoogleAuthRequest(BaseModel):
    id_token: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/google", response_model=TokenResponse)
async def google_login(payload: GoogleAuthRequest):
    """
    Accepts a Google ID token from the frontend, verifies it with Google,
    and returns our own JWT (access_token).
    """
    try:
        # Verify ID token with Google
        idinfo = id_token.verify_oauth2_token(
            payload.id_token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )

        # Optional: extra safety check
        if idinfo.get("aud") != GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=400, detail="Invalid client ID")

        user_id = idinfo.get("sub")
        email = idinfo.get("email")

        if not user_id or not email:
            raise HTTPException(status_code=400, detail="Invalid token payload")

        # Create our own JWT
        access_token = create_access_token({"sub": user_id, "email": email})

        return TokenResponse(access_token=access_token)

    except Exception as e:
        print("[AUTH] Google token verification failed:", e)
        raise HTTPException(status_code=401, detail="Invalid Google token")
