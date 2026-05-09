from fastapi import HTTPException, status
from mysql.connector.connection import MySQLConnection
from datetime import datetime


def get_chefs(conn: MySQLConnection, cuisine_type: str = None, search: str = None) -> list:
    query = """
        SELECT c.chef_id, c.user_id, u.username, c.bio, c.specialty_cuisine,
               c.rating_avg, c.hourly_rate,
               (SELECT COUNT(*) FROM Booking b WHERE b.chef_id = c.chef_id) AS booking_count
        FROM Chef c
        JOIN User u ON c.user_id = u.user_id
    """
    params = []
    conditions = []

    if cuisine_type:
        conditions.append("c.specialty_cuisine LIKE %s")
        params.append(f"%{cuisine_type}%")

    if search:
        conditions.append("(u.username LIKE %s OR c.specialty_cuisine LIKE %s)")
        params.extend([f"%{search}%", f"%{search}%"])

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    cursor = conn.cursor(dictionary=True)
    cursor.execute(query, params)
    results = cursor.fetchall()
    cursor.close()
    return results


def get_chef_by_id(conn: MySQLConnection, chef_id: int) -> dict:
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT c.chef_id, c.user_id, u.username, c.bio, c.specialty_cuisine,
               c.rating_avg, c.hourly_rate,
               (SELECT COUNT(*) FROM Booking b WHERE b.chef_id = c.chef_id) AS booking_count
        FROM Chef c
        JOIN User u ON c.user_id = u.user_id
        WHERE c.chef_id = %s
        """,
        (chef_id,),
    )
    chef = cursor.fetchone()
    cursor.close()

    if not chef:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chef not found")
    return chef


def get_chef_availability(conn: MySQLConnection, chef_id: int) -> list:
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT availability_id, chef_id, start_time, end_time FROM ChefAvailability WHERE chef_id = %s ORDER BY start_time",
        (chef_id,),
    )
    results = cursor.fetchall()
    cursor.close()
    return results


def get_chef_reviews(conn: MySQLConnection, chef_id: int) -> list:
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT r.review_id, r.chef_id, r.user_id, u.username,
               r.rating, r.comment, r.created_at
        FROM Review r
        JOIN User u ON r.user_id = u.user_id
        WHERE r.chef_id = %s
        ORDER BY r.created_at DESC
        """,
        (chef_id,),
    )
    results = cursor.fetchall()
    cursor.close()
    return results


def update_chef_profile(conn: MySQLConnection, chef_id: int, requesting_user: dict, data: dict) -> dict:
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT user_id FROM Chef WHERE chef_id = %s", (chef_id,))
    chef = cursor.fetchone()

    if not chef:
        cursor.close()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chef not found")

    if chef["user_id"] != requesting_user["user_id"]:
        cursor.close()
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only edit your own profile")

    fields = {k: v for k, v in data.items() if v is not None}
    if not fields:
        cursor.close()
        return get_chef_by_id(conn, chef_id)

    set_clause = ", ".join(f"{k} = %s" for k in fields)
    cursor.execute(
        f"UPDATE Chef SET {set_clause} WHERE chef_id = %s",
        (*fields.values(), chef_id),
    )
    conn.commit()
    cursor.close()
    return get_chef_by_id(conn, chef_id)


def add_availability(conn: MySQLConnection, chef_id: int, requesting_user: dict, start_time: datetime, end_time: datetime) -> dict:
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT user_id FROM Chef WHERE chef_id = %s", (chef_id,))
    chef = cursor.fetchone()

    if not chef:
        cursor.close()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chef not found")

    if chef["user_id"] != requesting_user["user_id"]:
        cursor.close()
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only manage your own availability")

    cursor.execute(
        "INSERT INTO ChefAvailability (chef_id, start_time, end_time) VALUES (%s, %s, %s)",
        (chef_id, start_time, end_time),
    )
    avail_id = cursor.lastrowid
    conn.commit()
    cursor.close()
    return {"availability_id": avail_id, "chef_id": chef_id, "start_time": start_time, "end_time": end_time}


def delete_availability(conn: MySQLConnection, chef_id: int, avail_id: int, requesting_user: dict) -> None:
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT ca.availability_id, c.user_id FROM ChefAvailability ca JOIN Chef c ON ca.chef_id = c.chef_id WHERE ca.availability_id = %s AND ca.chef_id = %s",
        (avail_id, chef_id),
    )
    row = cursor.fetchone()

    if not row:
        cursor.close()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Availability slot not found")

    if row["user_id"] != requesting_user["user_id"]:
        cursor.close()
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only manage your own availability")

    cursor.execute("DELETE FROM ChefAvailability WHERE availability_id = %s", (avail_id,))
    conn.commit()
    cursor.close()
