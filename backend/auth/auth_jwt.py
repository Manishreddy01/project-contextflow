# backend/auth/auth_jwt.py

import os
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from pydantic import BaseModel
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# ----------------- CONFIG -----------------
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)
# ------------------------------------------


class TokenData(BaseModel):
    sub: str
    email: Optional[str] = None


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a signed JWT with user data (sub/email) and expiry.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# This is used by FastAPI's dependency system to extract the Bearer token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/google")


def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenData:
    """
    Decode the JWT and return user info.
    Used as Depends(get_current_user) on protected routes.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub: str = payload.get("sub")
        email: str = payload.get("email")

        if sub is None:
            raise credentials_exception

        return TokenData(sub=sub, email=email)
    except JWTError:
        raise credentials_exception
