"""
Run from the chefconnect-api directory:
  python seed.py

Inserts the 6 mock chefs (matching chefs.js), their dishes, availability,
and one test customer. Safe to re-run — skips existing rows by email.
"""

import os
from datetime import datetime, date, timedelta
from dotenv import load_dotenv
import mysql.connector
from passlib.context import CryptContext

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hp(plain: str) -> str:
    return pwd_context.hash(plain)


conn = mysql.connector.connect(
    host=os.getenv("DB_HOST", "localhost"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", ""),
    database=os.getenv("DB_NAME", "chefconnect"),
)
cur = conn.cursor(dictionary=True)

# ── Base week: Mon 11 May 2026 ──────────────────────────────────────────────
BASE = date(2026, 5, 11)
DAY = {"Mon": 0, "Tue": 1, "Wed": 2, "Thu": 3, "Fri": 4, "Sat": 5, "Sun": 6}

HOURS = {
    "4–9pm":     (16, 21),
    "3–10pm":    (15, 22),
    "5–10pm":    (17, 22),
    "5–11pm":    (17, 23),
    "5–9pm":     (17, 21),
    "6–10pm":    (18, 22),
    "6–11pm":    (18, 23),
    "12–7pm":    (12, 19),
    "12–9pm":    (12, 21),
    "11am–9pm":  (11, 21),
    "All day":   (10, 22),
}


def dt(day_name: str, start_h: int) -> datetime:
    d = BASE + timedelta(days=DAY[day_name])
    return datetime(d.year, d.month, d.day, start_h, 0, 0)


def insert_user(username, email, password, role):
    cur.execute("SELECT user_id FROM User WHERE email = %s", (email,))
    row = cur.fetchone()
    if row:
        print(f"  skip user {email} (exists)")
        return row["user_id"]
    cur.execute(
        "INSERT INTO User (username, email, password_hash, role) VALUES (%s,%s,%s,%s)",
        (username, email, hp(password), role),
    )
    conn.commit()
    return cur.lastrowid


def insert_chef(user_id, bio, specialty, rate, rating):
    cur.execute("SELECT chef_id FROM Chef WHERE user_id = %s", (user_id,))
    row = cur.fetchone()
    if row:
        return row["chef_id"]
    cur.execute(
        "INSERT INTO Chef (user_id, bio, specialty_cuisine, rating_avg, hourly_rate) VALUES (%s,%s,%s,%s,%s)",
        (user_id, bio, specialty, rating, rate),
    )
    conn.commit()
    return cur.lastrowid


def insert_availability(chef_id, schedule):
    cur.execute("SELECT COUNT(*) AS c FROM ChefAvailability WHERE chef_id = %s", (chef_id,))
    if cur.fetchone()["c"] > 0:
        print(f"  skip availability for chef {chef_id} (exists)")
        return
    for day, hours_str in schedule:
        if not hours_str:
            continue
        start_h, end_h = HOURS[hours_str]
        cur.execute(
            "INSERT INTO ChefAvailability (chef_id, start_time, end_time) VALUES (%s,%s,%s)",
            (chef_id, dt(day, start_h), dt(day, end_h)),
        )
    conn.commit()


def insert_dishes(chef_id, dishes, cuisine_type):
    for name in dishes:
        cur.execute("SELECT dish_id FROM Dish WHERE name = %s", (name,))
        row = cur.fetchone()
        if not row:
            cur.execute(
                "INSERT INTO Dish (name, cuisine_type) VALUES (%s,%s)",
                (name, cuisine_type),
            )
    conn.commit()


# ── Chefs ───────────────────────────────────────────────────────────────────
print("Seeding chefs...")

# 1. Anika Osei
uid = insert_user("Anika Osei", "anika@chefconnect.dev", "password123", "chef")
cid = insert_chef(uid,
    "I grew up cooking West African and Caribbean food with my grandmother. "
    "I specialise in Jollof, Egusi soup, Ackee & Saltfish, Oxtail, and can work "
    "with whatever ingredients you already have at home.",
    "West African, Caribbean", 85.00, 4.9)
insert_availability(cid, [
    ("Mon", None), ("Tue", "4–9pm"), ("Wed", "4–9pm"),
    ("Thu", None), ("Fri", "3–10pm"), ("Sat", "All day"), ("Sun", "12–7pm"),
])
insert_dishes(cid, ["Jollof Rice", "Egusi Soup", "Ackee & Saltfish",
                    "Oxtail Stew", "Suya Skewers", "Puff Puff"], "West African")

# 2. Marco Ferretti
uid = insert_user("Marco Ferretti", "marco@chefconnect.dev", "password123", "chef")
cid = insert_chef(uid,
    "Trained in Bologna, I bring a slow-food approach to handmade pasta, "
    "regional Italian classics, and Mediterranean fish dishes.",
    "Italian, Mediterranean", 110.00, 4.8)
insert_availability(cid, [
    ("Mon", "5–10pm"), ("Tue", "5–10pm"), ("Wed", None),
    ("Thu", "5–10pm"), ("Fri", "5–11pm"), ("Sat", "All day"), ("Sun", "12–9pm"),
])
insert_dishes(cid, ["Tagliatelle al Ragù", "Cacio e Pepe", "Saltimbocca",
                    "Branzino al Forno", "Tiramisù", "Focaccia di Recco"], "Italian")

# 3. Priya Nair
uid = insert_user("Priya Nair", "priya@chefconnect.dev", "password123", "chef")
cid = insert_chef(uid,
    "Kerala-born, NYC-based. I cook the way my mother and aunts taught me — "
    "coconut, curry leaves, tamarind, and proper masala technique.",
    "Indian, South Asian, Vegan", 70.00, 4.7)
insert_availability(cid, [
    ("Mon", "5–9pm"), ("Tue", None), ("Wed", "5–9pm"),
    ("Thu", "5–9pm"), ("Fri", None), ("Sat", "11am–9pm"), ("Sun", "11am–9pm"),
])
insert_dishes(cid, ["Kerala Fish Curry", "Masala Dosa", "Chana Masala",
                    "Vegan Biryani", "Paneer Butter Masala", "Gulab Jamun"], "Indian")

# 4. Kwame Asante
uid = insert_user("Kwame Asante", "kwame@chefconnect.dev", "password123", "chef")
cid = insert_chef(uid,
    "Born in Kumasi, raised between Accra and the Bronx. I cook Ghanaian classics "
    "with the smoky, spiced edge they're meant to have.",
    "Ghanaian", 90.00, 5.0)
insert_availability(cid, [
    ("Mon", None), ("Tue", None), ("Wed", "5–10pm"),
    ("Thu", "5–10pm"), ("Fri", "5–11pm"), ("Sat", "All day"), ("Sun", "12–9pm"),
])
insert_dishes(cid, ["Ghanaian Jollof Rice", "Waakye", "Banku & Tilapia",
                    "Kelewele", "Red Red", "Chichinga Skewers"], "Ghanaian")

# 5. Yuki Tanaka
uid = insert_user("Yuki Tanaka", "yuki@chefconnect.dev", "password123", "chef")
cid = insert_chef(uid,
    "Trained for seven years in Tokyo before moving to New York. I do quiet, "
    "precise omakase dinners in your home — sushi, sashimi, small seasonal courses.",
    "Japanese, Omakase, Sushi", 150.00, 4.9)
insert_availability(cid, [
    ("Mon", None), ("Tue", "6–10pm"), ("Wed", "6–10pm"),
    ("Thu", "6–10pm"), ("Fri", "6–11pm"), ("Sat", "5–11pm"), ("Sun", None),
])
insert_dishes(cid, ["Edomae Sushi", "Chirashi", "Agedashi Tofu",
                    "Miso Black Cod", "Wagyu Tataki", "Matcha Mochi"], "Japanese")

# 6. Diego Vargas
uid = insert_user("Diego Vargas", "diego@chefconnect.dev", "password123", "chef")
cid = insert_chef(uid,
    "Half Mexican, half Colombian, all New Yorker. I cook from both sides of my "
    "family — fresh tortillas, slow moles, arepas, sancocho.",
    "Mexican, Colombian", 95.00, 4.8)
insert_availability(cid, [
    ("Mon", "5–10pm"), ("Tue", "5–10pm"), ("Wed", None),
    ("Thu", "5–10pm"), ("Fri", "5–11pm"), ("Sat", "All day"), ("Sun", "12–9pm"),
])
insert_dishes(cid, ["Mole Poblano", "Arepas con Queso", "Sancocho",
                    "Tacos al Pastor", "Bandeja Paisa", "Tres Leches"], "Mexican")

# ── Test customer ────────────────────────────────────────────────────────────
print("Seeding test customer...")
insert_user("David M.", "david@test.com", "password123", "customer")

cur.close()
conn.close()
print("Done. Database seeded successfully.")
