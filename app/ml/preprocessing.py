
from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = PROJECT_ROOT / "data" / "raw"
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"

REQUIRED_COLUMNS = {
    "place_id",
    "name",
    "city",
    "primary_category",
    "subcategory",
    "interest_tags",
    "estimated_visit_duration_hours",
}

SENTINEL_COLUMNS = [
    "latitude",
    "longitude",
    "entry_fee",
    "visitor_count",
    "review_count",
]

TEXT_COLUMNS = [
    "name",
    "state",
    "district",
    "city",
    "primary_category",
    "subcategory",
]


def find_raw_dataset() -> Path:
    """Find the single CSV used as our raw tourism dataset."""

    files = sorted(RAW_DIR.glob("*.csv"))

    if len(files) != 1:
        raise FileNotFoundError(
            f"Expected exactly one CSV in {RAW_DIR}, "
            f"but found {len(files)}. "
            "Keep only the intended raw dataset in this directory."
        )

    return files[0]


def preprocess_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Validate and normalize attraction records without changing the input."""

    missing_columns = REQUIRED_COLUMNS - set(df.columns)

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {sorted(missing_columns)}"
        )

    cleaned = df.copy()

    # Required identifiers must exist and be unique.
    for column in ["place_id", "name", "city"]:
        cleaned[column] = (
            cleaned[column].astype("string").str.strip()
        )

        cleaned[column] = cleaned[column].replace("", pd.NA)

        if cleaned[column].isna().any():
            raise ValueError(
                f"Required field '{column}' contains empty values."
            )

    if cleaned["place_id"].duplicated().any():
        raise ValueError("Duplicate place_id values detected.")

    # Normalize selected text fields.
    for column in TEXT_COLUMNS:
        if column in cleaned.columns:
            cleaned[column] = (
                cleaned[column].astype("string").str.strip()
            )

    # Normalize categorical labels consistently.
    for column in ["primary_category", "subcategory"]:
        cleaned[column] = cleaned[column].str.title()

    # Normalize comma-separated tags without changing their meaning.
    def normalize_tags(value):
        if pd.isna(value):
            return pd.NA

        tags = [
            tag.strip().lower()
            for tag in str(value).split(",")
            if tag.strip()
        ]

        # Remove duplicate tags while preserving their order.
        tags = list(dict.fromkeys(tags))

        return ",".join(tags) if tags else pd.NA

    cleaned["interest_tags"] = cleaned["interest_tags"].map(
        normalize_tags
    ).astype("string")

    # Parse numeric fields explicitly.
    numeric_columns = [
        "latitude",
        "longitude",
        "entry_fee",
        "visitor_count",
        "review_count",
        "estimated_visit_duration_hours",
        "interest_tag_count",
    ]

    for column in numeric_columns:
        if column in cleaned.columns:
            cleaned[column] = pd.to_numeric(
                cleaned[column], errors="coerce"
            )

    # The source dataset uses -1 to mean unknown.
    for column in SENTINEL_COLUMNS:
        if column in cleaned.columns:
            cleaned.loc[cleaned[column] == -1, column] = float("nan")

    # Other negative fees/counts are invalid, not real measurements.
    for column in ["entry_fee", "visitor_count", "review_count"]:
        if column in cleaned.columns:
            cleaned.loc[cleaned[column] < 0, column] = float("nan")

    # Validate coordinate ranges.
    if {"latitude", "longitude"}.issubset(cleaned.columns):
        invalid_lat = ~cleaned["latitude"].between(-90, 90)
        invalid_lon = ~cleaned["longitude"].between(-180, 180)

        cleaned.loc[invalid_lat, "latitude"] = float("nan")
        cleaned.loc[invalid_lon, "longitude"] = float("nan")

    # Visit duration must be positive to be usable.
    duration = cleaned["estimated_visit_duration_hours"]
    cleaned.loc[duration <= 0, "estimated_visit_duration_hours"] = (
        float("nan")
    )

    return cleaned


def main() -> None:
    source_path = find_raw_dataset()
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    raw_df = pd.read_csv(source_path)
    cleaned_df = preprocess_dataframe(raw_df)

    output_path = PROCESSED_DIR / "attractions_clean.csv"
    cleaned_df.to_csv(output_path, index=False)

    print("Preprocessing completed.")
    print(f"Input: {source_path}")
    print(f"Output: {output_path}")
    print(f"Original shape: {raw_df.shape}")
    print(f"Cleaned shape: {cleaned_df.shape}")
    print("\nUnknown values after cleaning:")
    print(
        cleaned_df.isna()
        .sum()
        .sort_values(ascending=False)
        .to_string()
    )


if __name__ == "__main__":
    main()
