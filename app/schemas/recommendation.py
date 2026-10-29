
from pydantic import BaseModel, Field, field_validator


class RecommendationRequest(BaseModel):
    destination: str = Field(min_length=1)
    budget: float = Field(ge=0)
    available_time_minutes: int = Field(gt=0)
    interests: list[str] = Field(default_factory=list)
    top_k: int = Field(default=10, ge=1, le=50)

    @field_validator("destination")
    @classmethod
    def validate_destination(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Destination cannot be empty.")

        return value

    @field_validator("interests")
    @classmethod
    def clean_interests(cls, values: list[str]) -> list[str]:
        return [
            interest.strip()
            for interest in values
            if interest.strip()
        ]
