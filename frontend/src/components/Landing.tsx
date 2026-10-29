import AttractionImage from "./AttractionImage";
import { EDITORIAL } from "../data/attractionImages";

interface Props {
  onStart: () => void;
}

const STEPS = [
  { n: "01", title: "Share your preferences", text: "Destination, budget in rupees, the hours you have and what draws you — history, nature, food, faith." },
  { n: "02", title: "Choose your places", text: "VOYA ranks real attractions from a curated Madhya Pradesh dataset. You decide which ones make the trip." },
  { n: "03", title: "Receive your itinerary", text: "A considered plan puts your picks in order, with practical tips and plain-spoken caveats." },
];

const GALLERY_LABELS: Record<string, string> = {
  MP0099: "Gwalior Fort",
  MP0025: "Jahaz Mahal, Mandu",
  MP0068: "Great Stupa, Sanchi",
  MP0145: "Marble Rocks, Bhedaghat",
  MP0153: "Kanha, tiger country",
};

export default function Landing({ onStart }: Props) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Madhya Pradesh · The heart of India</p>
          <h1>
            Travel that fits
            <br />
            <em>the time you have.</em>
          </h1>
          <p className="lead">
            From the temples of Khajuraho to the palaces of Gwalior, VOYA turns
            your budget, hours and interests into a considered itinerary for
            Madhya Pradesh.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary btn-lg" onClick={onStart}>
              Plan your journey
            </button>
            <a className="text-link" href="#how">How it works ↓</a>
          </div>
        </div>
        <div className="hero-photo">
          <AttractionImage
            placeId={EDITORIAL.hero}
            name="Kandariya Mahadeva Temple, Khajuraho"
            category="Heritage"
            ratio="4 / 5"
            sizes="(min-width: 900px) 44vw, 100vw"
            eager
            credit
          />
        </div>
      </section>

      <section className="section" id="how" aria-labelledby="how-title">
        <div className="wrap">
          <p className="eyebrow">The process</p>
          <h2 id="how-title">Three steps, no guesswork</h2>
          <ol className="steps">
            {STEPS.map((s) => (
              <li key={s.n} className="step">
                <span className="step-n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-alt" id="destinations" aria-labelledby="dest-title">
        <div className="wrap">
          <div className="section-head-row">
            <div>
              <p className="eyebrow">What awaits</p>
              <h2 id="dest-title">Heritage, architecture, nature and wildlife</h2>
            </div>
            <button type="button" className="btn btn-secondary" onClick={onStart}>Start planning</button>
          </div>
          <ul className="gallery">
            {EDITORIAL.gallery.map((g, i) => (
              <li key={g.id} className={`gallery-item gi-${i}`}>
                <AttractionImage
                  placeId={g.id}
                  name={GALLERY_LABELS[g.id]}
                  category={g.tag}
                  ratio={i === 0 ? "4 / 5" : "4 / 3"}
                  sizes="(min-width: 900px) 30vw, 100vw"
                />
                <p className="gallery-cap">
                  <span className="gallery-tag">{g.tag}</span>
                  {GALLERY_LABELS[g.id]}
                </p>
              </li>
            ))}
          </ul>
          <p className="fineprint">
            Recommendations use transparent, rule-based matching over a curated
            dataset. VOYA does not calculate travel routes, check opening hours
            or fetch live ticket prices — confirm details before you travel.
          </p>
        </div>
      </section>
    </>
  );
}
