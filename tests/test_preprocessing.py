import pandas as pd
import pytest

from app.ml.preprocessing import preprocess_dataframe


@pytest.fixture
def sample_data():
    return pd.DataFrame(
        [
            {
                "place_id": "TEST001",
                "name": "  Test Palace  ",
                "city": " Indore ",
                "primary_category": "heritage",
                "subcategory": "palace",
                "interest_tags": " History, architecture,history ",
                "latitude": 22.7,
                "longitude": 75.8,
                "entry_fee": 0,
                "visitor_count": -1,
                "review_count": 20,
                "estimated_visit_duration_hours": 2.0,
                "interest_tag_count": 3,
            },
            {
                "place_id": "TEST002",
                "name": "Unknown Fee Temple",
                "city": "Ujjain",
                "primary_category": "spirituality",
                "subcategory": "temple",
                "interest_tags": "spirituality,heritage",
                "latitude": -1,
                "longitude": -1,
                "entry_fee": -1,
                "visitor_count": -1,
                "review_count": -1,
                "estimated_visit_duration_hours": 1.5,
                "interest_tag_count": 2,
            },
        ]
    )


def test_normalizes_text_and_tags(sample_data):
    result = preprocess_dataframe(sample_data)

    assert result.loc[0, "name"] == "Test Palace"
    assert result.loc[0, "primary_category"] == "Heritage"
    assert result.loc[0, "interest_tags"] == "history,architecture"


def test_preserves_zero_fee_and_marks_unknown_as_missing(sample_data):
    result = preprocess_dataframe(sample_data)

    assert result.loc[0, "entry_fee"] == 0
    assert pd.isna(result.loc[1, "entry_fee"])


def test_converts_unknown_coordinates_to_missing(sample_data):
    result = preprocess_dataframe(sample_data)

    assert pd.isna(result.loc[1, "latitude"])
    assert pd.isna(result.loc[1, "longitude"])


def test_preserves_all_valid_records(sample_data):
    result = preprocess_dataframe(sample_data)

    assert len(result) == len(sample_data)
    assert result["place_id"].is_unique


def test_rejects_duplicate_ids(sample_data):
    sample_data.loc[1, "place_id"] = "TEST001"

    with pytest.raises(ValueError, match="Duplicate place_id"):
        preprocess_dataframe(sample_data)


def test_rejects_missing_required_columns(sample_data):
    sample_data = sample_data.drop(columns=["city"])

    with pytest.raises(ValueError, match="Missing required columns"):
        preprocess_dataframe(sample_data)
