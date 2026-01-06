# backend/routes/auth.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
import os

router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


class GoogleAuthPayload(BaseModel):
    credential: str | None = None


class UserInfo(BaseModel):
    email: str
    name: str | None = None


class AuthResponse(BaseModel):
    access_token: str
    user: UserInfo


@router.post("/auth/google", response_model=AuthResponse)
async def auth_google(payload: GoogleAuthPayload):
    """
    Verify Google ID token sent from frontend.
    Frontend sends JSON: { "credential": "<google_id_token>" }
    """
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_CLIENT_ID not configured on server",
        )

    if not payload.credential:
        raise HTTPException(status_code=400, detail="Missing Google credential")

    try:
        idinfo = id_token.verify_oauth2_token(
            payload.credential,
            requests.Request(),
            GOOGLE_CLIENT_ID,
        )

        email = idinfo.get("email")
        name = idinfo.get("name") or idinfo.get("given_name")

        if not email:
            raise HTTPException(status_code=400, detail="No email in Google token")

        # For now we just reuse the ID token as our "access token"
        return AuthResponse(
            access_token=payload.credential,
            user=UserInfo(email=email, name=name),
        )

    except ValueError as e:
        # Google verification failed
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {e}")
