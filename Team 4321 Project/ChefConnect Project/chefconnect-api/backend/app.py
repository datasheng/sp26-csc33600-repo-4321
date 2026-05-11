from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
import bcrypt

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    return mysql.connector.connect(
        host="127.0.0.1",
        port=3307,
        user="ccuser",
        password="cc123!",
        database="chefconnection_db"
    )

@app.get("/")
def home():
    return {"message": "Welcome to Chef Connection!"}

@app.get("/roles")
def get_roles():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Role")
    roles = cursor.fetchall()
    cursor.close()
    conn.close()
    return {"roles": roles}

@app.get("/users")
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM User")
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    return {"users": users}


@app.get("/bookings")
def get_bookings():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Booking")
    bookings = cursor.fetchall()
    cursor.close()
    conn.close()
    return {"bookings": bookings}

@app.post("/register")
def register_user(
    username: str,
    email: str,
    password_hash: str,
    role: str,
    card_number: str = None,
    card_holder: str = None,
    exp_month: str = None,
    exp_year: str = None,
    cvv: str = None,
    billing_zip: str = None,
    account_holder: str = None,
    routing_number: str = None,
    account_number: str = None,
    bank_name: str = None,
):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Determine role_id based on role name
    if role.lower().strip() == "chef":
        role_id = 2
    else:
        role_id = 3

    user_sql = """
    INSERT INTO User (username, email, password_hash, role_id)
    VALUES (%s, %s, %s, %s)
    """

    hashed = bcrypt.hashpw(password_hash.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    cursor.execute(user_sql, (username, email, hashed, role_id))
    conn.commit()

    user_id = cursor.lastrowid

    if role.lower().strip() == "chef":
        # Insert chef row
        cursor.execute("INSERT INTO Chef (user_id) VALUES (%s)", (user_id,))
        conn.commit()
        chef_id = cursor.lastrowid

        # If chef sent payout info, save it
        if account_holder and routing_number and account_number:
            payout_sql = """
            INSERT INTO ChefPayout
            (chef_id, account_holder, routing_number, account_number, bank_name)
            VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(payout_sql, (chef_id, account_holder, routing_number, account_number, bank_name))
            conn.commit()
    else:
        # If customer sent card info, save it
        if card_number and card_holder and exp_month and exp_year and cvv:
            card_sql = """
            INSERT INTO UserPaymentMethod
            (user_id, card_number, card_holder, exp_month, exp_year, cvv, billing_zip)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(card_sql, (user_id, card_number, card_holder, exp_month, exp_year, cvv, billing_zip))
            conn.commit()

    cursor.close()
    conn.close()
    return {"message": "User registered successfully!", "user_id": user_id, "role_id": role_id}


@app.post("/login")
def login(username: str, password: str):

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    login_sql = """
    SELECT
    u.user_id, u.username, u.email, u.password_hash, r.role_name
    FROM User u
    JOIN Role r ON u.role_id = r.role_id
    WHERE u.username = %s
    """

    cursor.execute(login_sql, (username,))

    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        return {"message": "Invalid username or password"}

    del user['password_hash']
    return {"message": "Login successful!", "user": user}


@app.get("/chefs")
def get_chefs():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    chef_sql = """
    SELECT
        Chef.chef_id,
        User.username,
        Chef.bio,
        Chef.specialty,
        Chef.rating,
        CASE
            WHEN ChefMembership.end_date >= CURDATE() THEN 1
            ELSE 0
        END AS has_membership,

        (
            Chef.rating +
            CASE
                WHEN ChefMembership.end_date >= CURDATE() THEN 0.5
                ELSE 0
            END
        ) AS ranking_score

    FROM Chef
    JOIN User ON Chef.user_id = User.user_id
    LEFT JOIN ChefMembership ON Chef.chef_id = ChefMembership.chef_id

    ORDER BY ranking_score DESC;
    """
    cursor.execute(chef_sql)
    chefs = cursor.fetchall()
    cursor.close()
    conn.close()
    return {"chefs": chefs}

@app.put("/chefs/{chef_id}/profile")
def update_chef_profile(
    chef_id: int,
    user_id: int,
    bio: str = None,
    specialty: str = None
    ):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT chef_id FROM Chef WHERE chef_id = %s AND user_id = %s", (chef_id, user_id))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        return {"error": "Unauthorized: you do not own this chef profile"}

    sql = """
    UPDATE Chef
    SET bio = %s,
        specialty = %s
    WHERE chef_id = %s
    """

    cursor.execute(sql, (bio, specialty, chef_id))
    conn.commit()

    cursor.close()
    conn.close()
    return {"message": "Chef profile updated successfully!"}

@app.post("/chefs/{chef_id}/availability")
def add_chef_availability(
    chef_id: int,
    user_id: int,
    day_of_week: str,
    start_time: str,
    end_time: str
):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT chef_id FROM Chef WHERE chef_id = %s AND user_id = %s", (chef_id, user_id))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        return {"error": "Unauthorized: you do not own this chef profile"}

    check_sql = """
    SELECT *
    FROM ChefAvailability
    WHERE chef_id = %s 
    AND day_of_week = %s 
    AND ((start_time <= %s AND end_time > %s) 
    OR (start_time < %s AND end_time >= %s) 
    OR (start_time >= %s AND end_time <= %s))
    """
    cursor.execute(check_sql, (chef_id, day_of_week, start_time, start_time, end_time, end_time, start_time, end_time))
    existing = cursor.fetchone()
    if existing:
        cursor.close()
        conn.close()
        return {"message": "This time slot overlaps with existing availability."}
    
    insert_sql = """
    INSERT INTO ChefAvailability 
    (chef_id, day_of_week, start_time, end_time)
    VALUES (%s, %s, %s, %s)
    """

    cursor.execute(insert_sql,(chef_id, day_of_week, start_time, end_time))
    conn.commit()

    cursor.close()
    conn.close()
    return {"message": "Chef availability added successfully!"} 

@app.get("/chefs/{chef_id}/availability")
def get_chef_availability(chef_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
    SELECT availability_id, chef_id, day_of_week, start_time, end_time
    FROM ChefAvailability
    WHERE chef_id = %s
    ORDER BY FIELD(day_of_week, 
        'Monday','Tuesday','Wednesday',
        'Thursday','Friday','Saturday','Sunday')
    """

    cursor.execute(sql, (chef_id,))
    availability = cursor.fetchall()

    cursor.close()
    conn.close()
    return {"availability": availability}

@app.post("/bookings")
def create_booking(
    chef_id: int,
    user_id: int,
    booking_date: str,
    booking_time: str,
    customer_requests: str = None,
    total_amount: float = 0.0,  # accept total from frontend
):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    check_sql = """
    SELECT *
    FROM Booking
    WHERE chef_id = %s
    AND booking_date = %s
    AND booking_time = %s
    AND status IN ('pending', 'confirmed')
    """
    cursor.execute(check_sql, (chef_id, booking_date, booking_time))
    existing = cursor.fetchone()

    if existing:
        cursor.close()
        conn.close()
        return {"message": "This time slot is already booked."}

    # CHANGED: added total_amount column to insert
    booking_sql = """
    INSERT INTO Booking
    (chef_id, user_id, booking_date, booking_time, status, customer_requests, total_amount)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    """

    cursor.execute(booking_sql, (chef_id, user_id, booking_date, booking_time, "pending", customer_requests, total_amount))
    conn.commit()

    booking_id = cursor.lastrowid

    cursor.close()
    conn.close()
    return {"message": "Booking created successfully!", "booking_id": booking_id, "status": "pending"
    }


@app.put("/bookings/{booking_id}/status")
def update_booking_status(booking_id: int, status: str, user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    allowed_statuses = ["pending", "accepted", "declined", "cancelled", "completed"]

    if status not in allowed_statuses:
        cursor.close()
        conn.close()
        return {"message": "Invalid status. Please choose from: pending, accepted, declined, cancelled, completed"}

    if status == "cancelled":
        cursor.execute(
            "SELECT booking_id FROM Booking WHERE booking_id = %s AND user_id = %s",
            (booking_id, user_id)
        )
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return {"error": "Unauthorized: you cannot cancel this booking"}
    else:
        cursor.execute(
            """SELECT b.booking_id FROM Booking b
               JOIN Chef c ON b.chef_id = c.chef_id
               WHERE b.booking_id = %s AND c.user_id = %s""",
            (booking_id, user_id)
        )
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return {"error": "Unauthorized: you are not the chef for this booking"}

    sql = """
    UPDATE Booking
    SET status = %s
    WHERE booking_id = %s
    """

    cursor.execute(sql, (status, booking_id))
    conn.commit()

    cursor.close()
    conn.close()
    return {"message": "Booking status updated successfully!",
            "booking_id": booking_id,
            "new_status": status
            }

@app.get("/users/{user_id}/bookings")
def get_user_bookings(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # The procedure auto-computes "completed" status if the booking time has passed
    cursor.callproc("GetUserBookingsWithStatus", (user_id,))

    bookings = []
    for result in cursor.stored_results():
        bookings = result.fetchall()

    cursor.close()
    conn.close()
    return {"bookings": bookings}

@app.get("/users/{user_id}/pantry")
def get_user_pantry(user_id: int):
    """NEW: list a user's pantry ingredients"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
    SELECT pantry_id, ingredient_name, quantity, added_at
    FROM UserPantry
    WHERE user_id = %s
    ORDER BY added_at DESC
    """
    cursor.execute(sql, (user_id,))
    items = cursor.fetchall()

    cursor.close()
    conn.close()
    return {"pantry": items}


@app.post("/users/{user_id}/pantry")
def add_pantry_item(user_id: int, ingredient_name: str, quantity: str = None):
    """NEW: add an ingredient to user's pantry"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        sql = """
        INSERT INTO UserPantry (user_id, ingredient_name, quantity)
        VALUES (%s, %s, %s)
        """
        cursor.execute(sql, (user_id, ingredient_name.strip(), quantity))
        conn.commit()
        new_id = cursor.lastrowid
        return {"message": "Ingredient added!", "pantry_id": new_id}
    except mysql.connector.Error as e:
        conn.rollback()
        return {"detail": f"Could not add ingredient: {str(e)}"}
    finally:
        cursor.close()
        conn.close()


@app.delete("/users/{user_id}/pantry/{pantry_id}")
def delete_pantry_item(user_id: int, pantry_id: int):
    """NEW: remove an ingredient from user's pantry"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Make sure the row belongs to this user (basic auth check)
    cursor.execute(
        "SELECT pantry_id FROM UserPantry WHERE pantry_id = %s AND user_id = %s",
        (pantry_id, user_id)
    )
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        return {"detail": "Ingredient not found in your pantry."}

    cursor.execute("DELETE FROM UserPantry WHERE pantry_id = %s", (pantry_id,))
    conn.commit()

    cursor.close()
    conn.close()
    return {"message": "Ingredient removed."}

@app.get("/users/{user_id}/payment-methods")
def get_user_payment_methods(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
    SELECT
        payment_method_id AS id,
        CONCAT('Card') AS brand,
        RIGHT(card_number, 4) AS last4,
        CONCAT(exp_month, '/', RIGHT(exp_year, 2)) AS exp,
        card_holder,
        billing_zip,
        1 AS isDefault
    FROM UserPaymentMethod
    WHERE user_id = %s
    """
    cursor.execute(sql, (user_id,))
    methods = cursor.fetchall()

    cursor.close()
    conn.close()
    return {"payment_methods": methods}

@app.get("/chefs/{chef_id}/bookings")
def get_chef_bookings(chef_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # CHANGED: now uses stored procedure GetChefBookingsWithStatus
    cursor.callproc("GetChefBookingsWithStatus", (chef_id,))

    bookings = []
    for result in cursor.stored_results():
        bookings = result.fetchall()

    cursor.close()
    conn.close()
    return {"bookings": bookings}

@app.post("/reviews")
def create_review(
    chef_id: int,
    user_id: int,
    rating: int,
    comment: str = None
):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    review_sql = """
    INSERT INTO Review 
    (chef_id, user_id, rating, comment)
    VALUES (%s, %s, %s, %s)
    """

    cursor.execute(review_sql, (chef_id, user_id, rating, comment))

    update_sql = """
    UPDATE Chef
    SET rating = (
        SELECT AVG(rating) 
        FROM Review 
        WHERE chef_id = %s
    )
    WHERE chef_id = %s
    """
    cursor.execute(update_sql, (chef_id, chef_id))
    conn.commit()

    cursor.close()
    conn.close()
    return {"message": "Review submitted successfully!"}

@app.get("/chefs/{chef_id}/reviews")
def get_chef_reviews(chef_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
    SELECT 
        r.review_id, 
        r.rating, 
        r.comment, 
        r.created_at,
        u.username AS reviewer_name
    FROM Review r
    JOIN User u ON r.user_id = u.user_id
    WHERE r.chef_id = %s
    ORDER BY r.created_at DESC
    """

    cursor.execute(sql, (chef_id,))
    reviews = cursor.fetchall()

    cursor.close()
    conn.close()
    return {"reviews": reviews}

@app.get("/users/{user_id}/reviews")
def get_user_reviews(user_id: int):
    """NEW: returns all reviews a customer has written"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
    SELECT
        r.review_id,
        r.chef_id,
        r.rating,
        r.comment,
        r.created_at,
        u.username AS chef_name
    FROM Review r
    JOIN Chef c ON r.chef_id = c.chef_id
    JOIN User u ON c.user_id = u.user_id
    WHERE r.user_id = %s
    ORDER BY r.created_at DESC
    """

    cursor.execute(sql, (user_id,))
    reviews = cursor.fetchall()

    cursor.close()
    conn.close()
    return {"reviews": reviews}

@app.post("/chefs/{chef_id}/dishes")
def add_chef_dish(
    chef_id: int,
    dish_name: str,
    description: str = None,
    price: float = None
):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
    INSERT INTO Dish 
    (chef_id, dish_name, description, price)
    VALUES (%s, %s, %s, %s)
    """

    cursor.execute(sql, (chef_id, dish_name, description, price))
    conn.commit()

    dish_id = cursor.lastrowid

    cursor.close()
    conn.close()
    return {"message": "Dish added to chef's menu successfully!", "dish_id": dish_id}

@app.get("/chefs/{chef_id}/dishes")
def get_chef_dishes(chef_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
    SELECT *
    FROM Dish
    WHERE chef_id = %s
    """

    cursor.execute(sql, (chef_id,))
    dishes = cursor.fetchall()

    cursor.close()
    conn.close()
    return {"dishes": dishes}

@app.post("/membership-plans")
def create_membership_plan(
    plan_name: str,
    price: float,
    benefits: str = None
):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
    INSERT INTO MembershipPlan 
    (plan_name, price, benefits)
    VALUES (%s, %s, %s)
    """

    cursor.execute(sql, (plan_name, price, benefits))
    conn.commit()

    plan_id = cursor.lastrowid

    cursor.close()
    conn.close()
    return {"message": "Membership plan created successfully!", "plan_id": plan_id}

@app.post("/chefs/{chef_id}/membership")
def add_chef_membership(
    chef_id: int,
    plan_id: int,
    membership_type: str = None,
    start_date: str = None,
    end_date: str = None
):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
    INSERT INTO ChefMembership 
    (chef_id, plan_id, membership_type, start_date, end_date)
    VALUES (%s, %s, %s, %s, %s)
    """

    cursor.execute(sql, (chef_id, plan_id, membership_type, start_date, end_date))
    conn.commit()

    cursor.close()
    conn.close()
    return {"message": "Chef membership added successfully!"}

@app.get("/chefs/search")
def search_chefs(
    specialty: str = None,
    min_rating: float = None,
    day_of_week: str = None
):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
    SELECT
        Chef.chef_id,
        User.username,
        Chef.bio,
        Chef.specialty,
        Chef.rating,
        CASE
            WHEN ChefMembership.end_date >= CURDATE() THEN 1
            ELSE 0
        END AS has_membership,

        (
            Chef.rating +
            CASE
                WHEN ChefMembership.end_date >= CURDATE() THEN 0.5
                ELSE 0
            END
        ) AS ranking_score
    FROM Chef
    JOIN User ON Chef.user_id = User.user_id
    LEFT JOIN ChefMembership ON Chef.chef_id = ChefMembership.chef_id
    LEFT JOIN ChefAvailability ON ChefAvailability.chef_id = Chef.chef_id
    WHERE 1=1
    """

    params = []

    if specialty:
        sql += " AND Chef.specialty LIKE %s"
        params.append(f"%{specialty}%")

    if min_rating:
        sql += " AND Chef.rating >= %s"
        params.append(min_rating)

    if day_of_week:
        sql += " AND ChefAvailability.day_of_week = %s"
        params.append(day_of_week)

    sql += " ORDER BY ranking_score DESC"
    cursor.execute(sql, tuple(params))
    chefs = cursor.fetchall()
    cursor.close()
    conn.close()
    return {"chefs": chefs}


