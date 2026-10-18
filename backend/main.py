from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import analytics

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug
)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.include_router(analytics.router)


@app.get("/")
def home():
    return {
        "message": f"Welcome to {settings.app_name}!",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}