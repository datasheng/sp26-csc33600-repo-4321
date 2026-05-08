from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import chefs, bookings, users

app = FastAPI(title="ChefConnect API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chefs.router)
app.include_router(bookings.router)
app.include_router(users.router)


@app.get("/")
def root():
    return {"message": "ChefConnect API is running"}
