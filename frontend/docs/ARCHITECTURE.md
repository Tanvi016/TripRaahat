# TripSync — Architecture

## Overview

TripSync is a React 18 single-page application built with Vite, Tailwind CSS 3, React Router 7, Framer Motion, and Lucide icons. It is written in JavaScript (no TypeScript).

**Core proposition**: *One trip. Every booking. One intelligent recovery.*

When a travel disruption occurs, TripSync understands the connected nature of a journey and helps the traveler recover the entire trip — protecting time, money, group coordination, documents, accommodation, onward travel, and cancellation/refund deadlines.

## Stack

- **React 18** — UI framework
- **Vite 6** — build tool / dev server
- **Tailwind CSS 3** — utility-first styling
- **React Router 7** — client-side routing
- **Framer Motion** — animations
- **Lucide React** — icons
- **Vitest** — unit tests
- **JavaScript** — no TypeScript

## State Management

### Single Source of Truth

`TripContext` (in `src/context/TripContext.jsx`) is the ONE shared state across all screens. It uses `useReducer` with `tripReducer` and persists to `localStorage` (`tripsync-state-v1`).

**State shape**:

```js
{
  // Existing
  phase: 'normal' | 'disrupted' | 'recovery-options' | 'plan-selected' | 'recovered',
  offline: boolean,
  bookings: { [key]: Booking },
  disruption: { presetId, label, message, detail } | null,
  selectedPlanId: string | null,
  appliedPlanId: string | null,
  deadlineTs: number,
  uploads: Upload[],
  toasts: Toast[],

  // SOS engine (NEW)
  sos: {
    lastKnownLocation: { latitude, longitude, accuracy, source, timestamp, connectivity } | null,
    gpsStatus: 'idle' | 'searching' | 'available' | 'unavailable' | 'denied' | 'unsupported',
    emergencyDocuments: string[],
    broadcastStatus: 'idle' | 'ready' | 'sent',
    activeEmergencyType: 'medical' | 'stranded' | 'documents' | 'police' | null,
    lastKnownLocationLabel: string | null,
  },

  // Group recovery (NEW)
  groupRecovery: {
    strategy: 'wait-together' | 'catch-up' | 'independent' | null,
    memberAssignments: { [memberId]: { status, note } },
    recoveryCosts: { [memberId]: number },
  },

  // Expense state (NEW — derived from data, cached for UI)
  expenses: {
    roomAssignments: { [roomId]: string[] },
    personalExpenses: { [memberId]: number },
    settlement: { [memberId]: number },
  },

  // UI preferences
  financeTab: 'overview' | 'breakdown' | 'settlement',
}
```

### Reducer Actions

**Existing**: `REPORT_DISRUPTION`, `FIND_OPTIONS`, `SELECT_PLAN`, `APPLY_PLAN`, `RESET_DEMO`, `SET_OFFLINE`, `ADD_UPLOAD`, `REMOVE_UPLOAD`, `PUSH_TOAST`, `DISMISS_TOAST`

**New**:
- `CAPTURE_LOCATION` — store a GPS or cached location
- `SET_SOS_STATUS` — update GPS status / active emergency type
- `REQUEST_SOS_OPEN` — trigger SOS modal open
- `SET_BROADCAST_STATUS` — update broadcast state
- `SELECT_GROUP_STRATEGY` — choose a group recovery strategy
- `UPDATE_MEMBER_STATUS` — update a member's recovery status
- `SET_GROUP_ASSIGNMENT` — set a member's assignment
- `SET_FINANCE_TAB` — switch finance tab

## Data Model

### demoTrip.js — Single Source of Mock Truth

All demo data lives in `src/data/demoTrip.js`. No component should duplicate this data.

**Key exports**:
- `BUDGET` — total trip budget (₹40,000)
- `traveler` — current traveler (Tanvi)
- `groupMembers` — 5 travelers (Tanvi, Aisha, Rahul, Riya, Karan)
- `currentBookings` — 5 connected bookings (flight, transfer, hotel, activity, return flight)
- `connectedChain` — display order of bookings
- `currentTripMeta` — trip title, route, dates, traveler count
- `recoveryPlans` — 3 recovery options (fastest, save-money, next-morning)
- `trips` — upcoming and completed trips
- `documents` — 4 cached documents (flight ticket, hotel booking, insurance, passport)
- `disruptionPresets` — 3 demo disruption triggers
- `roomAssignments` — 3 rooms with occupants
- `sharedRoomCosts` — cost per room
- `personalExpenses` — per-member expense breakdown

### Connected Trip Chain

The trip is modeled as a connected chain: **Flight → Transfer → Hotel → Activity → Return Flight**. A disruption to one node affects connected nodes. The `impact.js` utility computes the impact state for each node based on the current phase.

### Group Recovery Strategies

Three strategies handle group disruption:

1. **Wait Together** — Affected traveler waits; group pauses. Lowest group disruption, potentially higher cost.
2. **Catch-Up Rendezvous** — Affected traveler takes earliest recovery; group continues and meets at next common point. Balanced cost.
3. **Independent Split** — Each traveler follows their own path. Maximum flexibility, individual tracking needed.

The strategy selection updates shared state, which cascades to group statuses and expense recalculations.

### Expense Model

**Personal expenses**: Each traveler's cost = base trip share + room cost share + recovery cost (if affected).

**Room assignments**: Rooms have occupants; costs are split equally among occupants.

**Settlement matrix**: Net balance per traveler = what they paid − what they should pay.
- Positive = others owe them
- Negative = they owe others
- Sum of all net balances = ₹0 (reconciled)

**Recovery cost allocation**: In the demo, the affected traveler bears the recovery extra cost. The model supports strategy-based allocation for production.

## New Components

### SOS Engine

- **`src/services/locationService.js`** — geolocation wrapper: fresh GPS → cached last-known → itinerary fallback. Persists to localStorage.
- **`src/utils/emergencyUtils.js`** — message generation, maps URL, WhatsApp/SMS share URLs, location age formatting.
- **`src/data/emergencyData.js`** — demo emergency contacts (112, Air India Delhi T3 desk, tourist police 1363), destination fallback context, emergency document types.
- **`src/hooks/useEmergencySOS.js`** — SOS hook combining location, contacts, broadcast, document vault access.
- **`src/components/emergency/SOSModal.jsx`** — high-contrast emergency modal with 4 emergency types, location display, emergency contacts, offline document vault, broadcast CTA.

### Group Recovery Engine

- **`src/utils/groupRecovery.js`** — strategy definitions, member status computation, cost impact estimation, strategy recommendation.
- **`src/components/group/GroupRecoverySelector.jsx`** — 3-strategy selector with cost preview and review modal.
- **`src/components/group/GroupStatusBoard.jsx`** — visual board showing each member's status and recovery assignment.

### Expense Ledger

- **`src/utils/expenseCalculations.js`** — personal expenses, room assignments, settlement matrix, group master ledger.
- **`src/components/expenses/GroupExpenseLedger.jsx`** — group master ledger with settlement matrix and room assignments.
- **`src/components/expenses/PersonalExpenseCard.jsx`** — personal expense view with overview/breakdown/settlement tabs.

### Finance Section

- **`src/pages/app/FinancePage.jsx`** — full finance dashboard with Ongoing/Upcoming/Completed tabs.
- **`src/components/FinanceTabs.jsx`** — tab navigation component with `FinanceStat` and `TripFinanceRow` helpers.

## Routing

```
/                     → Landing page
/app                  → Home (dashboard)
/app/finance          → Finance dashboard (NEW)
/app/trip             → Trip detail
/app/recovery         → Recovery Center
/app/group            → Your Group (with group recovery + expense ledger)
/app/documents        → Documents vault (with SOS doc integration)
/app/deadlines        → Deadlines / refund timeline
/app/assistant        → AI Assistant
```

## Navigation

- **Desktop**: Sidebar (`Sidebar.jsx`) with collapsible navigation + SOS emergency button + offline indicator
- **Mobile**: Bottom nav (`BottomNav.jsx`) with 5 items + SOS button
- **App shell**: `AppShell.jsx` wraps all app routes with sidebar, main content, bottom nav, and toasts

## Offline / PWA

- **`public/sw.js`** — service worker for app shell caching
- **Last-known-location**: cached in `localStorage` (`tripsync-last-known-location`)
- **SOS offline**: works for cached location and in-memory documents without network
- **IndexedDB**: not yet implemented — in-memory / localStorage pattern used for demo. Pending for production.

## Design System

- **Dark Navy**: `#0c1f4a`
- **Cyan/Blue**: `#0284c7`
- **Light Cyan**: `#38bdf8`
- **Emergency red**: used ONLY for SOS/emergency states
- **Warning colors**: used for risk/deadline states
- **Glass morphism**: light frosted cards (`.glass`, `.glass-strong`)
- **Shadows**: `.shadow-card`, `.shadow-float`
- **Radius**: 2xl (rounded-2xl) for cards, 3xl for modals

## Landing Page

The landing page has a hero section with a responsive composition:
- **Desktop (lg+)**: 3D phone mockup with floating cards (perspective + rotateY/rotateX transform)
- **Mobile (<lg)**: vertical card stack showing trip bookings — no 3D transform, no fixed width, no absolute positioning. This fixes the "desktop inside mobile" issue.

## Known Limitations

1. **No real backend**: All data is mock/demo from `demoTrip.js`. Backend scaffold exists in `backend/`.
2. **No IndexedDB**: Document vault uses in-memory state + localStorage. Pending for production.
3. **No real geolocation backend**: GPS uses browser `navigator.geolocation` directly. Last-known-location cached in localStorage.
4. **No real-time sync**: Group recovery strategy selection is local state. No multi-user synchronization.
5. **Demo emergency contacts**: 112 (universal emergency), Air India Delhi T3 desk (1800-266-8202), tourist police helpline (1363). Marked as demo/configurable.
6. **No real WhatsApp/SMS sending**: Deep links open the respective apps; user must confirm before sending.
7. **Expense model is simplified**: Equal base cost split per member in demo. Production would use per-member booking data.
8. **No actual emergency services integration**: All contacts are phone numbers the user dials or deep-links to.
