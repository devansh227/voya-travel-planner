
import pytest
from pydantic import ValidationError

from app.schemas.itinerary_output import (
    ItineraryDraft,
    ItineraryStop,
)


def test_valid_itinerary_output():
    itinerary = ItineraryDraft(
        title="A Day Exploring Bhopal",
        summary="Explore selected heritage and spiritual attractions.",
        stops=[
            ItineraryStop(
                place_id="MP0055",
                reason_for_order="Begin with this selected attraction.",
                visit_plan="Explore the architecture and take photographs.",
                practical_tip="Confirm visitor arrangements before travelling.",
            )
        ],
        general_tips=["Allow time between visits."],
        caveats=["Travel time between attractions is not calculated."],
    )

    assert itinerary.title == "A Day Exploring Bhopal"
    assert itinerary.stops[0].place_id == "MP0055"


def test_missing_required_field_is_rejected():
    with pytest.raises(ValidationError):
        ItineraryDraft(
            title="Bhopal Trip",
            summary="A short trip.",
            stops=[],
            general_tips=[],
        )


def test_invalid_stop_is_rejected():
    with pytest.raises(ValidationError):
        ItineraryStop(
            place_id="MP0055",
            reason_for_order="Start here.",
            visit_plan="Explore the attraction.",
        )
