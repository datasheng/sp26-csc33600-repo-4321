from fastapi import APIRouter, Depends
from mysql.connector.connection import MySQLConnection
from app.database import get_db
from app.schemas.auth import RegisterRequest, SignupRequest, LoginRequest, TokenResponse
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterRequest, conn: MySQLConnection = Depends(get_db)):
    return auth_service.register_user(conn, body.username, body.email, body.password, body.role)


@router.post("/signup", response_model=TokenResponse, status_code=201)
def signup(body: SignupRequest, conn: MySQLConnection = Depends(get_db)):
    # Customer-only signup (matches SignupPage.jsx frontend flow)
    username = body.name.strip().lower().replace(" ", "_")
    return auth_service.register_user(conn, username, body.email, body.password, "customer")


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, conn: MySQLConnection = Depends(get_db)):
    return auth_service.login_user(conn, body.email, body.password)
