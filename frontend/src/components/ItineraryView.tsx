import { formatFee, formatHours, formatMinutes, formatRupees, titleCase } from "../lib/format";
import type { BudgetStatus, ItineraryResponse, Preferences, SelectedPlace, TimeStatus } from "../types";
import AttractionImage from "./AttractionImage";

interface Props {
  data: ItineraryResponse;
  prefs: Preferences;
  onBackToSelection: () => void;
  onNewTrip: () => void;
}

const TIME_TEXT: Record<TimeStatus, { tone: string; text: string }> = {
  fits_available_time: { tone: "ok", text: "Fits your available time" },
  exceeds_available_time: { tone: "bad", text: "Exceeds your available time" },
};

const BUDGET_TEXT: Record<BudgetStatus, { tone: string; text: string }> = {
  fits_budget: { tone: "ok", text: "Known fees fit your budget" },
  exceeds_budget: { tone: "bad", text: "Known fees exceed your budget" },
  unknown_fees: { tone: "warn", text: "Budget can’t be fully verified" },
};

export default function ItineraryView({ data, prefs, onBackToSelection, onNewTrip }: Props) {
  const { itinerary } = data;
  const byId = new Map<string, SelectedPlace>((data.selected_places ?? []).map((p) => [p.place_id, p]));
  const time = TIME_TEXT[data.time_status] ?? { tone: "warn", text: "Time status unknown" };
  const budget = BUDGET_TEXT[data.budget_status] ?? { tone: "warn", text: "Budget status unknown" };
  const unknown = data.unknown_entry_fee_count;

  return (
    <article className="itinerary">
      <header className="it-head">
        <p className="eyebrow">Your itinerary · {data.destination}</p>
        <h2 tabIndex={-1} data-autofocus>{itinerary.title}</h2>
        <p className="lead">{itinerary.summary}</p>
      </header>

      <section className="overview" aria-label="Trip overview">
        <div>
          <p className="ov-label">Estimated visit time</p>
          <p className="ov-value">{formatMinutes(data.estimated_visit_minutes)}</p>
          <p className="ov-sub">of {formatMinutes(data.available_time_minutes)} available</p>
          <span className={`pill ${time.tone}`}>{time.text}</span>
        </div>
        <div>
          <p className="ov-label">Known entry fees</p>
          <p className="ov-value">{formatRupees(data.known_entry_fee_total)}</p>
          <p className="ov-sub">
            budget {formatRupees(data.budget)}
            {unknown > 0 && ` · ${unknown} fee${unknown === 1 ? "" : "s"} unknown`}
          </p>
          <span className={`pill ${budget.tone}`}>{budget.text}</span>
        </div>
        <div>
          <p className="ov-label">Places</p>
          <p className="ov-value">{data.selected_count}</p>
          <p className="ov-sub">
            {prefs.interests.length > 0 ? prefs.interests.map(titleCase).join(", ") : "No specific interests"}
          </p>
        </div>
      </section>

      <ol className="stops">
        {itinerary.stops.map((stop, idx) => {
          const place = byId.get(stop.place_id);
          const name = place?.name ?? stop.place_id;
          return (
            <li key={`${stop.place_id}-${idx}`} className="stop">
              <div className="stop-num" aria-hidden="true">{String(idx + 1).padStart(2, "0")}</div>
              <div className="stop-photo">
                <AttractionImage
                  placeId={stop.place_id}
                  name={name}
                  category={place?.category}
                  ratio="4 / 3"
                  sizes="(min-width: 900px) 360px, 100vw"
                  credit
                />
              </div>
              <div className="stop-text">
                <p className="rec-kicker">{place ? `${titleCase(place.category)} · ${place.destination}` : "Stop"}</p>
                <h3>{name}</h3>
                {place && (
                  <p className="stop-meta">
                    {formatHours(place.estimated_visit_duration_hours)}
                    <span aria-hidden="true"> · </span>
                    <span className={place.entry_fee == null ? "warn-text" : ""}>{formatFee(place.entry_fee)}</span>
                  </p>
                )}
                <dl>
                  <dt>Why here</dt>
                  <dd>{stop.reason_for_order}</dd>
                  <dt>What to do</dt>
                  <dd>{stop.visit_plan}</dd>
                  <dt>Good to know</dt>
                  <dd>{stop.practical_tip}</dd>
                </dl>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="two-col">
        {itinerary.general_tips.length > 0 && (
          <section>
            <h3 className="col-title">Travel tips</h3>
            <ul className="bullets">
              {itinerary.general_tips.map((t, i) => (<li key={i}>{t}</li>))}
            </ul>
          </section>
        )}
        {itinerary.caveats.length > 0 && (
          <section className="caveats">
            <h3 className="col-title">Caveats</h3>
            <ul className="bullets">
              {itinerary.caveats.map((t, i) => (<li key={i}>{t}</li>))}
            </ul>
          </section>
        )}
      </div>

      <p className="fineprint">
        Visit times are dataset estimates. VOYA does not calculate travel time
        between places or verify opening hours and current ticket prices.
      </p>

      <div className="it-actions">
        <button type="button" className="btn btn-secondary" onClick={onBackToSelection}>← Change selection</button>
        <button type="button" className="btn btn-secondary" onClick={() => window.print()}>Print itinerary</button>
        <button type="button" className="btn btn-primary" onClick={onNewTrip}>Plan a new trip</button>
      </div>
    </article>
  );
}
