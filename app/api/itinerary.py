
from fastapi import APIRouter, HTTPException
from app.services.gemini_service import GeminiServiceError
from app.schemas.itinerary import ItineraryRequest
from app.services.itinerary_planner import plan_itinerary
from app.services.itinerary_generation import (
    generate_personalized_itinerary,
)

router = APIRouter(
    prefix="/api/itinerary",
    tags=["Itinerary"],
)


@router.post("/")
def generate_itinerary(request: ItineraryRequest):
    try:
        # Calculate trusted trip constraints first.
        planning_context = plan_itinerary(
            destination=request.destination,
            selected_place_ids=request.selected_place_ids,
            budget=request.budget,
            available_time_minutes=request.available_time_minutes,
        )

        # Generate the itinerary using Gemini.
        itinerary = generate_personalized_itinerary(
            request,
            planning_context=planning_context,
        )

        # Preserve the existing response fields and add the itinerary.
        return {
            **planning_context,
            "itinerary": itinerary.model_dump(),
        }

    except GeminiServiceError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.message,
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=500,
            detail="Attraction dataset is unavailable.",
        ) from exc

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail="Itinerary generation failed validation.",
        ) from exc
