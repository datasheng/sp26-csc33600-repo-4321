from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, chefs, dishes

app = FastAPI(title="ChefConnect API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(chefs.router)
app.include_router(dishes.router)


@app.get("/")
def health_check():
    return {"status": "ok", "version": "1.0.0"}
