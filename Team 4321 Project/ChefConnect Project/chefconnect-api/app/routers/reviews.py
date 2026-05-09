from fastapi import APIRouter, Depends
from mysql.connector.connection import MySQLConnection
from app.database import get_db
from app.core.dependencies import require_customer
from app.schemas.review import ReviewCreate, ReviewOut
from app.services import review_service

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("", response_model=ReviewOut, status_code=201)
def create_review(
    body: ReviewCreate,
    current_user: dict = Depends(require_customer),
    conn: MySQLConnection = Depends(get_db),
):
    return review_service.create_review(conn, current_user["user_id"], body)


@router.get("", response_model=list[ReviewOut])
def my_reviews(
    current_user: dict = Depends(require_customer),
    conn: MySQLConnection = Depends(get_db),
):
    return review_service.get_user_reviews(conn, current_user["user_id"])
