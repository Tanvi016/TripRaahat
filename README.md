# TripRaahat — Travel Disruption Recovery

**One trip. Every booking. One intelligent recovery.**

HackCelestial — PS2: Travel Disruption Recovery Engine. A working interactive prototype:
Normal Trip → Flight Disruption → What Changed? → Find Options → Compare Plans → Choose Plan → Update Trip → Trip Recovered.

## Project layout

```
AGENTS.md        — project spec & acceptance criteria (source of truth)
DESIGN.md        — design system & UX spec (source of truth)
frontend/        — the full app (React JS + Vite + TailwindCSS 3 + React Router + Framer Motion + Lucide)
backend/         — reserved for a later backend milestone (empty stub)
```

## Run the app

```bash
cd frontend
npm install
npm run dev        # dev server → http://localhost:5173
npm test           # Vitest suites for the shared state machine, impact, finance, deadlines, assistant
npm run build      # production build (registers the offline service worker)
```

## Demo script

1. Land on `/` → **Explore TripSync** (or **See how it works** → Play the demo → Start the demo in TripSync).
2. On Home, tap **Simulate a disruption** (demo control) — AI-123 gets cancelled and the whole connected trip reacts.
3. **Find the best options** → compare the three recovery plans (fastest / save money / next morning) with detailed itineraries.
4. **Choose this** → **Update my trip** → **Your trip is recovered** — itinerary, finance, group, documents and the assistant all update from one shared state.
5. Try the Assistant (travel-only, with typing indicator), the **online/offline pulse** (tap it to simulate offline), and the document vault upload.

All data is mock/demo data. All prices in INR (₹). UI is English.
