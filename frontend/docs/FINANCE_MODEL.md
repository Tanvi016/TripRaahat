# TripSync — Finance Model

## Overview

TripSync tracks three finance tracks: **Ongoing**, **Upcoming**, and **Completed**. Each track serves a different traveler need.

---

## Tracks

### 1. Ongoing (Current Trip)

The active trip the traveler is currently on. Shows real-time financial status.

**What's shown**:
- Total budget (₹40,000 for the demo trip)
- Spent so far (sum of all bookings + recovery extra cost if applied)
- Money at risk (hotel refund if deadline missed, pre-recovery)
- Money saved (refund from recovery plan, if any)
- Money lost (extra cost from recovery plan, if any)
- Remaining budget (budget − spent + refund)
- Budget usage bar (visual indicator of spend vs budget)
- Recovery cost impact (when a plan is applied)

**Page**: `/app/finance` → "Ongoing" tab (default)

**Components**:
- `FinancePanel.jsx` — quick-glance stats on the home dashboard
- `PersonalExpenseCard.jsx` — personal expense breakdown (overview/breakdown/settlement tabs)
- `GroupExpenseLedger.jsx` — group master ledger (rooms, settlement, recovery costs)

### 2. Upcoming (Planned Trips)

Trips the traveler is planning but hasn't started. Shows costs, payment deadlines, and booking status.

**What's shown**:
- Trip title, route, dates
- Total cost
- Payment deadlines (e.g., "Train ticket payment due · 20 Sep 2026 · ₹3,200")
- Booking status links (IRCTC, MakeMyTrip, etc.)
- Detail line (e.g., "2 travelers · Flight + beach resort")

**Demo data**: Goa Getaway (₹14,200, 10–14 Oct 2026, train ticket payment due 20 Sep)

**Page**: `/app/finance` → "Upcoming" tab

### 3. Completed (Past Trips)

Trips that have finished. Shows total spend and invoice access.

**What's shown**:
- Trip title, route, dates
- Total cost
- Detail line (e.g., "2 travelers · Heritage hotel + lake tour")
- Invoice links (download, view)

**Demo data**: Udaipur Weekend (₹24,500, 2–4 Aug 2026)

**Page**: `/app/finance` → "Completed" tab

---

## Financial Calculations

### Personal Expenses

Each traveler's cost = base trip share + room cost share + recovery cost (if affected).

```
personalCost = (totalBookings / numTravelers) + roomShare + recoveryCost
```

### Room Cost Split

Room costs are split equally among occupants:

```
perPerson = roomTotalCost / occupantCount
```

### Settlement Matrix

Net balance = what they paid − what they should pay:

```
netBalance = paid - shouldPay
```

- **Positive** → others owe them money
- **Negative** → they owe others money
- **Zero** → fully settled

**Reconciliation guarantee**: Sum of all net balances = ₹0.

### Recovery Cost Allocation

In the demo:
- The affected traveler bears the recovery extra cost
- The model supports strategy-based allocation for production:
  - Wait Together: affected pays extra, group may incur accommodation extension
  - Catch-Up: affected pays extra, group continues (no extra)
  - Independent: each traveler pays their own recovery costs

---

## Data Model

### demoTrip.js Finance Fields

```js
// Ongoing trip
BUDGET = 40000  // total approved budget

// Group structure
groupMembers = [
  { id, name, affected, note },
  ...
]

// Bookings (current trip)
currentBookings = {
  outboundFlight: { price: 4200, ... },
  transfer: { price: 1200, ... },
  hotel: { price: 18000, refund: { potential: 6500, ... }, ... },
  activity: { price: 2500, ... },
  returnFlight: { price: 4800, ... },
}

// Recovery plans
recoveryPlans = [
  { id, extraCost, refund, hotelStatus, ... },
  ...
]

// Rooms
roomAssignments = {
  'room-tanvi-aisha': { occupants: ['tanvi', 'aisha'], label: '...' },
  ...
}

sharedRoomCosts = {
  'room-tanvi-aisha': 5000,
  ...
}

personalExpenses = {
  tanvi: { base: 8700, roomShare: 2500, recovery: 0 },
  ...
}

// Other trips
trips = {
  upcoming: [{ id, title, route, datesLabel, status, amount, detail, nextDeadline, links }],
  completed: [{ id, title, route, datesLabel, status, amount, detail, links }],
}
```

---

## UI Components

| Component | Purpose | Page |
|---|---|---|
| `FinancePanel` | Quick budget/spent/at-risk/remaining glance | Home dashboard |
| `PersonalExpenseCard` | Personal expense overview, breakdown, settlement | Finance page (Ongoing) + Home |
| `GroupExpenseLedger` | Group master ledger: rooms, settlement, recovery costs | Finance page (Ongoing) + Group page |
| `FinanceTabs` | Tab navigation (Ongoing/Upcoming/Completed) | Finance page |
| `FinanceStat` | Reusable stat card (icon + label + value + sub) | Finance page |
| `TripFinanceRow` | Trip row for upcoming/completed lists | Finance page |

---

## Flow: Disruption → Finance Update

1. Traveler triggers disruption (flight cancelled)
2. Trip phase changes to `disrupted`
3. Finance shows "at risk" amount (hotel refund potential)
4. Traveler selects recovery plan → phase changes to `plan-selected` → `recovered`
5. Finance updates:
   - Spent += extra cost of chosen plan
   - Saved = refund from plan (if any)
   - At risk = 0 (refund secured or lost depending on plan)
   - Remaining recalculated
6. Group expense ledger recalculates:
   - Affected member's recovery cost updated
   - Settlement matrix recomputed
   - Net balances shift
7. All changes flow through `TripContext` → `computeFinance()` + `expenseCalculations.js`

---

## Known Limitations

1. **Equal base cost split** — demo assumes all members share base costs equally. Production would use per-member booking data.
2. **Single affected traveler** — demo has only Tanvi affected. Model supports multiple affected travelers.
3. **No credit/debt tracking over time** — settlement is computed fresh from current state. No historical debt ledger.
4. **No currency conversion** — all values in INR (₹). Foreign trips would need FX rates.
5. **No receipt scanning / OCR** — document vault is manual upload (demo).
