// Mirrors the FastAPI schemas in app/schemas and the real endpoint responses.

export interface RecommendationRequest {
  destination: string;
  budget: number;
  available_time_minutes: number;
  interests: string[];
  top_k: number;
}

/** One item of `recommendations` from POST /api/recommendations/ */
export interface Recommendation {
  place_id: string;
  name: string;
  destination: string;
  category: string;
  /** Comma-separated string, e.g. "history,heritage,architecture" */
  interest_tags?: string | null;
  estimated_visit_duration_hours: number;
  /** null = unknown. Never treat as zero. */
  entry_fee: number | null;
  relevance_score: number;
  reasons: string[];
}

export interface RecommendationResponse {
  destination: string;
  count: number;
  recommendations: Recommendation[];
}

export interface ItineraryRequest {
  destination: string;
  selected_place_ids: string[];
  budget: number;
  available_time_minutes: number;
  interests: string[];
}

export interface SelectedPlace {
  place_id: string;
  name: string;
  destination: string;
  category: string;
  estimated_visit_duration_hours: number;
  entry_fee: number | null;
}

export interface ItineraryStop {
  place_id: string;
  reason_for_order: string;
  visit_plan: string;
  practical_tip: string;
}

export interface ItineraryContent {
  title: string;
  summary: string;
  stops: ItineraryStop[];
  general_tips: string[];
  caveats: string[];
}

export type TimeStatus = "fits_available_time" | "exceeds_available_time";
export type BudgetStatus = "fits_budget" | "exceeds_budget" | "unknown_fees";

/** Response of POST /api/itinerary/ (planning context + generated itinerary) */
export interface ItineraryResponse {
  destination: string;
  selected_places: SelectedPlace[];
  selected_count: number;
  estimated_visit_minutes: number;
  available_time_minutes: number;
  time_status: TimeStatus;
  known_entry_fee_total: number;
  unknown_entry_fee_count: number;
  budget: number;
  budget_status: BudgetStatus;
  itinerary: ItineraryContent;
}

export interface Preferences {
  destination: string;
  budget: number;
  /** Stored in minutes, as the API expects. */
  availableMinutes: number;
  interests: string[];
}
