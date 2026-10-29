
from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATASET_PATH = PROJECT_ROOT / "data" / "raw" / "voya_madhya_pradesh_rich_dataset_complete_cleaned.csv"


def audit_dataset(path: Path) -> None:
    """Print a reproducible overview of the tourism dataset."""

    if not path.exists():
        raise FileNotFoundError(
            f"Dataset not found: {path}\n"
            "Place the CSV in data/raw/attractions_raw.csv."
        )

    df = pd.read_csv(path)

    print("\n========== DATASET OVERVIEW ==========")
    print(f"File: {path.name}")
    print(f"Shape: {df.shape}")
    print(f"Rows: {len(df)}")
    print(f"Columns: {len(df.columns)}")

    print("\n========== COLUMN NAMES ==========")
    print(df.columns.tolist())

    print("\n========== DATA TYPES ==========")
    print(df.dtypes.to_string())

    print("\n========== MISSING VALUES ==========")
    print(
        df.isna()
        .sum()
        .sort_values(ascending=False)
        .to_string()
    )

    print("\n========== DUPLICATE RECORDS ==========")
    print(f"Fully duplicated rows: {df.duplicated().sum()}")

    if "place_id" in df.columns:
        print(
            "Duplicate place IDs:",
            df["place_id"].duplicated().sum(),
        )

    print("\n========== SAMPLE RECORDS ==========")
    print(df.head(5).to_string(index=False))

    print("\n========== DATASET AUDIT COMPLETE ==========")


if __name__ == "__main__":
    audit_dataset(DATASET_PATH)
