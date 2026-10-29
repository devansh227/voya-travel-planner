
from app.ml.recommender import load_attractions, recommend_attractions

df = load_attractions()

print("Dataset shape:", df.shape)
print("Unique destinations:", df["city"].nunique())
print("\nAvailable destinations:")
print(sorted(df["city"].dropna().unique())[:20])

results = recommend_attractions(
    df=df,
    destination="Bhopal",
    budget=1000,
    available_time_minutes=360,
    interests=["history", "architecture", "photography"],
    top_k=10,
)

print(f"\nRecommendations found: {len(results)}")

for index, place in enumerate(results, start=1):
    print(f"\n{index}. {place['name']}")
    print("   Category:", place["category"])
    print("   Duration:", place["estimated_visit_duration_hours"], "hours")
    print("   Entry fee:", place["entry_fee"])
    print("   Score:", place["relevance_score"])
    print("   Reasons:", ", ".join(place["reasons"]))
