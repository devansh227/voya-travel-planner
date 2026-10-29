import { useCallback, useEffect, useRef, useState } from "react";
import { fetchRecommendations, generateItinerary } from "./api/client";
import ItineraryView from "./components/ItineraryView";
import Landing from "./components/Landing";
import CreditsView from "./components/CreditsView";
import Header from "./components/Header";
import type { NavTarget } from "./components/Header";
import PreferenceForm from "./components/PreferenceForm";
import RecommendationsView from "./components/RecommendationsView";
import Stepper from "./components/Stepper";
import { MAX_SELECTION, TOP_K } from "./constants";
import type {
  ItineraryResponse,
  Preferences,
  Recommendation,
} from "./types";

type Step = "landing" | "preferences" | "recommendations" | "itinerary" | "credits";

const EMPTY_PREFS: Preferences = {
  destination: "",
  budget: 0,
  availableMinutes: 0,
  interests: [],
};

export default function App() {
  const [step, setStep] = useState<Step>("landing");
  const [prefs, setPrefs] = useState<Preferences>(EMPTY_PREFS);
  const [items, setItems] = useState<Recommendation[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);

  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recsError, setRecsError] = useState<unknown>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<unknown>(null);

  // Ignore responses from superseded requests.
  const requestId = useRef(0);
  const mainRef = useRef<HTMLElement>(null);

  // Move focus to the new step's heading for keyboard / screen-reader users.
  useEffect(() => {
    window.scrollTo({ top: 0 });
    mainRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus({ preventScroll: true });
  }, [step]);

  const submitPrefs = useCallback(async (next: Preferences) => {
    const id = ++requestId.current;
    setPrefs(next);
    setLoadingRecs(true);
    setRecsError(null);
    try {
      const res = await fetchRecommendations({
        destination: next.destination,
        budget: next.budget,
        available_time_minutes: next.availableMinutes,
        interests: next.interests,
        top_k: TOP_K,
      });
      if (id !== requestId.current) return;
      setItems(res.recommendations);
      setSelected([]);
      setGenError(null);
      setStep("recommendations");
    } catch (err) {
      if (id !== requestId.current) return;
      setRecsError(err);
    } finally {
      if (id === requestId.current) setLoadingRecs(false);
    }
  }, []);

  const toggle = useCallback((placeId: string) => {
    setSelected((cur) => {
      if (cur.includes(placeId)) return cur.filter((p) => p !== placeId);
      if (cur.length >= MAX_SELECTION) return cur;
      return [...cur, placeId];
    });
  }, []);

  const generate = useCallback(async () => {
    if (generating || selected.length === 0) return;
    const id = ++requestId.current;
    setGenerating(true);
    setGenError(null);
    try {
      const res = await generateItinerary({
        destination: prefs.destination,
        selected_place_ids: selected,
        budget: prefs.budget,
        available_time_minutes: prefs.availableMinutes,
        interests: prefs.interests,
      });
      if (id !== requestId.current) return;
      setItinerary(res);
      setStep("itinerary");
    } catch (err) {
      if (id !== requestId.current) return;
      setGenError(err);
    } finally {
      if (id === requestId.current) setGenerating(false);
    }
  }, [generating, selected, prefs]);

  const newTrip = useCallback(() => {
    requestId.current++;
    setItems([]);
    setSelected([]);
    setItinerary(null);
    setRecsError(null);
    setGenError(null);
    setGenerating(false);
    setLoadingRecs(false);
    setStep("preferences");
  }, []);

  const stepIndex =
    step === "preferences" ? 0 : step === "recommendations" ? 1 : step === "itinerary" ? 2 : null;

  const goHome = () => {
    requestId.current++;
    setLoadingRecs(false);
    setGenerating(false);
    setStep("landing");
  };

  const handleNav = (target: NavTarget) => {
    if (target === "credits") {
      setStep("credits");
      return;
    }
    if (step !== "landing") goHome();
    window.setTimeout(() => {
      document.getElementById(target === "how" ? "how" : "destinations")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const startPlanning = () => {
    // Keep any in-progress trip; only move to the form if not mid-flow.
    setStep(items.length > 0 && step === "credits" ? "recommendations" : "preferences");
  };

  const wide = step === "landing";

  return (
    <div className="app">
      <a className="skip-link" href="#main">Skip to content</a>
      <Header onHome={goHome} onNav={handleNav} onPlan={startPlanning} />
      {stepIndex !== null && (
        <div className="stepbar">
          <Stepper current={stepIndex as 0 | 1 | 2} />
        </div>
      )}

      <main id="main" ref={mainRef} className={wide ? "" : "page"}>
        {step === "landing" && <Landing onStart={() => setStep("preferences")} />}

        {step === "preferences" && (
          <PreferenceForm initial={prefs} loading={loadingRecs} error={recsError} onSubmit={submitPrefs} />
        )}

        {step === "recommendations" && (
          <RecommendationsView
            prefs={prefs}
            items={items}
            selected={selected}
            generating={generating}
            error={genError}
            onToggle={toggle}
            onClear={() => setSelected([])}
            onGenerate={generate}
            onBack={() => setStep("preferences")}
          />
        )}

        {step === "itinerary" && itinerary && (
          <ItineraryView
            data={itinerary}
            prefs={prefs}
            onBackToSelection={() => setStep("recommendations")}
            onNewTrip={newTrip}
          />
        )}

        {step === "credits" && <CreditsView onBack={goHome} />}
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <span className="wordmark small">VOYA</span>
          <p>
            Rule-based recommendations over a curated Madhya Pradesh dataset ·
            itineraries written by Gemini · photographs via Wikimedia Commons
          </p>
        </div>
      </footer>
    </div>
  );
}
