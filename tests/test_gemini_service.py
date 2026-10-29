from google.genai import errors

from app.services.gemini_service import GeminiServiceError

from unittest.mock import MagicMock, patch

from app.services.gemini_service import (
    generate_structured_itinerary,
    generate_text,
)

def test_generate_text_returns_gemini_response():
    mock_response = MagicMock()
    mock_response.text = "A sample travel itinerary."

    with patch(
        "app.services.gemini_service.client.models.generate_content",
        return_value=mock_response,
    ) as mock_generate:
        result = generate_text("Plan a trip to Bhopal.")

    assert result == "A sample travel itinerary."
    mock_generate.assert_called_once()



def test_generate_structured_itinerary():
    from app.schemas.itinerary_output import ItineraryDraft

    mock_response = MagicMock()
    mock_response.text = """
    {
        "title": "Bhopal Heritage Trip",
        "summary": "Explore selected attractions.",
        "stops": [
            {
                "place_id": "MP0055",
                "reason_for_order": "Start with the selected attraction.",
                "visit_plan": "Explore its architecture.",
                "practical_tip": "Check visitor arrangements before departure."
            }
        ],
        "general_tips": ["Allow time between visits."],
        "caveats": ["Travel time has not been calculated."]
    }
    """

    with patch(
        "app.services.gemini_service.client.models.generate_content",
        return_value=mock_response,
    ) as mock_generate:
        result = generate_structured_itinerary(
            "Create an itinerary for Bhopal."
        )

    assert isinstance(result, ItineraryDraft)
    assert result.title == "Bhopal Heritage Trip"
    assert result.stops[0].place_id == "MP0055"
    mock_generate.assert_called_once()



def test_generate_text_rejects_empty_response():
    from app.services.gemini_service import GeminiServiceError

    mock_response = MagicMock()
    mock_response.text = "   "

    with patch(
        "app.services.gemini_service.client.models.generate_content",
        return_value=mock_response,
    ):
        try:
            generate_text("Test prompt.")
            assert False, "Expected GeminiServiceError"
        except GeminiServiceError as exc:
            assert exc.status_code == 502
            assert "empty response" in exc.message.lower()


def test_structured_itinerary_rejects_invalid_json():
    from app.services.gemini_service import GeminiServiceError

    mock_response = MagicMock()
    mock_response.text = "{not valid json"

    with patch(
        "app.services.gemini_service.client.models.generate_content",
        return_value=mock_response,
    ):
        try:
            generate_structured_itinerary("Test prompt.")
            assert False, "Expected GeminiServiceError"
        except GeminiServiceError as exc:
            assert exc.status_code == 502
            assert "invalid itinerary format" in exc.message.lower()


def test_gemini_overload_becomes_safe_service_error():
    provider_error = errors.APIError(
        503,
        {
            "error": {
                "code": 503,
                "message": "Temporary overload",
                "status": "UNAVAILABLE",
            }
        },
    )

    with patch(
        "app.services.gemini_service.client.models.generate_content",
        side_effect=provider_error,
    ):
        try:
            generate_text("Test prompt.")
            assert False, "Expected GeminiServiceError"
        except GeminiServiceError as exc:
            assert exc.status_code == 503
            assert "temporarily unavailable" in exc.message.lower()
            assert "Temporary overload" not in exc.message