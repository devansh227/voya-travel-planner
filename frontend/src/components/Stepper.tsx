const STEPS = ["Preferences", "Choose places", "Your itinerary"];

export default function Stepper({ current }: { current: 0 | 1 | 2 }) {
  return (
    <ol className="stepper" aria-label="Progress">
      {STEPS.map((label, i) => (
        <li
          key={label}
          className={i === current ? "active" : i < current ? "done" : ""}
          aria-current={i === current ? "step" : undefined}
        >
          <span className="step-num" aria-hidden="true">
            {i < current ? "✓" : i + 1}
          </span>
          <span className="step-label">{label}</span>
        </li>
      ))}
    </ol>
  );
}
