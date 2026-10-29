
import os

import httpx
from dotenv import load_dotenv
from google import genai
from google.genai import errors, types
from pydantic import ValidationError

from app.schemas.itinerary_output import ItineraryDraft

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL")


class GeminiServiceError(Exception):
    """A safe, application-level error from the Gemini service."""

    def __init__(self, status_code: int, message: str):
        super().__init__(message)
        self.status_code = status_code
        self.message = message


if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is missing. Add it to your .env file."
    )

if not GEMINI_MODEL:
    raise RuntimeError(
        "GEMINI_MODEL is missing. Add it to your .env file."
    )

client = genai.Client(api_key=GEMINI_API_KEY)


def _generate_content(**kwargs):
    """Call Gemini and translate provider failures into safe errors."""
    try:
        return client.models.generate_content(**kwargs)

    except errors.APIError as exc:
        status_code = getattr(exc, "code", None)

        if status_code == 429:
            raise GeminiServiceError(
                503,
                "Gemini is temporarily rate-limited. Please try again shortly.",
            ) from exc

        if status_code in (500, 502, 503):
            raise GeminiServiceError(
                503,
                "Gemini is temporarily unavailable. Please try again shortly.",
            ) from exc

        if status_code == 504:
            raise GeminiServiceError(
                504,
                "Gemini took too long to respond. Please try again.",
            ) from exc

        raise GeminiServiceError(
            502,
            "Gemini could not process the request. Please try again.",
        ) from exc

    except httpx.TimeoutException as exc:
        raise GeminiServiceError(
            504,
            "The Gemini request timed out. Please try again.",
        ) from exc

    except httpx.NetworkError as exc:
        raise GeminiServiceError(
            503,
            "Gemini could not be reached. Please try again shortly.",
        ) from exc


def generate_text(prompt: str) -> str:
    """Send a prompt to Gemini and return its text response."""
    response = _generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
    )

    if not response.text or not response.text.strip():
        raise GeminiServiceError(
            502,
            "Gemini returned an empty response. Please try again.",
        )

    return response.text


def generate_structured_itinerary(prompt: str) -> ItineraryDraft:
    """Ask Gemini for structured output and validate it with Pydantic."""
    response = _generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ItineraryDraft,
            temperature=0.3,
        ),
    )

    if not response.text or not response.text.strip():
        raise GeminiServiceError(
            502,
            "Gemini returned an empty itinerary. Please try again.",
        )

    try:
        return ItineraryDraft.model_validate_json(response.text)
    except (ValidationError, ValueError) as exc:
        raise GeminiServiceError(
            502,
            "Gemini returned an invalid itinerary format. Please try again.",
        ) from exc
