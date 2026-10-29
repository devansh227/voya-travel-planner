
import pytest

from app.schemas.itinerary import ItineraryRequest
from app.schemas.itinerary_output import ItineraryDraft, ItineraryStop
from app.services import itinerary_generation


@pytest.fixture
def request_data():
    return ItineraryRequest(
        destination="Bhopal",
        selected_place_ids=["MP0055", "MP0065"],
        budget=1000,
        available_time_minutes=360,
        interests=["history", "architecture"],
    )


def make_itinerary(place_ids):
    return ItineraryDraft(
        title="Bhopal Heritage Trip",
        summary="Explore the selected attractions.",
        stops=[
            ItineraryStop(
                place_id=place_id,
                reason_for_order="Fits the proposed visiting order.",
                visit_plan="Explore the attraction.",
                practical_tip="Check visitor arrangements before departure.",
            )
            for place_id in place_ids
        ],
        general_tips=["Allow time between visits."],
        caveats=[],
    )


def test_generates_itinerary_for_selected_places(
    request_data, monkeypatch
):
    def fake_planner(**kwargs):
        assert kwargs["destination"] == "Bhopal"
        return {
            "destination": "Bhopal",
            "selected_places": [
                {"place_id": "MP0055", "name": "Taj-ul-Masajid"},
                {"place_id": "MP0065", "name": "Birla Mandir"},
            ],
            "selected_count": 2,
            "estimated_visit_minutes": 150,
            "available_time_minutes": 360,
            "time_status": "fits_available_time",
            "known_entry_fee_total": 0,
            "unknown_entry_fee_count": 0,
            "budget": 1000,
            "budget_status": "fits_budget",
        }

    def fake_gemini(prompt):
        assert "Taj-ul-Masajid" in prompt
        assert "history" in prompt
        return make_itinerary(["MP0065", "MP0055"])

    monkeypatch.setattr(
        itinerary_generation, "plan_itinerary", fake_planner
    )
    monkeypatch.setattr(
        itinerary_generation, "generate_structured_itinerary",
        fake_gemini,
    )

    result = itinerary_generation.generate_personalized_itinerary(
        request_data
    )

    assert result.title == "Bhopal Heritage Trip"
    assert {stop.place_id for stop in result.stops} == {
        "MP0055", "MP0065"
    }


def test_rejects_unselected_attraction(
    request_data, monkeypatch
):
    monkeypatch.setattr(
        itinerary_generation,
        "plan_itinerary",
        lambda **kwargs: {"destination": "Bhopal"},
    )
    monkeypatch.setattr(
        itinerary_generation,
        "generate_structured_itinerary",
        lambda prompt: make_itinerary(["MP0055", "UNKNOWN"]),
    )

    with pytest.raises(RuntimeError, match="every selected attraction"):
        itinerary_generation.generate_personalized_itinerary(
            request_data
        )


def test_rejects_duplicate_attraction(
    request_data, monkeypatch
):
    monkeypatch.setattr(
        itinerary_generation,
        "plan_itinerary",
        lambda **kwargs: {"destination": "Bhopal"},
    )
    monkeypatch.setattr(
        itinerary_generation,
        "generate_structured_itinerary",
        lambda prompt: make_itinerary(["MP0055", "MP0055"]),
    )

    with pytest.raises(RuntimeError, match="every selected attraction"):
        itinerary_generation.generate_personalized_itinerary(
            request_data
        )



def test_rejects_missing_unknown_fee_caveat(request_data, monkeypatch):
    context = {
        "destination": "Bhopal",
        "selected_places": [
            {"place_id": "MP0055", "name": "Taj-ul-Masajid"},
            {"place_id": "MP0065", "name": "Birla Mandir"},
        ],
        "selected_count": 2,
        "estimated_visit_minutes": 150,
        "available_time_minutes": 360,
        "time_status": "fits_available_time",
        "known_entry_fee_total": 0,
        "unknown_entry_fee_count": 1,
        "budget": 1000,
        "budget_status": "unknown_fees",
    }

    monkeypatch.setattr(
        itinerary_generation,
        "generate_structured_itinerary",
        lambda prompt: make_itinerary(["MP0055", "MP0065"]),
    )

    with pytest.raises(RuntimeError, match="disclose unknown entry fees"):
        itinerary_generation.generate_personalized_itinerary(
            request_data,
            planning_context=context,
        )


def test_rejects_specific_unverified_travel_time(request_data, monkeypatch):
    itinerary = make_itinerary(["MP0055", "MP0065"])
    itinerary.general_tips = ["Allow 20 minutes for travel between stops."]

    context = {
        "destination": "Bhopal",
        "selected_places": [
            {"place_id": "MP0055", "name": "Taj-ul-Masajid"},
            {"place_id": "MP0065", "name": "Birla Mandir"},
        ],
        "selected_count": 2,
        "estimated_visit_minutes": 150,
        "available_time_minutes": 360,
        "time_status": "fits_available_time",
        "known_entry_fee_total": 0,
        "unknown_entry_fee_count": 0,
        "budget": 1000,
        "budget_status": "fits_budget",
    }

    monkeypatch.setattr(
        itinerary_generation,
        "generate_structured_itinerary",
        lambda prompt: itinerary,
    )

    with pytest.raises(RuntimeError, match="specific travel time"):
        itinerary_generation.generate_personalized_itinerary(
            request_data,
            planning_context=context,
        )
