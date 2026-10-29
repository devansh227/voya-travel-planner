import type {
  ItineraryRequest,
  ItineraryResponse,
  RecommendationRequest,
  RecommendationResponse,
} from "../types";

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"
).replace(/\/+$/, "");

export type ApiErrorKind =
  | "network" // backend unreachable
  | "timeout"
  | "rate_limit" // Gemini 429 surfaced by the backend as 503
  | "unavailable" // 5xx from backend / Gemini
  | "validation" // 400 / 422
  | "invalid_response" // 2xx but unexpected shape
  | "unknown";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

function describeDetail(detail: unknown): string | null {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    // FastAPI/Pydantic 422: [{ loc: [...], msg: "..." }]
    const parts = detail
      .map((item) => {
        if (item && typeof item === "object" && "msg" in item) {
          const loc = Array.isArray((item as { loc?: unknown }).loc)
            ? ((item as { loc: unknown[] }).loc.slice(1).join(".") || "")
            : "";
          return `${loc ? loc + ": " : ""}${String((item as { msg: unknown }).msg)}`;
        }
        return null;
      })
      .filter((p): p is string => Boolean(p));
    return parts.length ? parts.join("; ") : null;
  }
  return null;
}

async function post<TReq, TRes>(
  path: string,
  body: TReq,
  timeoutMs: number,
  validate: (data: unknown) => data is TRes,
): Promise<TRes> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(
        "timeout",
        "The request took too long. Please try again.",
      );
    }
    throw new ApiError(
      "network",
      `Could not reach the VOYA server at ${BASE_URL}. Make sure the backend is running.`,
    );
  } finally {
    window.clearTimeout(timer);
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const detail = describeDetail(
      payload && typeof payload === "object"
        ? (payload as { detail?: unknown }).detail
        : null,
    );
    const status = response.status;

    if (status === 400 || status === 422) {
      throw new ApiError(
        "validation",
        detail ?? "The server rejected the request.",
        status,
      );
    }
    if (status === 503 && detail && /rate-limited/i.test(detail)) {
      throw new ApiError("rate_limit", detail, status);
    }
    if (status >= 500) {
      throw new ApiError(
        "unavailable",
        detail ?? "The server had a problem. Please try again.",
        status,
      );
    }
    throw new ApiError(
      "unknown",
      detail ?? `Unexpected response (${status}).`,
      status,
    );
  }

  if (!validate(payload)) {
    throw new ApiError(
      "invalid_response",
      "The server returned data in an unexpected format.",
      response.status,
    );
  }
  return payload;
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

function isRecommendationResponse(v: unknown): v is RecommendationResponse {
  return (
    isObj(v) &&
    Array.isArray(v.recommendations) &&
    v.recommendations.every(
      (r) =>
        isObj(r) &&
        typeof r.place_id === "string" &&
        typeof r.name === "string",
    )
  );
}

function isItineraryResponse(v: unknown): v is ItineraryResponse {
  if (!isObj(v) || !isObj(v.itinerary)) return false;
  const it = v.itinerary;
  return (
    Array.isArray(v.selected_places) &&
    Array.isArray(it.stops) &&
    typeof it.title === "string" &&
    typeof it.summary === "string" &&
    Array.isArray(it.general_tips) &&
    Array.isArray(it.caveats)
  );
}

export function fetchRecommendations(
  req: RecommendationRequest,
): Promise<RecommendationResponse> {
  return post("/api/recommendations/", req, 20_000, isRecommendationResponse);
}

export function generateItinerary(
  req: ItineraryRequest,
): Promise<ItineraryResponse> {
  // Gemini can be slow; allow a generous timeout.
  return post("/api/itinerary/", req, 120_000, isItineraryResponse);
}
