
from fastapi import APIRouter, HTTPException

from app.ml.recommender import load_attractions, recommend_attractions
from app.schemas.recommendation import RecommendationRequest

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.post("/")
def get_recommendations(request: RecommendationRequest):
    try:
        attractions = load_attractions()

        results = recommend_attractions(
            df=attractions,
            destination=request.destination,
            budget=request.budget,
            available_time_minutes=request.available_time_minutes,
            interests=request.interests,
            top_k=request.top_k,
        )

        return {
            "destination": request.destination,
            "count": len(results),
            "recommendations": results,
        }

    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=500,
            detail="Attraction dataset is unavailable.",
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc
