from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATASET_PATH = PROJECT_ROOT / "data" / "processed" / "attractions_clean.csv"


# Normalize common user phrases to vocabulary found in our dataset.
INTEREST_ALIASES = {
    "historical": "history",
    "historic": "history",
    "historical places": "history",
    "architecture": "architecture",
    "food": "food",
    "nature": "nature",
    "religious": "spirituality",
    "spiritual": "spirituality",
    "wildlife": "wildlife",
    "heritage": "heritage",
    "photography": "photography",
}


def normalize(value: str) -> str:
    return value.strip().lower().replace("_", " ")


def load_attractions(path: Path = DATASET_PATH) -> pd.DataFrame:
    """Load the processed dataset once for reuse."""

    if not path.exists():
        raise FileNotFoundError(f"Processed dataset not found: {path}")

    df = pd.read_csv(path)

    required = {
        "place_id",
        "name",
        "city",
        "primary_category",
        "interest_tags",
        "entry_fee",
        "estimated_visit_duration_hours",
    }

    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns: {sorted(missing)}")

    return df


def recommend_attractions(
    df: pd.DataFrame,
    destination: str,
    budget: float,
    available_time_minutes: int,
    interests: list[str],
    top_k: int = 10,
) -> list[dict]:
    """Filter and rank attractions using deterministic content matching."""

    if budget < 0:
        raise ValueError("Budget cannot be negative.")

    if available_time_minutes <= 0:
        raise ValueError("Available time must be positive.")

    if top_k <= 0:
        raise ValueError("top_k must be positive.")

    destination_key = normalize(destination)

    candidates = df[
        df["city"].fillna("").map(normalize) == destination_key
    ].copy()

    if candidates.empty:
        return []

    requested = {
        INTEREST_ALIASES.get(normalize(item), normalize(item))
        for item in interests
        if item.strip()
    }

    candidates["_duration"] = pd.to_numeric(
        candidates["estimated_visit_duration_hours"],
        errors="coerce",
    )

    candidates["_fee"] = pd.to_numeric(
        candidates["entry_fee"],
        errors="coerce",
    )

    # These are individual-attraction checks, not whole-trip guarantees.
    candidates = candidates[
        candidates["_duration"].notna()
        & (candidates["_duration"] > 0)
        & (candidates["_duration"] * 60 <= available_time_minutes)
        & (
            candidates["_fee"].isna()
            | (candidates["_fee"] <= budget)
        )
    ].copy()

    results = []

    for _, row in candidates.iterrows():
        tags = {
            normalize(tag)
            for tag in str(row["interest_tags"]).split(",")
            if tag.strip() and tag.strip().lower() != "nan"
        }

        category = normalize(str(row["primary_category"]))

        matched_tags = requested & tags
        category_match = category in requested

        # Transparent baseline score, not a trained probability.
        tag_score = (
            len(matched_tags) / len(requested)
            if requested
            else 0.0
        )

        score = 0.7 * tag_score + 0.3 * float(category_match)

        reasons = []

        if matched_tags:
            reasons.append(
                "Matches interests: "
                + ", ".join(sorted(matched_tags))
            )

        if category_match:
            reasons.append(f"Matches category: {category}")

        if not requested:
            reasons.append("No interests supplied; destination and feasibility matched")

        if pd.isna(row["_fee"]):
            reasons.append("Entry fee unknown; budget suitability unverified")

        results.append(
            {
                "place_id": row["place_id"],
                "name": row["name"],
                "destination": row["city"],
                "category": row["primary_category"],
                "interest_tags": row["interest_tags"],
                "estimated_visit_duration_hours": float(row["_duration"]),
                "entry_fee": (
                    None if pd.isna(row["_fee"])
                    else float(row["_fee"])
                ),
                "relevance_score": round(score, 4),
                "reasons": reasons,
            }
        )

    # Stable tie-breakers make repeated requests deterministic.
    results.sort(
        key=lambda item: (
            -item["relevance_score"],
            normalize(item["name"]),
            item["place_id"],
        )
    )

    return results[:top_k]
