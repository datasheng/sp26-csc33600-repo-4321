# ChefConnect Backend

FastAPI backend for the ChefConnect app. Currently runs on mock data — MySQL will be swapped in later without changing any endpoint signatures.

## Requirements

- Python 3.10+

## Setup (do this once)

Open a terminal inside the `chefconnect-api/` folder, then run:

```bash
# 1. Create a virtual environment
python -m venv venv

# 2. Activate it
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt
```

## Running the server

Make sure your virtual environment is active (you'll see `(venv)` in your terminal), then:

```bash
uvicorn main:app --reload
```

The API will be available at: `http://localhost:8000`

The `--reload` flag means the server restarts automatically whenever you save a file.

## Interactive docs

FastAPI generates documentation automatically. Once the server is running, open:

- `http://localhost:8000/docs` — interactive UI where you can test every endpoint
- `http://localhost:8000/redoc` — alternative docs view

## Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/` | Health check |
| GET | `/chefs` | Returns all chefs |
| GET | `/chefs/{id}` | Returns a single chef by ID |
| GET | `/bookings` | Returns all bookings |
| GET | `/booking/{id}` | Returns a single booking by ID |
| POST | `/users/login` | Logs in a user |

### Login example

Send a POST request to `/users/login` with this JSON body:

```json
{
  "email": "david@example.com",
  "password": "password123"
}
```

## Project structure

```
chefconnect-api/
  main.py           # App entry point, CORS config, router registration
  mock_data.py      # Fake chefs, bookings, and users (matches frontend data)
  requirements.txt  # Python dependencies
  routers/
    chefs.py        # GET /chefs and GET /chefs/{id}
    bookings.py     # GET /bookings and GET /bookings/{id}
    users.py        # POST /users/login
```

## When MySQL is ready

Each router function currently reads from `mock_data.py`. When the database is set up, you'll replace those reads with SQL queries — the endpoint URLs and response shapes stay exactly the same, so the frontend needs zero changes.
