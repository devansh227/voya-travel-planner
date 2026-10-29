import { useMemo } from "react";
import { MAX_SELECTION } from "../constants";
import { formatMinutes, formatRupees } from "../lib/format";
import type { Preferences, Recommendation } from "../types";
import ErrorBanner from "./ErrorBanner";
import RecommendationCard from "./RecommendationCard";

interface Props {
  prefs: Preferences;
  items: Recommendation[];
  selected: string[];
  generating: boolean;
  error: unknown;
  onToggle: (id: string) => void;
  onClear: () => void;
  onGenerate: () => void;
  onBack: () => void;
}

export default function RecommendationsView({
  prefs,
  items,
  selected,
  generating,
  error,
  onToggle,
  onClear,
  onGenerate,
  onBack,
}: Props) {
  const selectedItems = useMemo(
    () => items.filter((i) => selected.includes(i.place_id)),
    [items, selected],
  );

  const totalMinutes = Math.round(
    selectedItems.reduce((s, i) => s + (i.estimated_visit_duration_hours || 0) * 60, 0),
  );
  const knownFees = selectedItems.reduce((s, i) => s + (i.entry_fee ?? 0), 0);
  const unknownFees = selectedItems.filter((i) => i.entry_fee == null).length;
  const overTime = totalMinutes > prefs.availableMinutes;
  const atLimit = selected.length >= MAX_SELECTION;

  return (
    <div>
      <div className="section-head">
        <div>
          <p className="eyebrow">Step two</p>
          <h2 tabIndex={-1} data-autofocus>
            Places in {prefs.destination}
          </h2>
          <p className="muted">
            {items.length > 0
              ? `${items.length} attraction${items.length === 1 ? "" : "s"} matched. Select the ones you’d like to visit (up to ${MAX_SELECTION}).`
              : "No attractions matched."}
          </p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={onBack} disabled={generating}>
          ← Edit preferences
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card empty">
          <h3>No attractions found</h3>
          <p>
            Nothing in the dataset fits “{prefs.destination}” with a budget of{" "}
            {formatRupees(prefs.budget)} and {formatMinutes(prefs.availableMinutes)}.
            Each attraction must fit your time individually, and known entry
            fees must fit your budget. Try a different destination, more time,
            or a higher budget.
          </p>
          <button type="button" className="btn btn-primary" onClick={onBack}>
            Change preferences
          </button>
        </div>
      ) : (
        <ul className="rec-grid" aria-label="Recommended attractions">
          {items.map((item) => {
            const isSel = selected.includes(item.place_id);
            return (
              <RecommendationCard
                key={item.place_id}
                item={item}
                selected={isSel}
                disabled={generating || (!isSel && atLimit)}
                showScore={prefs.interests.length > 0}
                onToggle={() => onToggle(item.place_id)}
              />
            );
          })}
        </ul>
      )}

      {error != null && (
        <ErrorBanner error={error} onRetry={onGenerate} retryLabel="Retry itinerary" />
      )}

      {items.length > 0 && (
        <div className="action-bar" role="region" aria-label="Your selection">
          <div className="action-info" aria-live="polite">
            <strong>
              {selected.length} selected
              {atLimit ? ` (max ${MAX_SELECTION})` : ""}
            </strong>
            {selected.length > 0 && (
              <span className="muted">
                ≈ {formatMinutes(totalMinutes)} of visits
                {overTime && (
                  <span className="warn-text"> · over your {formatMinutes(prefs.availableMinutes)}</span>
                )}
                {" · "}
                {formatRupees(knownFees)} known fees
                {unknownFees > 0 && ` + ${unknownFees} unknown`}
              </span>
            )}
          </div>
          <div className="action-btns">
            {selected.length > 0 && (
              <button type="button" className="btn btn-ghost" onClick={onClear} disabled={generating}>
                Clear
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={onGenerate}
              disabled={generating || selected.length === 0}
            >
              {generating ? (
                <>
                  <span className="spinner" aria-hidden="true" /> Generating…
                </>
              ) : (
                "Generate My Itinerary"
              )}
            </button>
          </div>
        </div>
      )}

      {generating && (
        <p className="muted center" role="status">
          Building your itinerary with Gemini — this can take up to a minute.
        </p>
      )}
    </div>
  );
}
