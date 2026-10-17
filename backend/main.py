from fastapi import FastAPI
from config import settings

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug
)


@app.get("/")
def home():
    return {
        "message": f"Welcome to {settings.app_name}!",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}