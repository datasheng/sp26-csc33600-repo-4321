from fastapi import HTTPException, status
from mysql.connector.connection import MySQLConnection
from mysql.connector import IntegrityError


def create_review(conn: MySQLConnection, user_id: int, data) -> dict:
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT user_id, chef_id, status FROM Booking WHERE booking_id = %s",
        (data.booking_id,),
    )
    booking = cursor.fetchone()

    if not booking:
        cursor.close()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    if booking["user_id"] != user_id:
        cursor.close()
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This is not your booking")

    if booking["chef_id"] != data.chef_id:
        cursor.close()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Chef does not match booking")

    if booking["status"] != "completed":
        cursor.close()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Booking must be completed before leaving a review",
        )

    try:
        cursor.execute(
            "INSERT INTO Review (user_id, chef_id, rating, comment) VALUES (%s, %s, %s, %s)",
            (user_id, data.chef_id, data.rating, data.comment),
        )
        review_id = cursor.lastrowid

        cursor.execute(
            "UPDATE Chef SET rating_avg = (SELECT AVG(rating) FROM Review WHERE chef_id = %s) WHERE chef_id = %s",
            (data.chef_id, data.chef_id),
        )
        conn.commit()
    except IntegrityError:
        conn.rollback()
        cursor.close()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You have already reviewed this chef")

    cursor.execute(
        """
        SELECT r.review_id, r.chef_id, r.user_id, u.username,
               r.rating, r.comment, r.created_at
        FROM Review r
        JOIN User u ON r.user_id = u.user_id
        WHERE r.review_id = %s
        """,
        (review_id,),
    )
    review = cursor.fetchone()
    cursor.close()
    return review


def get_user_reviews(conn: MySQLConnection, user_id: int) -> list:
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT r.review_id, r.chef_id, r.user_id, u.username,
               r.rating, r.comment, r.created_at
        FROM Review r
        JOIN User u ON r.user_id = u.user_id
        WHERE r.user_id = %s
        ORDER BY r.created_at DESC
        """,
        (user_id,),
    )
    results = cursor.fetchall()
    cursor.close()
    return results
