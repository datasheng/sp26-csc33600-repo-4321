from fastapi import APIRouter, Depends
from mysql.connector.connection import MySQLConnection
from app.database import get_db
from app.core.dependencies import get_current_user, require_customer
from app.schemas.booking import BookingCreate, BookingCreateOut, BookingOut, BookingStatusUpdate
from app.services import booking_service

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingCreateOut, status_code=201)
def create_booking(
    body: BookingCreate,
    current_user: dict = Depends(require_customer),
    conn: MySQLConnection = Depends(get_db),
):
    return booking_service.create_booking(conn, current_user["user_id"], body)


@router.get("", response_model=list[BookingOut])
def list_bookings(
    current_user: dict = Depends(get_current_user),
    conn: MySQLConnection = Depends(get_db),
):
    if current_user["role"] == "chef":
        chef = booking_service._get_chef_for_user(conn, current_user["user_id"])
        if not chef:
            return []
        return booking_service.get_chef_bookings(conn, chef["chef_id"])
    return booking_service.get_user_bookings(conn, current_user["user_id"])


@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(
    booking_id: int,
    current_user: dict = Depends(get_current_user),
    conn: MySQLConnection = Depends(get_db),
):
    return booking_service.get_booking_by_id(conn, booking_id, current_user)


@router.patch("/{booking_id}/status", response_model=BookingOut)
def update_status(
    booking_id: int,
    body: BookingStatusUpdate,
    current_user: dict = Depends(get_current_user),
    conn: MySQLConnection = Depends(get_db),
):
    return booking_service.update_booking_status(conn, booking_id, body.status, current_user)
