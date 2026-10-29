
import pandas as pd
import pytest

from app.services import itinerary_planner


@pytest.fixture
def sample_dataset(monkeypatch):
    df = pd.DataFrame([
        {
            "place_id": "A1",
            "name": "History Palace",
            "city": "Bhopal",
            "primary_category": "Heritage",
            "entry_fee": 100,
            "estimated_visit_duration_hours": 2,
        },
        {
            "place_id": "A2",
            "name": "Art Museum",
            "city": "Bhopal",
            "primary_category": "Culture",
            "entry_fee": None,
            "estimated_visit_duration_hours": 1.5,
        },
        {
            "place_id": "A3",
            "name": "Indore Temple",
            "city": "Indore",
            "primary_category": "Spirituality",
            "entry_fee": 0,
            "estimated_visit_duration_hours": 1,
        },
    ])

    monkeypatch.setattr(
        itinerary_planner,
        "load_attractions",
        lambda: df.copy(),
    )


def test_calculates_known_fees_and_duration(sample_dataset):
    result = itinerary_planner.plan_itinerary(
        destination="Bhopal",
        selected_place_ids=["A1"],
        budget=500,
        available_time_minutes=180,
    )

    assert result["estimated_visit_minutes"] == 120
    assert result["known_entry_fee_total"] == 100
    assert result["budget_status"] == "fits_budget"
    assert result["time_status"] == "fits_available_time"


def test_unknown_fee_is_not_claimed_affordable(sample_dataset):
    result = itinerary_planner.plan_itinerary(
        destination="Bhopal",
        selected_place_ids=["A1", "A2"],
        budget=500,
        available_time_minutes=240,
    )

    assert result["unknown_entry_fee_count"] == 1
    assert result["budget_status"] == "unknown_fees"


def test_time_limit_is_detected(sample_dataset):
    result = itinerary_planner.plan_itinerary(
        destination="Bhopal",
        selected_place_ids=["A1"],
        budget=500,
        available_time_minutes=60,
    )

    assert result["time_status"] == "exceeds_available_time"


def test_rejects_place_from_another_destination(sample_dataset):
    with pytest.raises(ValueError, match="not found"):
        itinerary_planner.plan_itinerary(
            destination="Bhopal",
            selected_place_ids=["A3"],
            budget=500,
            available_time_minutes=180,
        )


def test_preserves_user_selection_order(sample_dataset):
    result = itinerary_planner.plan_itinerary(
        destination="Bhopal",
        selected_place_ids=["A2", "A1"],
        budget=500,
        available_time_minutes=240,
    )

    assert [
        place["place_id"] for place in result["selected_places"]
    ] == ["A2", "A1"]


def test_rejects_unknown_destination(sample_dataset):
    with pytest.raises(ValueError, match="Unknown destination"):
        itinerary_planner.plan_itinerary(
            destination="Atlantis",
            selected_place_ids=["A1"],
            budget=500,
            available_time_minutes=180,
        )
