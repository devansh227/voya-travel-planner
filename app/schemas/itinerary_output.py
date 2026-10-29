
from pydantic import BaseModel, Field


class ItineraryStop(BaseModel):
    place_id: str = Field(
        description="ID of a selected attraction from the provided data."
    )
    reason_for_order: str = Field(
        description="Why this attraction fits at this point in the trip."
    )
    visit_plan: str = Field(
        description="Suggested activities at this attraction."
    )
    practical_tip: str = Field(
        description="A useful visitor tip supported by the provided context."
    )


class ItineraryDraft(BaseModel):
    title: str = Field(
        description="A concise title for the travel itinerary."
    )
    summary: str = Field(
        description="A short overview of the proposed trip."
    )
    stops: list[ItineraryStop] = Field(
        description="Selected attractions in the proposed visiting order."
    )
    general_tips: list[str] = Field(
        description="General planning tips that do not invent unverified facts."
    )
    caveats: list[str] = Field(
        description="Important unknowns or limitations the traveller should know."
    )
