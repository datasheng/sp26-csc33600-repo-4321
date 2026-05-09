from fastapi import HTTPException, status
from mysql.connector.connection import MySQLConnection
from app.core.security import hash_password, verify_password, create_access_token


def register_user(conn: MySQLConnection, username: str, email: str, password: str, role: str) -> dict:
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT user_id FROM User WHERE email = %s", (email,))
    if cursor.fetchone():
        cursor.close()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")

    cursor.execute("SELECT user_id FROM User WHERE username = %s", (username,))
    if cursor.fetchone():
        cursor.close()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

    cursor.execute(
        "INSERT INTO User (username, email, password_hash, role) VALUES (%s, %s, %s, %s)",
        (username, email, hash_password(password), role),
    )
    user_id = cursor.lastrowid

    if role == "chef":
        cursor.execute(
            "INSERT INTO Chef (user_id, bio, specialty_cuisine) VALUES (%s, %s, %s)",
            (user_id, "", ""),
        )

    conn.commit()
    cursor.close()

    token = create_access_token({"sub": str(user_id), "role": role})
    return {"access_token": token, "token_type": "bearer", "role": role, "user_id": user_id}


def login_user(conn: MySQLConnection, email: str, password: str) -> dict:
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT user_id, password_hash, role FROM User WHERE email = %s", (email,)
    )
    user = cursor.fetchone()
    cursor.close()

    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token({"sub": str(user["user_id"]), "role": user["role"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"],
        "user_id": user["user_id"],
    }
