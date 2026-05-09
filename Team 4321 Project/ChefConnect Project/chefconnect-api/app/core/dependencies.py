from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from mysql.connector.connection import MySQLConnection
from app.core.security import decode_access_token
from app.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    conn: MySQLConnection = Depends(get_db),
) -> dict:
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT user_id, username, email, role FROM User WHERE user_id = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def require_customer(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user["role"] != "customer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customers only")
    return current_user


def require_chef(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user["role"] != "chef":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Chefs only")
    return current_user
