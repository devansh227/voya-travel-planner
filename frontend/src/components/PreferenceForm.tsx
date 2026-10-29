import { useId, useState } from "react";
import type { FormEvent } from "react";
import { DESTINATIONS, INTERESTS } from "../constants";
import type { Preferences } from "../types";
import { EDITORIAL } from "../data/attractionImages";
import AttractionImage from "./AttractionImage";
import ErrorBanner from "./ErrorBanner";

interface Props {
  initial: Preferences;
  loading: boolean;
  error: unknown;
  onSubmit: (prefs: Preferences) => void;
}

interface FieldErrors {
  destination?: string;
  budget?: string;
  hours?: string;
}

export default function PreferenceForm({ initial, loading, error, onSubmit }: Props) {
  const uid = useId();
  const [destination, setDestination] = useState(initial.destination);
  const [budget, setBudget] = useState(
    initial.budget >= 0 && initial.destination ? String(initial.budget) : "",
  );
  const [hours, setHours] = useState(
    initial.availableMinutes > 0 ? String(initial.availableMinutes / 60) : "",
  );
  const [interests, setInterests] = useState<string[]>(initial.interests);
  const [errors, setErrors] = useState<FieldErrors>({});

  function toggle(value: string) {
    setInterests((cur) =>
      cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value],
    );
  }

  function validate(): Preferences | null {
    const next: FieldErrors = {};
    const dest = destination.trim();
    const budgetNum = budget.trim() === "" ? NaN : Number(budget);
    const hoursNum = hours.trim() === "" ? NaN : Number(hours);

    if (!dest) next.destination = "Enter a destination.";
    if (!Number.isFinite(budgetNum) || budgetNum < 0)
      next.budget = "Enter a budget of ₹0 or more.";
    if (!Number.isFinite(hoursNum) || hoursNum <= 0)
      next.hours = "Enter an amount of time greater than zero.";
    else if (hoursNum > 72) next.hours = "Please enter 72 hours or fewer.";

    setErrors(next);
    if (Object.keys(next).length) return null;

    return {
      destination: dest,
      budget: budgetNum,
      availableMinutes: Math.round(hoursNum * 60),
      interests,
    };
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    const prefs = validate();
    if (prefs) onSubmit(prefs);
  }

  const listId = `${uid}-dest-list`;

  return (
    <div className="plan">
    <aside className="plan-aside">
      <p className="eyebrow">Step one</p>
      <h2 tabIndex={-1} data-autofocus>
        Tell us about your trip
      </h2>
      <p className="lead">
        We’ll find attractions that match — then you choose the ones you want to see.
      </p>
      <AttractionImage
        placeId={EDITORIAL.form}
        name="Royal chhatris, Orchha"
        category="Heritage"
        ratio="4 / 3"
        sizes="(min-width: 900px) 40vw, 100vw"
        credit
      />
    </aside>
    <form className="form" onSubmit={handleSubmit} noValidate>

      <div className="field">
        <label htmlFor={`${uid}-dest`}>Destination</label>
        <input
          id={`${uid}-dest`}
          list={listId}
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g. Bhopal"
          autoComplete="off"
          aria-invalid={Boolean(errors.destination)}
          aria-describedby={errors.destination ? `${uid}-dest-err` : undefined}
        />
        <datalist id={listId}>
          {DESTINATIONS.map((d) => (
            <option key={d} value={d} />
          ))}
        </datalist>
        {errors.destination && (
          <p className="field-error" id={`${uid}-dest-err`}>
            {errors.destination}
          </p>
        )}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor={`${uid}-budget`}>Budget (₹)</label>
          <input
            id={`${uid}-budget`}
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. 1000"
            aria-invalid={Boolean(errors.budget)}
            aria-describedby={errors.budget ? `${uid}-budget-err` : `${uid}-budget-help`}
          />
          {errors.budget ? (
            <p className="field-error" id={`${uid}-budget-err`}>
              {errors.budget}
            </p>
          ) : (
            <p className="field-help" id={`${uid}-budget-help`}>
              Total you plan to spend on entry fees.
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor={`${uid}-hours`}>Available time (hours)</label>
          <input
            id={`${uid}-hours`}
            type="number"
            inputMode="decimal"
            min={0.5}
            step="0.5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="e.g. 6"
            aria-invalid={Boolean(errors.hours)}
            aria-describedby={errors.hours ? `${uid}-hours-err` : `${uid}-hours-help`}
          />
          {errors.hours ? (
            <p className="field-error" id={`${uid}-hours-err`}>
              {errors.hours}
            </p>
          ) : (
            <p className="field-help" id={`${uid}-hours-help`}>
              Time for sightseeing, not travel.
            </p>
          )}
        </div>
      </div>

      <fieldset className="field">
        <legend>Interests</legend>
        <p className="field-help">Optional — choose as many as you like.</p>
        <div className="chips">
          {INTERESTS.map((i) => {
            const checked = interests.includes(i.value);
            return (
              <label key={i.value} className={`chip${checked ? " on" : ""}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(i.value)}
                />
                {i.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      {error != null && <ErrorBanner error={error} />}

      <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner" aria-hidden="true" /> Finding places…
          </>
        ) : (
          "Find attractions"
        )}
      </button>
    </form>
    </div>
  );
}
