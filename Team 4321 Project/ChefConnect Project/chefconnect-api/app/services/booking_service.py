from fastapi import HTTPException, status
from mysql.connector.connection import MySQLConnection
from app.services.payment_service import calculate_payment


def create_booking(conn: MySQLConnection, user_id: int, data) -> dict:
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT c.chef_id, c.hourly_rate, u.username AS chef_name
        FROM Chef c
        JOIN User u ON c.user_id = u.user_id
        WHERE c.chef_id = %s
        """,
        (data.chef_id,),
    )
    chef = cursor.fetchone()
    if not chef:
        cursor.close()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chef not found")

    payment = calculate_payment(chef["hourly_rate"], data.hours)

    try:
        conn.start_transaction()

        cursor.execute(
            """
            INSERT INTO Booking (user_id, chef_id, booking_datetime, location_address, custom_request)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (user_id, data.chef_id, data.booking_datetime, data.location_address, data.custom_request),
        )
        booking_id = cursor.lastrowid

        for dish_id in (data.dish_ids or []):
            cursor.execute(
                "INSERT INTO BookingDish (booking_id, dish_id) VALUES (%s, %s)",
                (booking_id, dish_id),
            )

        cursor.execute(
            """
            INSERT INTO Payment (booking_id, total_amount, platform_commission, booking_fee, payment_status)
            VALUES (%s, %s, %s, %s, 'pending')
            """,
            (booking_id, payment["total_amount"], payment["platform_commission"], payment["booking_fee"]),
        )
        payment_id = cursor.lastrowid

        conn.commit()
    except Exception:
        conn.rollback()
        cursor.close()
        raise

    cursor.close()

    return {
        "booking_id": booking_id,
        "user_id": user_id,
        "chef_id": data.chef_id,
        "chef_name": chef["chef_name"],
        "booking_datetime": data.booking_datetime,
        "location_address": data.location_address,
        "status": "pending",
        "custom_request": data.custom_request,
        "hours": data.hours,
        "hourly_rate": chef["hourly_rate"],
        "subtotal": payment["subtotal"],
        "platform_commission": payment["platform_commission"],
        "booking_fee": payment["booking_fee"],
        "total_amount": payment["total_amount"],
        "payment_id": payment_id,
        "payment_status": "pending",
    }


def get_user_bookings(conn: MySQLConnection, user_id: int) -> list:
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT b.booking_id, b.user_id, b.chef_id, u.username AS chef_name,
               b.booking_datetime, b.location_address, b.status, b.custom_request,
               p.payment_id, p.total_amount, p.platform_commission,
               p.booking_fee, p.payment_status, p.payment_date, p.payment_method
        FROM Booking b
        JOIN Chef c ON b.chef_id = c.chef_id
        JOIN User u ON c.user_id = u.user_id
        LEFT JOIN Payment p ON b.booking_id = p.booking_id
        WHERE b.user_id = %s
        ORDER BY b.booking_datetime DESC
        """,
        (user_id,),
    )
    rows = cursor.fetchall()
    cursor.close()
    return [_format_booking(r) for r in rows]


def get_chef_bookings(conn: MySQLConnection, chef_id: int) -> list:
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT b.booking_id, b.user_id, b.chef_id, u.username AS chef_name,
               b.booking_datetime, b.location_address, b.status, b.custom_request,
               p.payment_id, p.total_amount, p.platform_commission,
               p.booking_fee, p.payment_status, p.payment_date, p.payment_method
        FROM Booking b
        JOIN Chef c ON b.chef_id = c.chef_id
        JOIN User u ON c.user_id = u.user_id
        LEFT JOIN Payment p ON b.booking_id = p.booking_id
        WHERE b.chef_id = %s
        ORDER BY b.booking_datetime DESC
        """,
        (chef_id,),
    )
    rows = cursor.fetchall()
    cursor.close()
    return [_format_booking(r) for r in rows]


def get_booking_by_id(conn: MySQLConnection, booking_id: int, current_user: dict) -> dict:
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT b.booking_id, b.user_id, b.chef_id, u.username AS chef_name,
               b.booking_datetime, b.location_address, b.status, b.custom_request,
               p.payment_id, p.total_amount, p.platform_commission,
               p.booking_fee, p.payment_status, p.payment_date, p.payment_method
        FROM Booking b
        JOIN Chef c ON b.chef_id = c.chef_id
        JOIN User u ON c.user_id = u.user_id
        LEFT JOIN Payment p ON b.booking_id = p.booking_id
        WHERE b.booking_id = %s
        """,
        (booking_id,),
    )
    row = cursor.fetchone()
    cursor.close()

    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    # Verify caller owns this booking (as customer or chef)
    if current_user["role"] == "customer" and row["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if current_user["role"] == "chef":
        chef = _get_chef_for_user(conn, current_user["user_id"])
        if not chef or row["chef_id"] != chef["chef_id"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return _format_booking(row)


def update_booking_status(conn: MySQLConnection, booking_id: int, new_status: str, current_user: dict) -> dict:
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT booking_id, user_id, chef_id, status FROM Booking WHERE booking_id = %s",
        (booking_id,),
    )
    booking = cursor.fetchone()
    cursor.close()

    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    current_status = booking["status"]

    if current_user["role"] == "customer":
        if booking["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        if new_status != "cancelled":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customers can only cancel bookings")
        if current_status != "pending":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Only pending bookings can be cancelled")

    elif current_user["role"] == "chef":
        chef = _get_chef_for_user(conn, current_user["user_id"])
        if not chef or booking["chef_id"] != chef["chef_id"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

        valid_transitions = {
            "pending": ["confirmed", "cancelled"],
            "confirmed": ["completed", "cancelled"],
        }
        allowed = valid_transitions.get(current_status, [])
        if new_status not in allowed:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot move booking from '{current_status}' to '{new_status}'",
            )

    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "UPDATE Booking SET status = %s WHERE booking_id = %s",
        (new_status, booking_id),
    )
    conn.commit()
    cursor.close()

    return get_booking_by_id(conn, booking_id, current_user)


def _get_chef_for_user(conn: MySQLConnection, user_id: int):
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT chef_id FROM Chef WHERE user_id = %s", (user_id,))
    chef = cursor.fetchone()
    cursor.close()
    return chef


def _format_booking(row: dict) -> dict:
    payment = None
    if row.get("payment_id"):
        payment = {
            "payment_id": row["payment_id"],
            "booking_id": row["booking_id"],
            "total_amount": row["total_amount"],
            "platform_commission": row["platform_commission"],
            "booking_fee": row["booking_fee"],
            "payment_status": row["payment_status"],
            "payment_date": row["payment_date"],
            "payment_method": row["payment_method"],
        }
    return {
        "booking_id": row["booking_id"],
        "user_id": row["user_id"],
        "chef_id": row["chef_id"],
        "chef_name": row.get("chef_name"),
        "booking_datetime": row["booking_datetime"],
        "location_address": row["location_address"],
        "status": row["status"],
        "custom_request": row.get("custom_request"),
        "payment": payment,
    }
