
from pydantic import BaseModel, Field, field_validator


class ItineraryRequest(BaseModel):
    destination: str = Field(min_length=1)
    selected_place_ids: list[str] = Field(min_length=1, max_length=20)
    budget: float = Field(ge=0)
    available_time_minutes: int = Field(gt=0)
    interests: list[str] = Field(default_factory=list)

    @field_validator("destination")
    @classmethod
    def clean_destination(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Destination cannot be empty.")

        return value

    @field_validator("selected_place_ids")
    @classmethod
    def validate_place_ids(cls, values: list[str]) -> list[str]:
        cleaned = [place_id.strip() for place_id in values]

        if any(not place_id for place_id in cleaned):
            raise ValueError("Place IDs cannot be empty.")

        if len(set(cleaned)) != len(cleaned):
            raise ValueError("Duplicate place IDs are not allowed.")

        return cleaned

    @field_validator("interests")
    @classmethod
    def clean_interests(cls, values: list[str]) -> list[str]:
        return [
            interest.strip()
            for interest in values
            if interest.strip()
        ]
