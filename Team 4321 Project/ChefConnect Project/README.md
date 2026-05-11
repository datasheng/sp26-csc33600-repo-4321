# ChefConnect

A platform that connects customers with private chefs. Customers browse chefs, book them, share their pantry, and leave reviews. Chefs manage their profile, availability, menu, and incoming bookings.

---

## System Requirements

| Tool | Version | Purpose |
|---|---|---|
| Python | 3.10+ | Backend API |
| Node.js | 18+ | Frontend React app |
| Docker Desktop | any recent | MySQL database |
| Git | any | Source control |

---

## Quick Start (3 terminals)

### Terminal 1 — Database

```bash
cd "ChefConnect Project/chefconnect-api"
docker-compose up -d
```

**First time only** — load the schema and seed data:

```bash
docker exec -i chefconnection-mysql mysql -uccuser -pcc123! chefconnection_db < backend/schema.sql
bash backend/seed_chefconnect_v3.sh
```

Database runs on `127.0.0.1:3307`  
Credentials: user=`ccuser` · password=`cc123!` · db=`chefconnection_db`

---

### Terminal 2 — Backend API

```bash
cd "ChefConnect Project/chefconnect-api/backend"
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

- API: http://localhost:8000  
- Interactive docs: http://localhost:8000/docs

**Python packages installed:**
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
mysql-connector-python==8.4.0
bcrypt==4.1.3
```

---

### Terminal 3 — Frontend

```bash
cd "ChefConnect Project/chefconnect-react"
npm install
npm run dev
```

- App: http://localhost:5173

---

## Customer Workflow

1. **Sign up** at `/signup` (username, email, password, card info)
2. **Browse chefs** on the home page — filter by cuisine or search by name
3. **Open a chef profile** — see their bio, availability, dishes, and reviews
4. **Select date & time** and click **Confirm Booking**
5. From the **Dashboard → Pantry Profile** — add ingredients you have at home
6. The chef views your pantry and plans the meal
7. After the booking completes, go to **Dashboard → My Reviews** to leave a review

## Chef Workflow

1. **Register as a chef** at `/register` (account info, bio, cuisine tags, availability, payout info)
2. From the **Chef Dashboard → My Profile** — update bio and specialties any time
3. From the **Chef Dashboard → My Availability** — add or view your schedule
4. From the **Chef Dashboard → My Menu** — add dishes customers can request
5. Incoming bookings appear under **My Bookings** — accept or decline each one
6. Click **View customer pantry** on any booking to see what ingredients the customer has
7. Ratings from customer reviews update your profile score automatically

---

## Project Structure

```
ChefConnect Project/
├── chefconnect-api/
│   ├── backend/
│   │   ├── app.py          # FastAPI backend (all API routes)
│   │   ├── schema.sql      # Full database schema
│   │   ├── requirements.txt
│   │   └── seed_chefconnect_v3.sh
│   └── docker-compose.yml  # MySQL container
└── chefconnect-react/
    ├── src/
    │   ├── App.jsx
    │   ├── components/     # Navbar, ChefCard, BookingWidget, StatusBadge
    │   ├── pages/          # BrowsePage, ChefProfilePage, DashboardPage,
    │   │                   # ChefDashboardPage, LoginPage, SignupPage, RegisterPage
    │   └── data/chefs.js   # API fetch helpers + static chef supplement data
    └── package.json
```
