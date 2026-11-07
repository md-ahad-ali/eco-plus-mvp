import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import analytics, auth, buildings

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug
)

origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins],
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
app.include_router(analytics.router)
app.include_router(auth.router)
app.include_router(buildings.router)


@app.get("/")
def home():
    return {
        "message": f"Welcome to {settings.app_name}!",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}