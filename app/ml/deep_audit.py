
from pathlib import Path

import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATASET_PATH = (
    PROJECT_ROOT
    / "data"
    / "raw"
    / "voya_madhya_pradesh_rich_dataset_complete_cleaned.csv"
)


def run_deep_audit() -> None:
    df = pd.read_csv(DATASET_PATH)

    print("\n=== DESTINATIONS ===")
    print(df["city"].value_counts().to_string())

    print("\n=== PRIMARY CATEGORIES ===")
    print(df["primary_category"].value_counts().to_string())

    print("\n=== SUBCATEGORIES ===")
    print(df["subcategory"].value_counts().to_string())

    print("\n=== INTEREST TAGS ===")
    tags = (
        df["interest_tags"]
        .dropna()
        .str.split(",")
        .explode()
        .str.strip()
        .str.lower()
    )
    print(tags.value_counts().to_string())

    print("\n=== NUMERIC SUMMARY ===")
    numeric_columns = df.select_dtypes(include="number").columns
    print(df[numeric_columns].describe().to_string())

    print("\n=== UNKNOWN SENTINEL COUNTS ===")
    for column in [
        "latitude",
        "longitude",
        "entry_fee",
        "visitor_count",
        "review_count",
    ]:
        if column in df.columns:
            print(f"{column}: {(df[column] == -1).sum()}")

    print("\n=== VERIFICATION STATUS ===")
    print(df["verification_status"].value_counts().to_string())

    print("\n=== AUDIT COMPLETE ===")


if __name__ == "__main__":
    run_deep_audit()
