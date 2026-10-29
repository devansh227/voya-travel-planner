
import pandas as pd

from app.ml.recommender import recommend_attractions


def sample_attractions():
    return pd.DataFrame(
        [
            {
                "place_id": "A1",
                "name": "History Palace",
                "city": "Indore",
                "primary_category": "Heritage",
                "interest_tags": "history,architecture,heritage",
                "entry_fee": 100,
                "estimated_visit_duration_hours": 2.0,
            },
            {
                "place_id": "A2",
                "name": "Food Street",
                "city": "Indore",
                "primary_category": "Food",
                "interest_tags": "food,culture",
                "entry_fee": 0,
                "estimated_visit_duration_hours": 1.0,
            },
            {
                "place_id": "A3",
                "name": "Expensive Museum",
                "city": "Indore",
                "primary_category": "Heritage",
                "interest_tags": "history,museum",
                "entry_fee": 1000,
                "estimated_visit_duration_hours": 1.0,
            },
            {
                "place_id": "A4",
                "name": "Other City Palace",
                "city": "Bhopal",
                "primary_category": "Heritage",
                "interest_tags": "history,architecture",
                "entry_fee": 50,
                "estimated_visit_duration_hours": 1.0,
            },
        ]
    )


def test_filters_destination_and_budget():
    results = recommend_attractions(
        sample_attractions(), "Indore", 200, 180,
        ["history", "architecture"],
    )

    ids = [item["place_id"] for item in results]

    assert "A1" in ids
    assert "A2" in ids
    assert "A3" not in ids
    assert "A4" not in ids


def test_ranks_matching_interests_first():
    results = recommend_attractions(
        sample_attractions(), "Indore", 200, 180,
        ["history", "architecture"],
    )

    assert results[0]["place_id"] == "A1"


def test_excludes_attractions_that_take_too_long():
    results = recommend_attractions(
        sample_attractions(), "Indore", 200, 30,
        ["history"],
    )

    assert results == []


def test_unknown_fees_remain_eligible():
    df = sample_attractions()
    df.loc[df["place_id"] == "A1", "entry_fee"] = float("nan")

    results = recommend_attractions(
        df, "Indore", 200, 180, ["history"],
    )

    palace = next(item for item in results if item["place_id"] == "A1")

    assert palace["entry_fee"] is None
    assert any("unknown" in reason.lower() for reason in palace["reasons"])


def test_unsupported_destination_returns_empty_results():
    results = recommend_attractions(
        sample_attractions(), "Unknown City", 200, 180,
        ["history"],
    )

    assert results == []


def test_results_are_deterministic():
    df = sample_attractions()

    first = recommend_attractions(
        df, "Indore", 200, 180, ["history", "architecture"],
    )
    second = recommend_attractions(
        df, "Indore", 200, 180, ["history", "architecture"],
    )

    assert first == second
