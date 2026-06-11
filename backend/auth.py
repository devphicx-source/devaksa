"""
Devaksa Backend — JWT Authentication
Replaces the auth() middleware from server.js.
Uses FastAPI's Depends() system instead of Express next().
"""

import jwt
from fastapi import HTTPException, Header
from typing import Optional
from config import JWT_SECRET, JWT_ALGORITHM


async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """
    FastAPI dependency that extracts and verifies the JWT token
    from the Authorization header.

    Replaces:
        function auth(req, res, next) {
            const token = req.headers['authorization']?.split(' ')[1];
            jwt.verify(token, process.env.JWT_SECRET, (err, user) => { ... });
        }
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        # Extract token from "Bearer <token>"
        scheme, _, token = authorization.partition(" ")
        if scheme.lower() != "bearer" or not token:
            raise HTTPException(status_code=401, detail="Invalid auth header")

        # Verify token (same secret and algorithm as Node.js)
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload  # Contains { "id": "<user_id>", "iat": ..., "exp": ... }

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=403, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=403, detail="Invalid token")
