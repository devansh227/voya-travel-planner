import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.recommendations import router as recommendations_router
from app.api.itinerary import router as itinerary_router

app = FastAPI(
    title="VOYA API",
    description="Personalized travel recommendation API",
    version="1.0.0",
)

# Allow local development and the deployed Vercel frontend.
_DEFAULT_ORIGINS = (
    "http://localhost:5173,"
    "http://127.0.0.1:5173,"
    "https://voya-travel-planner-flame.vercel.app"
)

allowed_origins = [
    origin.strip().rstrip("/")
    for origin in os.getenv(
        "CORS_ORIGINS", _DEFAULT_ORIGINS
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "VOYA API"}


app.include_router(recommendations_router)
app.include_router(itinerary_router)