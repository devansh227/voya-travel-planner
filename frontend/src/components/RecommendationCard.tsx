import type { Recommendation } from "../types";
import { formatFee, formatHours, parseTags, titleCase } from "../lib/format";
import AttractionImage from "./AttractionImage";

interface Props {
  item: Recommendation;
  selected: boolean;
  disabled: boolean;
  showScore: boolean;
  onToggle: () => void;
}

export default function RecommendationCard({ item, selected, disabled, showScore, onToggle }: Props) {
  const tags = parseTags(item.interest_tags);
  const feeUnknown = item.entry_fee == null;
  const reasons = Array.isArray(item.reasons) ? item.reasons : [];
  const score =
    typeof item.relevance_score === "number" && Number.isFinite(item.relevance_score)
      ? Math.round(item.relevance_score * 100)
      : null;

  return (
    <li className={`rec${selected ? " selected" : ""}`}>
      <AttractionImage
        placeId={item.place_id}
        name={item.name}
        category={item.category}
        ratio="4 / 3"
        sizes="(min-width: 1000px) 33vw, (min-width: 640px) 50vw, 100vw"
      />
      <div className="rec-body">
        <p className="rec-kicker">
          {titleCase(item.category ?? "")} · {item.destination}
        </p>
        <h3 className="rec-name">{item.name}</h3>

        <dl className="rec-facts">
          <div>
            <dt>Visit</dt>
            <dd>{formatHours(item.estimated_visit_duration_hours)}</dd>
          </div>
          <div>
            <dt>Entry</dt>
            <dd className={feeUnknown ? "warn-text" : ""}>{formatFee(item.entry_fee)}</dd>
          </div>
          {showScore && score !== null && (
            <div>
              <dt>Match</dt>
              <dd>{score}%</dd>
            </div>
          )}
        </dl>

        {tags.length > 0 && (
          <ul className="tags" aria-label="Interests">
            {tags.slice(0, 4).map((t) => (
              <li key={t}>{titleCase(t)}</li>
            ))}
          </ul>
        )}

        {reasons.length > 0 && (
          <ul className="reasons">
            {reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        )}

        {feeUnknown && (
          <p className="note">Entry fee unknown — budget fit can’t be verified.</p>
        )}

        <button
          type="button"
          className={`select-btn${selected ? " on" : ""}`}
          aria-pressed={selected}
          disabled={disabled}
          onClick={onToggle}
        >
          <span aria-hidden="true" className="select-mark">{selected ? "✓" : "+"}</span>
          {selected ? "Added to trip" : "Add to trip"}
          <span className="sr-only"> — {item.name}</span>
        </button>
      </div>
    </li>
  );
}
