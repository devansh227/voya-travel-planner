import { ATTRACTION_IMAGES, commonsPageUrl } from "../data/attractionImages";

export default function CreditsView({ onBack }: { onBack: () => void }) {
  const entries = Object.entries(ATTRACTION_IMAGES).sort((a, b) =>
    a[1].subject.localeCompare(b[1].subject),
  );
  return (
    <div className="wrap narrow">
      <p className="eyebrow">Photo credits</p>
      <h2 tabIndex={-1} data-autofocus>Photographs</h2>
      <p className="lead">
        All photographs are hosted on Wikimedia Commons, which accepts only
        freely licensed or public-domain media. Each link below opens the
        file’s Commons page, where the photographer and exact licence are
        shown.
      </p>
      <p className="fineprint">
        Photos were matched to attractions by their Commons file titles and
        have not been individually inspected. If you spot a mismatch, tell the
        project maintainer. Attractions without a listed photograph show a
        labelled placeholder.
      </p>
      <ul className="credits">
        {entries.map(([id, img]) => (
          <li key={id}>
            <span>{img.subject}</span>
            <a href={commonsPageUrl(img.file)} target="_blank" rel="noopener noreferrer">
              View on Commons ↗
            </a>
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn-secondary" onClick={onBack}>← Back</button>
    </div>
  );
}
