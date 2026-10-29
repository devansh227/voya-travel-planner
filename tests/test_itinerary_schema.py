
import pytest
from pydantic import ValidationError

from app.schemas.itinerary import ItineraryRequest


def test_valid_itinerary_request():
    request = ItineraryRequest(
        destination=" Bhopal ",
        selected_place_ids=["MP0055", "MP0062"],
        budget=1000,
        available_time_minutes=360,
        interests=[" history ", "architecture"],
    )

    assert request.destination == "Bhopal"
    assert request.selected_place_ids == ["MP0055", "MP0062"]
    assert request.interests == ["history", "architecture"]


def test_empty_selection_is_rejected():
    with pytest.raises(ValidationError):
        ItineraryRequest(
            destination="Bhopal",
            selected_place_ids=[],
            budget=1000,
            available_time_minutes=360,
        )


def test_duplicate_place_ids_are_rejected():
    with pytest.raises(ValidationError):
        ItineraryRequest(
            destination="Bhopal",
            selected_place_ids=["MP0055", "MP0055"],
            budget=1000,
            available_time_minutes=360,
        )


def test_negative_budget_is_rejected():
    with pytest.raises(ValidationError):
        ItineraryRequest(
            destination="Bhopal",
            selected_place_ids=["MP0055"],
            budget=-1,
            available_time_minutes=360,
        )


def test_too_many_places_are_rejected():
    with pytest.raises(ValidationError):
        ItineraryRequest(
            destination="Bhopal",
            selected_place_ids=[f"MP{i:04d}" for i in range(21)],
            budget=1000,
            available_time_minutes=360,
        )
