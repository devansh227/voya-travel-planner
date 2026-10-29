from app.services.gemini_service import GeminiServiceError
from fastapi.testclient import TestClient

from app.schemas.itinerary_output import ItineraryDraft, ItineraryStop

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_recommendations_endpoint():
    response = client.post(
        "/api/recommendations/",
        json={
            "destination": "Bhopal",
            "budget": 1000,
            "available_time_minutes": 360,
            "interests": ["history", "architecture", "photography"],
            "top_k": 5,
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert data["destination"] == "Bhopal"
    assert data["count"] <= 5
    assert isinstance(data["recommendations"], list)

    if data["recommendations"]:
        first = data["recommendations"][0]
        assert "name" in first
        assert "estimated_visit_duration_hours" in first
        assert "relevance_score" in first


def test_invalid_request_is_rejected():
    response = client.post(
        "/api/recommendations/",
        json={
            "destination": "Bhopal",
            "budget": -100,
            "available_time_minutes": 360,
        },
    )

    assert response.status_code == 422



def test_itinerary_endpoint(monkeypatch):
    mock_itinerary = ItineraryDraft(
        title="Bhopal Heritage Trip",
        summary="Explore the selected attractions.",
        stops=[
            ItineraryStop(
                place_id="MP0055",
                reason_for_order="Begin the trip here.",
                visit_plan="Explore the architecture.",
                practical_tip="Check visitor arrangements before departure.",
            ),
            ItineraryStop(
                place_id="MP0065",
                reason_for_order="Continue to the next selected attraction.",
                visit_plan="Explore the temple.",
                practical_tip="Allow time for the visit.",
            ),
        ],
        general_tips=["Allow time between visits."],
        caveats=[],
    )

    monkeypatch.setattr(
        "app.api.itinerary.generate_personalized_itinerary",
        lambda request, planning_context=None: mock_itinerary,
    )

    response = client.post(
        "/api/itinerary/",
        json={
            "destination": "Bhopal",
            "selected_place_ids": ["MP0055", "MP0065"],
            "budget": 1000,
            "available_time_minutes": 360,
            "interests": ["history", "architecture"],
        },
    )

    assert response.status_code == 200

    data = response.json()

    # Existing planning fields are preserved.
    assert data["destination"] == "Bhopal"
    assert data["selected_count"] == 2
    assert data["estimated_visit_minutes"] == 150
    assert data["budget_status"] == "fits_budget"

    # The generated itinerary is now included.
    assert data["itinerary"]["title"] == "Bhopal Heritage Trip"
    assert len(data["itinerary"]["stops"]) == 2


def test_itinerary_rejects_wrong_destination():
    response = client.post(
        "/api/itinerary/",
        json={
            "destination": "Bhopal",
            "selected_place_ids": ["MP0001"],
            "budget": 1000,
            "available_time_minutes": 360,
        },
    )

    assert response.status_code == 400


def test_itinerary_rejects_empty_selection():
    response = client.post(
        "/api/itinerary/",
        json={
            "destination": "Bhopal",
            "selected_place_ids": [],
            "budget": 1000,
            "available_time_minutes": 360,
        },
    )

    assert response.status_code == 422


def test_itinerary_api_handles_gemini_unavailable(monkeypatch):
    def fail_generation(*args, **kwargs):
        raise GeminiServiceError(
            503,
            "Gemini is temporarily unavailable. Please try again shortly.",
        )

    monkeypatch.setattr(
        "app.api.itinerary.generate_personalized_itinerary",
        fail_generation,
    )

    response = client.post(
        "/api/itinerary/",
        json={
            "destination": "Bhopal",
            "selected_place_ids": ["MP0055", "MP0065"],
            "budget": 1000,
            "available_time_minutes": 360,
            "interests": ["history", "architecture"],
        },
    )

    assert response.status_code == 503
    assert response.json()["detail"] == (
        "Gemini is temporarily unavailable. Please try again shortly."
    )