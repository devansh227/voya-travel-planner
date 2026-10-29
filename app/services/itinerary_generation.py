
import json
import re

from app.schemas.itinerary import ItineraryRequest
from app.schemas.itinerary_output import ItineraryDraft
from app.services.gemini_service import generate_structured_itinerary
from app.services.itinerary_planner import plan_itinerary


def _validate_itinerary(
    itinerary: ItineraryDraft,
    request: ItineraryRequest,
    planning_context: dict,
) -> None:
    """Reject output that conflicts with trusted planning data."""

    selected_ids = request.selected_place_ids
    returned_ids = [stop.place_id for stop in itinerary.stops]

    if (
        len(returned_ids) != len(selected_ids)
        or set(returned_ids) != set(selected_ids)
    ):
        raise RuntimeError(
            "Generated itinerary must contain every selected attraction "
            "exactly once."
        )

    # Check the model's text together so caveats and tips are included.
    text_to_check = " ".join(
        [
            itinerary.title,
            itinerary.summary,
            *itinerary.general_tips,
            *itinerary.caveats,
            *[
                part
                for stop in itinerary.stops
                for part in (
                    stop.reason_for_order,
                    stop.visit_plan,
                    stop.practical_tip,
                )
            ],
        ]
    ).lower()

    budget_status = planning_context.get("budget_status")
    time_status = planning_context.get("time_status")
    unknown_fees = planning_context.get("unknown_entry_fee_count", 0)

    # Avoid claiming that an uncertain or over-budget trip fits the budget.
    if budget_status in {"unknown_fees", "exceeds_budget"}:
        misleading_budget_claims = (
            r"\b(fits|within|under|below)\s+(your\s+)?budget\b",
            r"\bwithin\s+your\s+₹?\s*[\d,]+\s+budget\b",
            r"\btotal\s+(trip\s+)?cost\s+is\s+₹?\s*0\b",
        )
        if any(
            re.search(pattern, text_to_check)
            for pattern in misleading_budget_claims
        ):
            raise RuntimeError(
                "Generated itinerary makes an unsupported budget claim."
            )

    # Do not allow claims that the schedule fits if it exceeds available time.
    if time_status == "exceeds_available_time":
        misleading_time_claims = (
            r"\bfits\s+(comfortably\s+)?within\s+the\s+available\s+time\b",
            r"\bcomfortably\s+fits\s+(in|within)\s+your\s+time\b",
            r"\bcompletable\s+within\s+the\s+available\s+time\b",
        )
        if any(
            re.search(pattern, text_to_check)
            for pattern in misleading_time_claims
        ):
            raise RuntimeError(
                "Generated itinerary makes an unsupported time claim."
            )

    # Unknown fees must be disclosed in the caveats.
    if unknown_fees and not any(
        term in " ".join(itinerary.caveats).lower()
        for term in ("unknown", "unavailable", "not provided", "not available")
    ):
        raise RuntimeError(
            "Generated itinerary must disclose unknown entry fees in caveats."
        )

    # Travel time isn't calculated by our current planner.
    # Reject exact travel-duration claims rather than guessing their accuracy.
    travel_time_claim = re.search(
        r"\b(?:travel|drive|driving|walk|walking|journey|transit)\b"
        r".{0,50}\b\d+\s*(?:minutes?|mins?|hours?|hrs?)\b"
        r"|\b\d+\s*(?:minutes?|mins?|hours?|hrs?)\b"
        r".{0,50}\b(?:travel|drive|driving|walk|walking|journey|transit)\b",
        text_to_check,
    )
    if travel_time_claim:
        raise RuntimeError(
            "Generated itinerary includes a specific travel time, "
            "but travel times are not calculated."
        )


def generate_personalized_itinerary(
    request: ItineraryRequest,
    planning_context: dict | None = None,
) -> ItineraryDraft:
    if planning_context is None:
        planning_context = plan_itinerary(
            destination=request.destination,
            selected_place_ids=request.selected_place_ids,
            budget=request.budget,
            available_time_minutes=request.available_time_minutes,
        )

    context_json = json.dumps(planning_context, ensure_ascii=False)

    prompt = f"""
You are VOYA, a personalized travel itinerary assistant.

Create a useful itinerary using ONLY the attraction records and
planning information provided below.

USER PREFERENCES
Destination: {request.destination}
Interests: {json.dumps(request.interests, ensure_ascii=False)}
Budget: {request.budget}
Available time: {request.available_time_minutes} minutes

TRUSTED PLANNING CONTEXT
{context_json}

RULES
1. Include every selected attraction exactly once.
2. Use each attraction's exact place_id from the provided context.
3. You may reorder attractions if that makes the plan more sensible.
4. Do not invent opening hours, ticket prices, travel times, or distances.
5. Do not claim the trip fits the budget if budget status is unknown_fees
   or exceeds_budget.
6. Do not claim the trip fits the available time if time status is
   exceeds_available_time.
7. If any entry fees are unknown, clearly disclose this in caveats.
8. Make visit suggestions relevant to the user's interests.
9. Return only the structured itinerary matching the requested schema.
"""

    itinerary = generate_structured_itinerary(prompt)
    _validate_itinerary(itinerary, request, planning_context)

    return itinerary
