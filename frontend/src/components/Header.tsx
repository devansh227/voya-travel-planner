import { useState } from "react";
import Wordmark from "./Wordmark";

export type NavTarget = "how" | "destinations" | "credits";

interface Props {
  onHome: () => void;
  onNav: (target: NavTarget) => void;
  onPlan: () => void;
  planDisabled?: boolean;
}

export default function Header({ onHome, onNav, onPlan, planDisabled }: Props) {
  const [open, setOpen] = useState(false);

  const go = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <button type="button" className="brand" onClick={go(onHome)} aria-label="VOYA — home">
          <Wordmark />
        </button>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span className="menu-bars" aria-hidden="true" />
        </button>

        <nav id="site-nav" className={`site-nav${open ? " open" : ""}`} aria-label="Main">
          <button type="button" className="nav-link" onClick={go(() => onNav("how"))}>How it works</button>
          <button type="button" className="nav-link" onClick={go(() => onNav("destinations"))}>Destinations</button>
          <button type="button" className="nav-link" onClick={go(() => onNav("credits"))}>Photo credits</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={go(onPlan)} disabled={planDisabled}>
            Plan your journey
          </button>
        </nav>
      </div>
    </header>
  );
}
