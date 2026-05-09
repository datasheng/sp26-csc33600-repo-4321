# ChefConnect Backend

FastAPI + MySQL backend for ChefConnect — a platform where customers hire private chefs to cook at their home using the customer's own ingredients.

## Requirements

- Python 3.11+
- MySQL 8.0+

## Setup

### 1. Create and activate a virtual environment

```bash
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Create the database and run the schema

**Option A — MySQL Workbench (recommended):**
1. Open MySQL Workbench and connect to your server (`127.0.0.1:3306`, user `root`)
2. Click **File → Open SQL Script** and select `schema.sql`
3. Click the lightning bolt (Execute) button to run it

**Option B — Terminal:**
```bash
mysql -u root -p -h 127.0.0.1 < schema.sql
```

This creates the `chefconnect` database and all 11 tables.

### 4. Create your `.env` file

Copy the example and fill in your password:

```bash
cp .env.example .env
```

Then open `.env` and set your MySQL root password:

```
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=chefconnect
SECRET_KEY=any-long-random-string-at-least-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

> **Note:** Use `127.0.0.1` not `localhost`. On Mac, `localhost` uses socket authentication which bypasses passwords — `127.0.0.1` forces TCP and works correctly with your root password.

### 5. Seed the database

Populates the 6 mock chefs, their dishes, availability, and a test customer account:

```bash
python seed.py
```

Test credentials after seeding:
- **Customer:** `david@test.com` / `password123`
- **Chef (any):** e.g. `anika@chefconnect.dev` / `password123`

### 6. Start the server

```bash
uvicorn main:app --reload
```

The API will be running at `http://localhost:8000`.

Interactive API docs (Swagger UI) are available at `http://localhost:8000/docs`.

## API Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | None | Register as customer or chef |
| POST | `/auth/signup` | None | Customer signup (used by frontend) |
| POST | `/auth/login` | None | Login and receive JWT |
| GET | `/chefs` | None | Browse chefs (`?cuisine_type=&search=`) |
| GET | `/chefs/{id}` | None | Chef profile |
| PATCH | `/chefs/{id}` | Chef | Update own profile |
| GET | `/chefs/{id}/availability` | None | Chef's availability slots |
| POST | `/chefs/{id}/availability` | Chef | Add availability slot |
| DELETE | `/chefs/{id}/availability/{avail_id}` | Chef | Remove availability slot |
| GET | `/chefs/{id}/reviews` | None | Chef's reviews |
| GET | `/dishes` | None | All dishes with ingredients |
| GET | `/dishes/{id}` | None | Single dish |
| POST | `/bookings` | Customer | Create a booking |
| GET | `/bookings` | Any | Your bookings (scoped by role) |
| GET | `/bookings/{id}` | Any | Single booking detail |
| PATCH | `/bookings/{id}/status` | Any | Update booking status |
| POST | `/reviews` | Customer | Leave a review (booking must be completed) |
| GET | `/reviews` | Customer | Your submitted reviews |

## Project Structure

```
chefconnect-api/
├── main.py               # App entry point, CORS, router registration
├── schema.sql            # Run once to create all tables
├── seed.py               # Populates dev data
├── requirements.txt
└── app/
    ├── database.py       # MySQL connection pool
    ├── core/
    │   ├── config.py     # Environment settings
    │   ├── security.py   # JWT + bcrypt
    │   └── dependencies.py  # Auth guards
    ├── schemas/          # Pydantic request/response models
    ├── routers/          # FastAPI route handlers
    └── services/         # Raw SQL business logic
```
