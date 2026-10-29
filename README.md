# VOYA — AI tour guide for Madhya Pradesh

VOYA recommends real attractions from a curated Madhya Pradesh dataset and turns the ones you pick into a Gemini-written itinerary.

**Flow:** enter destination, budget (₹), time and interests → ranked attractions → select places → **Generate My Itinerary** → itinerary with stops, tips and caveats.

```
VOYA/
├── app/          FastAPI backend (recommender, planner, Gemini service)
├── data/         tourism CSVs
├── tests/        pytest suite (Gemini is mocked)
├── frontend/     React + Vite + TypeScript UI
├── requirements.txt
└── .env.example
```

## Photographs

Attraction photos come from Wikimedia Commons (freely licensed or public domain) and are mapped to the backend's stable `place_id` in `frontend/src/data/attractionImages.ts` (73 attractions covered). Attractions without an entry show a labelled placeholder, never a look-alike picture. The in-app **Photo credits** page links every file's Commons page, where the photographer and exact licence appear.

Files were matched to attractions by Commons file title; they were not individually inspected, and licences were not read file by file. To add or fix a photo, edit that one manifest entry (find the file on commons.wikimedia.org and use its exact file name).

## What it does and doesn't do

- Recommendations are **rule-based content matching** (interest tags + category), not a trained ML model. Scores are a transparent baseline, not probabilities.
- The planner sums estimated visit durations and **known** entry fees. Unknown fees are shown as unknown, never as ₹0, and the budget is then reported as not fully verifiable.
- It does **not** calculate travel routes or times, opening hours, traffic, or live ticket prices.

## Setup (macOS, VS Code terminal)

Requires Python 3.11+ and Node 20+ (Node 22 is fine).

### 1. Backend

```bash
cd ~/PROJECTS/VOYA
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env        # then edit .env
```

Set `GEMINI_API_KEY` and `GEMINI_MODEL` in `.env`. The key is read only by the backend; the frontend never sees it.

```bash
uvicorn app.main:app --reload --port 8000
```

Check it: <http://127.0.0.1:8000/health> and the API docs at <http://127.0.0.1:8000/docs>.

### 2. Frontend (second terminal)

```bash
cd ~/PROJECTS/VOYA/frontend
cp .env.example .env
npm install
npm run dev
```

Open <http://localhost:5173>.

`frontend/.env` only holds `VITE_API_BASE_URL` (default `http://127.0.0.1:8000`). Never put secrets in a `VITE_` variable — they are public in the built JavaScript.

## API used by the frontend

| Method | Path | Body |
|---|---|---|
| GET | `/health` | — |
| POST | `/api/recommendations/` | `destination`, `budget`, `available_time_minutes`, `interests[]`, `top_k` (1–50) |
| POST | `/api/itinerary/` | `destination`, `selected_place_ids[]` (1–20), `budget`, `available_time_minutes`, `interests[]` |

Types are in `frontend/src/types.ts`; the typed client is `frontend/src/api/client.ts`.

## Tests and checks

```bash
# backend (from project root, venv active)
python -m pytest -q

# frontend
cd frontend
npm run typecheck
npm run build
```

`tests/conftest.py` supplies placeholder `GEMINI_*` values so tests run without a real key (they mock Gemini). Real values in your shell or `.env` are never overridden.

## Backend changes made for the UI

- `app/main.py`: added CORS for `http://localhost:5173` and `http://127.0.0.1:5173` (override with `CORS_ORIGINS` in `.env`).
- Added `requirements.txt`, `.env.example`, `tests/conftest.py`, and extended `.gitignore`.

No endpoints, schemas, data or existing tests were changed.

## Troubleshooting

- **"Could not reach the VOYA server"** — backend isn't running, or `VITE_API_BASE_URL` is wrong. Restart `npm run dev` after editing `.env`.
- **Browser CORS error** — open the UI on `localhost:5173` or `127.0.0.1:5173`, or add your origin to `CORS_ORIGINS`.
- **"Gemini is temporarily rate-limited"** — wait a moment and use *Retry itinerary*; your selection is kept.
- **"Generated itinerary … validation"** — the backend rejects AI output that makes unsupported claims (e.g. exact travel times). Retrying usually works.
- **No attractions found** — each attraction must fit your time on its own and known fees must fit your budget. Try more time or budget.
