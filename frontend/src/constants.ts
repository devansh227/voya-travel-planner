// Interest keys match the vocabulary in the tourism dataset / recommender.
export const INTERESTS: { value: string; label: string }[] = [
  { value: "history", label: "History" },
  { value: "architecture", label: "Architecture" },
  { value: "nature", label: "Nature" },
  { value: "food", label: "Food" },
  { value: "spirituality", label: "Spirituality" },
  { value: "wildlife", label: "Wildlife" },
  { value: "photography", label: "Photography" },
  { value: "heritage", label: "Heritage" },
  { value: "culture", label: "Culture" },
  { value: "adventure", label: "Adventure" },
];

// Cities with the most attractions in the dataset. Free text is still
// accepted; the backend returns no results for unknown destinations.
export const DESTINATIONS = [
  "Bhopal",
  "Indore",
  "Gwalior",
  "Ujjain",
  "Mandu",
  "Pachmarhi",
  "Orchha",
  "Khajuraho",
  "Jabalpur",
  "Amarkantak",
  "Burhanpur",
  "Chanderi",
  "Rewa",
  "Sanchi",
  "Maheshwar",
  "Omkareshwar",
];

/** Backend limit: selected_place_ids max_length=20. */
export const MAX_SELECTION = 20;
/** Backend limit: top_k le=50. */
export const TOP_K = 20;
