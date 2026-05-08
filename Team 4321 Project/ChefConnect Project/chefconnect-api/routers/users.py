from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from mock_data import users

router = APIRouter(prefix="/users", tags=["users"])


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
def login(credentials: LoginRequest):
    user = next(
        (u for u in users if u["email"] == credentials.email and u["password"] == credentials.password),
        None,
    )
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {
        "message": "Login successful",
        "user": {k: v for k, v in user.items() if k != "password"},
    }
