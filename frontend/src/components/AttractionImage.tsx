import { useState } from "react";
import {
  commonsImageUrl,
  commonsPageUrl,
  getAttractionImage,
} from "../data/attractionImages";
import { titleCase } from "../lib/format";

interface Props {
  placeId: string;
  /** Attraction name from the backend (used for alt text and the placeholder). */
  name: string;
  category?: string;
  /** CSS aspect-ratio value, e.g. "4 / 3". */
  ratio?: string;
  sizes?: string;
  eager?: boolean;
  /** Show a "Photo: …" credit line under the image. */
  credit?: boolean;
  className?: string;
}

/**
 * Shows the curated photograph for a place_id. If there is none (or it fails
 * to load) a plain, clearly labelled placeholder is shown instead; no
 * look-alike picture is ever substituted.
 */
export default function AttractionImage({
  placeId,
  name,
  category,
  ratio = "4 / 3",
  sizes = "(min-width: 900px) 33vw, 100vw",
  eager = false,
  credit = false,
  className = "",
}: Props) {
  const entry = getAttractionImage(placeId);
  const [failed, setFailed] = useState(false);
  const showPhoto = entry && !failed;

  return (
    <figure className={`aimg ${className}`}>
      <div className="aimg-frame" style={{ aspectRatio: ratio }}>
        {showPhoto ? (
          <img
            src={commonsImageUrl(entry.file, 800)}
            srcSet={`${commonsImageUrl(entry.file, 640)} 640w, ${commonsImageUrl(entry.file, 1024)} 1024w, ${commonsImageUrl(entry.file, 1280)} 1280w`}
            sizes={sizes}
            alt={`${entry.subject}`}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="aimg-fallback" role="img" aria-label={`No photograph available for ${name}`}>
            <span className="aimg-fallback-cat">{category ? titleCase(category) : "Madhya Pradesh"}</span>
            <span className="aimg-fallback-note">Photograph not available</span>
          </div>
        )}
      </div>
      {credit && showPhoto && (
        <figcaption className="aimg-credit">
          {entry.subject.toLowerCase() === name.toLowerCase() ? "Photo" : `Photo: ${entry.subject}`}
          {" · "}
          <a href={commonsPageUrl(entry.file)} target="_blank" rel="noopener noreferrer">
            Wikimedia Commons
          </a>
        </figcaption>
      )}
    </figure>
  );
}
