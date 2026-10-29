
from app.ml.recommender import load_attractions


def plan_itinerary(
    destination: str,
    selected_place_ids: list[str],
    budget: float,
    available_time_minutes: int,
) -> dict:
    df = load_attractions()

    destination_matches = df[
        df["city"].astype(str).str.strip().str.casefold()
        == destination.strip().casefold()
    ]

    if destination_matches.empty:
        raise ValueError(f"Unknown destination: {destination}")

    selected = destination_matches[
        destination_matches["place_id"].astype(str).isin(selected_place_ids)
    ].copy()

    found_ids = set(selected["place_id"].astype(str))
    missing_ids = set(selected_place_ids) - found_ids

    if missing_ids:
        raise ValueError(
            "These place IDs were not found in the requested destination: "
            + ", ".join(sorted(missing_ids))
        )

    # Preserve the order selected by the user.
    selected["place_id"] = selected["place_id"].astype(str)
    selected = selected.set_index("place_id").loc[selected_place_ids].reset_index()

    selected["estimated_visit_duration_hours"] = (
        selected["estimated_visit_duration_hours"]
        .astype(float)
    )

    total_minutes = int(
        selected["estimated_visit_duration_hours"].sum() * 60
    )

    known_fees = selected["entry_fee"].astype(float)
    unknown_fee_count = int(known_fees.isna().sum())
    known_fee_total = float(known_fees.sum())

    if total_minutes > available_time_minutes:
        time_status = "exceeds_available_time"
    else:
        time_status = "fits_available_time"

    if unknown_fee_count:
        budget_status = "unknown_fees"
    elif known_fee_total > budget:
        budget_status = "exceeds_budget"
    else:
        budget_status = "fits_budget"

    places = []

    for _, row in selected.iterrows():
        fee = row["entry_fee"]

        places.append({
            "place_id": str(row["place_id"]),
            "name": str(row["name"]),
            "destination": str(row["city"]),
            "category": str(row["primary_category"]),
            "estimated_visit_duration_hours": float(
                row["estimated_visit_duration_hours"]
            ),
            "entry_fee": None if pd_is_missing(fee) else float(fee),
        })

    return {
        "destination": destination.strip(),
        "selected_places": places,
        "selected_count": len(places),
        "estimated_visit_minutes": total_minutes,
        "available_time_minutes": available_time_minutes,
        "time_status": time_status,
        "known_entry_fee_total": known_fee_total,
        "unknown_entry_fee_count": unknown_fee_count,
        "budget": budget,
        "budget_status": budget_status,
    }


def pd_is_missing(value) -> bool:
    return value is None or bool(__import__("pandas").isna(value))
