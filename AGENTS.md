# AGENTS.md — TripSync

## Project Identity
HackCelestial — PS2: Travel Disruption Recovery Engine — Intelligent Travel Resilience.
Product: **TripSync**
Tagline: **One trip. Every booking. One intelligent recovery.**

TripSync is a consumer-facing travel disruption recovery platform. It understands a connected trip across flights, transfers, hotels, activities, deadlines, documents, and group members, then helps the traveler recover the journey. This must be a working interactive hackathon prototype, not a static collection of screens.

## Non-Negotiable Stack
Use:
- React JS
- JavaScript only
- Vite
- TailwindCSS 3
- React Router
- Framer Motion
- Lucide React

**DO NOT USE TYPESCRIPT.** No `.ts`, `.tsx`, TypeScript interfaces/types, or TypeScript configuration.

Run with:
`npm install`
`npm run dev`

Avoid unnecessary dependencies and frameworks.

## Product Principles
Build behavior, not just visuals. The core demo is:

Normal Trip → Flight Disruption → What Changed? → Find Options → Compare Plans → Choose Plan → Update Trip → Trip Recovered.

Use one shared trip state across all screens. Suggested states:
- normal
- disrupted
- recovery options
- plan selected
- recovered
- offline

Use React Context or another lightweight state solution. Do not duplicate mock data between pages.

No dead primary buttons. Every CTA must navigate, open a modal, update state, or perform a meaningful action.

## Traveler-Facing Language
Prefer:
- Connected bookings
- What does this affect?
- What changed?
- What should I do?
- Money you could lose
- Best options for you
- Find options
- Compare options
- Choose this
- Update my trip
- Fix my trip
- Don't miss your refund
- Your flight was cancelled
- Your trip is recovered

Avoid in the main UI:
- Dependency Graph
- Blast Radius
- Orchestration
- Optimization Engine
- Downstream Components
- Autonomous Recovery Engine
- Resource Allocation
- Predictive Analytics
- Recovery Optimization
- Cascade Failure
- Impact Analysis

Technical terms may appear in code comments/documentation, not primary tourist UI.

## Shared Demo Scenario
Traveler: Tanvi
Trip: Mumbai → Delhi → Manali
Dates: 12–18 September 2026
Group: 5 travelers
Members:
- Tanvi — affected
- Aisha — continuing
- Rahul — continuing
- Riya — continuing
- Karan — continuing

Flight: Air India AI-123
Original departure: 8:30 AM
Demo disruption: cancelled

Transfer: Delhi Airport → Hotel
Hotel: Mountain View Residency
Stay: 12–16 September
Activity: Solang Valley Adventure
Return: Delhi → Mumbai, 18 September

Demo deadline:
Hotel refund deadline: 10h 42m remaining
Potential refund: ₹6,500

Recovery examples:
- Fastest: 2:15 PM, +₹2,400
- Save Money: 5:30 PM, +₹1,100
- Next Morning: ₹0, but hotel needs changing

These are mock/demo values.

## Architecture
Prefer:
src/
  components/
  pages/
  context/
  data/
  utils/
  assets/
  App.jsx
  main.jsx
  index.css

Create reusable components for navigation, trip cards, booking cards, alerts, deadlines, recovery plans, documents, group members, connected-trip visualization, assistant messages, and modals.

Avoid giant monolithic components.

## Phase 1 — App Shell + Home + Shared State
Build:
- responsive app shell
- desktop sidebar
- mobile bottom navigation
- Home
- centralized mock data
- shared TripContext/state
- theme foundation

Acceptance: Home works at desktop/mobile widths and reflects shared state.

## Phase 2 — Disruption → Impact → Recovery
Build:
- disruption trigger
- disruption alert
- "What does this affect?"
- connected bookings
- Recovery Center
- three recovery plans
- plan selection
- trip update
- recovered state

This is the highest-priority hackathon demo flow.

## Phase 3 — Group Travel + Documents + Deadline Guard
Build:
- group members
- affected vs continuing travelers
- document vault
- disruption-aware document suggestions
- cancellation/refund deadline cards
- contextual notifications

## Phase 4 — AI Assistant + Offline Mode
Build:
- TripSync travel assistant
- trip-aware responses
- offline/cached state
- saved itinerary/documents/policies
- truthful offline messaging

Do not pretend live information is available offline.

## Phase 5 — Responsive Polish + Demo Flow
Test:
360px, 390px, 768px, 1024px, 1280px+, 1440px+.

Remove horizontal overflow, dead interactions, console errors, inconsistent spacing, and visual inconsistencies.

## Quality Gate
Before completion verify:
- no TypeScript
- no console errors
- no broken routes
- no dead primary CTAs
- no horizontal overflow
- shared state updates across pages
- cancellation affects connected bookings
- recovery selection updates itinerary
- Deadline Guard is actionable
- Group Travel separates affected/unaffected travelers
- relevant documents surface during disruption
- offline mode exposes cached information
- assistant uses current trip state
- light mode is default
- UI is understandable without technical explanation

Do not mark a phase complete until its acceptance behavior works.