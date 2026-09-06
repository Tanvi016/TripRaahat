# TripSync — Frontend API Endpoints

## Current State

This is a **frontend-only prototype**. There is no live backend. All data comes from `src/data/demoTrip.js` (mock/demo source of truth). The service layer uses browser APIs directly where applicable.

The documents below describe the **contract** each feature expects from a future backend, and how the current mock implementation fulfills that contract.

---

## 1. Trip State

### Contract

**No HTTP endpoint.** Trip state is managed entirely client-side via `TripContext` + `tripReducer`, persisted to `localStorage` (`tripsync-state-v1`).

### Mock Implementation

- Initial state: `getInitialState()` in `tripReducer.js`
- Persistence: `TripContext` `useEffect` saves to `localStorage` on every state change
- Reload: `loadInitial()` reads from `localStorage` or falls back to demo initial state

### Expected Backend (future)

```
GET    /api/trip/:tripId          → TripState
PATCH  /api/trip/:tripId          → partial state update
POST   /api/trip/:tripId/disruption → report a disruption
```

---

## 2. Geolocation / Last Known Location

### Contract

**Browser API** — no HTTP endpoint. Uses `navigator.geolocation` and `navigator.onLine`.

### Mock Implementation

- `src/services/locationService.js`:
  - `requestFreshLocation(timeoutMs)` → Promise resolving to `{ latitude, longitude, accuracy }`
  - `getLastKnownLocation()` → reads from `localStorage` (`tripsync-last-known-location`)
  - `cacheLocation(location)` → writes to `localStorage`
  - `startLocationTracking()` → watches position and updates cache
  - `isOnline()` → `navigator.onLine`
  - `clearCachedLocation()` → removes from localStorage

### Location Resolution Strategy (SOS)

1. Attempt fresh GPS via `navigator.geolocation.getCurrentPosition`
2. If fails → retrieve cached `lastKnownLocation` from localStorage
3. If no cached location → fallback to itinerary node (e.g., "Delhi Airport T3")
4. UI explicitly identifies the source: CURRENT GPS / LAST KNOWN / TRIP LOCATION

### Expected Backend (future)

```
GET    /api/location/last-known    → { latitude, longitude, accuracy, timestamp, source }
POST   /api/location/cache         → persist a verified location
```

---

## 3. Emergency Contacts

### Contract

**Static/demo data** — no HTTP endpoint. Configured per destination in `src/data/emergencyData.js`.

### Mock Implementation

- `emergencyContacts` array: 112 (national emergency/police/ambulance), Air India Delhi T3 desk (1800-266-8202), tourist police helpline (1363)
- `destinationContext` map: Delhi Airport T3, Manali, Mumbai fallbacks
- `emergencyDocTypes` array: passport, government ID, insurance, emergency travel document

### Expected Backend (future)

```
GET    /api/emergency/contacts?destination=:city → { contacts: EmergencyContact[] }
GET    /api/emergency/documents?tripId=:tripId   → { documents: EmergencyDocument[] }
```

**Note**: Phone numbers are `tel:` links. WhatsApp/SMS use `wa.me` and `sms:` deep links. No silent sending — user must explicitly confirm.

---

## 4. Group Recovery

### Contract

**Client-side state** — no HTTP endpoint. Strategy selection updates `TripContext`.

### Mock Implementation

- `src/utils/groupRecovery.js`:
  - `STRATEGIES` object: wait-together, catch-up, independent
  - `getAffectedMembers(state)` / `getContinuingMembers(state)`
  - `memberRecoveryStatus(member, state)` — derives status from phase + strategy
  - `estimateRecoveryCostImpact(planId, strategyId)` — cost breakdown per member
  - `recommendStrategy(state)` — suggests best strategy based on group composition

- `src/components/group/GroupRecoverySelector.jsx` — UI for selecting strategy with cost preview

### Expected Backend (future)

```
GET    /api/trip/:tripId/group/strategies   → { strategies: Strategy[] }
POST   /api/trip/:tripId/group/strategy     → { strategy: string }
GET    /api/trip/:tripId/group/status       → { members: MemberStatus[] }
```

---

## 5. Expenses / Settlement

### Contract

**Derived from data** — no HTTP endpoint. Calculations in `src/utils/expenseCalculations.js`.

### Mock Implementation

- `personalExpenses(memberId, state)` — personal cost breakdown
- `roomAssignmentSummary()` — who shares which room, cost per person
- `settlementMatrix(state)` — net balance per traveler, settlement pairs
- `groupMasterLedger(state)` — combined view

All calculations derive from `demoTrip.js` data. No hardcoded financial totals.

### Expected Backend (future)

```
GET    /api/trip/:tripId/expenses           → { personal: [], rooms: [], settlement: [] }
POST   /api/trip/:tripId/expenses/settlement → { settlements: Settlement[] }
```

---

## 6. Documents

### Contract

**In-memory + localStorage** — no HTTP endpoint. Documents from `demoTrip.js`. Uploads stored in state.

### Mock Implementation

- `documents` array in `demoTrip.js` — 4 demo documents (flight ticket, hotel booking, insurance, passport)
- Uploads: stored in `state.uploads` array, dispatched via `ADD_UPLOAD`
- SOS document vault: surfaces `documents.filter(d => d.relevantOnDisruption || d.kind === 'passport')` in SOS modal

### Offline Behavior

- Documents marked `offline: true` are available in the vault panel without network
- "Stored on this device" indicator shown in SOS vault
- No automatic upload — user-controlled access

### Expected Backend (future)

```
GET    /api/trip/:tripId/documents          → { documents: Document[] }
POST   /api/trip/:tripId/documents/upload   → { document: UploadedDocument }
GET    /api/trip/:tripId/documents/:id      → { document: Document } (PDF/stream)
```

---

## 7. Finance

### Contract

**Derived from data** — no HTTP endpoint. `computeFinance(state)` in `src/utils/finance.js`.

### Mock Implementation

- `computeFinance(state)` returns `{ budget, spent, atRisk, extra, refund, saved, lost, remaining }`
- Finance page (`FinancePage.jsx`) extends this with per-trip views (ongoing, upcoming, completed)
- `FinanceStat` and `TripFinanceRow` components render the data

### Expected Backend (future)

```
GET    /api/trip/:tripId/finance            → { budget, spent, atRisk, remaining, ... }
GET    /api/user/trips                      → { ongoing: Trip[], upcoming: Trip[], completed: Trip[] }
```

---

## Mock vs Real Behavior Summary

| Feature | Current | Future Backend |
|---|---|---|
| Trip state | localStorage + reducer | REST API per trip |
| Geolocation | browser API + localStorage cache | API for last-known + cache |
| Emergency contacts | static demo data | per-destination API |
| Group recovery | client-side state | strategy API + status API |
| Expenses | derived from data | expense + settlement API |
| Documents | in-memory + state | document storage + upload API |
| Finance | derived from data | finance API + trips API |

---

## Environment Variables

This frontend prototype uses **no environment variables**. All configuration is in code (`demoTrip.js`, `emergencyData.js`).

For production, expected env vars:

```
VITE_API_BASE_URL=          → backend base URL (e.g., https://api.tripsync.app)
VITE_PWA_ENABLED=true       → enable service worker + IndexedDB
VITE_GEOFENCE_ENABLED=true  → enable periodic location tracking
```
