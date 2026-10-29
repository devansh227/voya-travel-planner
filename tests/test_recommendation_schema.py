
import pytest
from pydantic import ValidationError

from app.schemas.recommendation import RecommendationRequest


def test_valid_request():
    request = RecommendationRequest(
        destination=" Bhopal ",
        budget=1000,
        available_time_minutes=360,
        interests=[" history ", "architecture"],
        top_k=10,
    )

    assert request.destination == "Bhopal"
    assert request.budget == 1000
    assert request.interests == ["history", "architecture"]


def test_negative_budget_is_rejected():
    with pytest.raises(ValidationError):
        RecommendationRequest(
            destination="Bhopal",
            budget=-100,
            available_time_minutes=360,
        )


def test_zero_time_is_rejected():
    with pytest.raises(ValidationError):
        RecommendationRequest(
            destination="Bhopal",
            budget=1000,
            available_time_minutes=0,
        )


def test_blank_destination_is_rejected():
    with pytest.raises(ValidationError):
        RecommendationRequest(
            destination="   ",
            budget=1000,
            available_time_minutes=360,
        )


def test_default_values():
    request = RecommendationRequest(
        destination="Indore",
        budget=500,
        available_time_minutes=180,
    )

    assert request.interests == []
    assert request.top_k == 10
