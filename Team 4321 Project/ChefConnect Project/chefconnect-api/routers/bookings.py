from fastapi import APIRouter, HTTPException

from mock_data import bookings

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.get("")
def get_all_bookings():
    return bookings


@router.get("/{booking_id}")
def get_booking(booking_id: int):
    booking = next((b for b in bookings if b["id"] == booking_id), None)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking
