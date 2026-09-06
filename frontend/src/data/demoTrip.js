/**
 * demoTrip.js — the SINGLE source of mock truth for the whole app.
 * Every page reads from here (via TripContext) — never duplicate mock data.
 * All values are demo values. All prices in INR (₹).
 */

export const BUDGET = 40000;

export const traveler = {
  id: 'tanvi',
  name: 'Tanvi',
  city: 'Mumbai',
};

/**
 * Room assignments for the trip.
 * Each room has an ID, total cost, and the member IDs of occupants.
 * Costs are split equally among occupants in the settlement model.
 */
export const roomAssignments = {
  'room-tanvi-aisha': {
    occupants: ['tanvi', 'aisha'],
    label: 'Room 101 · Tanvi + Aisha',
  },
  'room-rahul-riya': {
    occupants: ['rahul', 'riya'],
    label: 'Room 102 · Rahul + Riya',
  },
  'room-karan': {
    occupants: ['karan'],
    label: 'Room 103 · Karan (single)',
  },
};

export const sharedRoomCosts = {
  'room-tanvi-aisha': 5000, // ₹5,000 per room for 4 nights
  'room-rahul-riya': 4800,
  'room-karan': 3500, // single room premium
};

export const personalExpenses = {
  tanvi: { base: 8700, roomShare: 2500, recovery: 0 },
  aisha: { base: 8700, roomShare: 2500, recovery: 0 },
  rahul: { base: 8700, roomShare: 2400, recovery: 0 },
  riya: { base: 8700, roomShare: 2400, recovery: 0 },
  karan: { base: 8700, roomShare: 3500, recovery: 0 },
};

export const groupMembers = [
  { id: 'tanvi', name: 'Tanvi', affected: true, note: 'On the cancelled flight — needs a recovery plan' },
  { id: 'aisha', name: 'Aisha', affected: false },
  { id: 'rahul', name: 'Rahul', affected: false },
  { id: 'riya', name: 'Riya', affected: false },
  { id: 'karan', name: 'Karan', affected: false },
];

/* ------------------------------------------------------------------ */
/* Connected bookings of the current trip (Mumbai → Delhi → Manali)    */
/* `status` here is the healthy/original status; the reducer stamps    */
/* live statuses per trip phase.                                       */
/* ------------------------------------------------------------------ */

export const currentBookings = {
  outboundFlight: {
    id: 'outbound-flight',
    type: 'flight',
    label: 'Air India AI-123',
    subtitle: 'Mumbai → Delhi',
    origin: 'Mumbai',
    destination: 'Delhi',
    carrier: 'Air India',
    date: '2026-09-12',
    time: '8:30 AM',
    pnr: 'AI9X4K2',
    price: 4200,
    status: 'confirmed',
    links: [{ label: 'Air India · manage PNR', url: 'https://www.airindia.in/' }],
  },
  transfer: {
    id: 'delhi-transfer',
    type: 'transfer',
    label: 'Delhi Airport → Hotel',
    subtitle: 'Airport transfer',
    origin: 'Delhi Airport (T3)',
    destination: 'Interstate Bus Terminus → Manali road',
    date: '2026-09-12',
    time: '10:30 AM',
    provider: 'Uber Intercity',
    price: 1200,
    status: 'confirmed',
    links: [{ label: 'Book cab on Uber', url: 'https://www.uber.com/' }],
  },
  hotel: {
    id: 'mountain-view',
    type: 'hotel',
    label: 'Mountain View Residency',
    subtitle: 'Manali · Old Manali Road',
    location: 'Manali',
    checkIn: '2026-09-12',
    checkOut: '2026-09-16',
    nights: 4,
    price: 18000,
    status: 'confirmed',
    refund: {
      potential: 6500,
      deadlineOffsetMs: (10 * 60 + 42) * 60 * 1000, // 10h 42m from app start
    },
    links: [
      { label: 'View on MakeMyTrip', url: 'https://www.makemytrip.com/' },
      { label: 'View on Booking.com', url: 'https://www.booking.com/' },
    ],
  },
  activity: {
    id: 'solang-activity',
    type: 'activity',
    label: 'Solang Valley Adventure',
    subtitle: 'Paragliding + zipline',
    location: 'Solang Valley, Manali',
    date: '2026-09-14',
    time: '9:00 AM',
    provider: 'Thrillophilia',
    price: 2500,
    status: 'confirmed',
    links: [{ label: 'Book on Thrillophilia', url: 'https://www.thrillophilia.com/' }],
  },
  returnFlight: {
    id: 'return-flight',
    type: 'flight',
    label: 'Air India AI-224',
    subtitle: 'Delhi → Mumbai',
    origin: 'Delhi',
    destination: 'Mumbai',
    carrier: 'Air India',
    date: '2026-09-18',
    time: '4:00 PM',
    pnr: 'AI7H3Q1',
    price: 4800,
    status: 'confirmed',
    links: [{ label: 'Air India · manage PNR', url: 'https://www.airindia.in/' }],
  },
};

/** Display order of the connected chain: Flight → Transfer → Hotel → Activity (+ return) */
export const connectedChain = ['outboundFlight', 'transfer', 'hotel', 'activity', 'returnFlight'];

export const currentTripMeta = {
  id: 't1',
  title: 'Mumbai → Delhi → Manali',
  route: ['Mumbai', 'Delhi', 'Manali'],
  start: '12 Sep 2026',
  end: '18 Sep 2026',
  datesLabel: '12 – 18 Sep 2026',
  travelers: 5,
};

/* ------------------------------------------------------------------ */
/* Recovery plans — multimodal, with detailed itineraries + links      */
/* ------------------------------------------------------------------ */

export const recoveryPlans = [
  {
    id: 'fastest',
    tag: 'FASTEST',
    title: 'Quickest arrival',
    headline: '2:15 PM flight · reach Manali by evening',
    mode: 'flight',
    transport: 'Air India AI-204',
    route: 'Mumbai → Delhi',
    date: '2026-09-12',
    depTime: '2:15 PM',
    arrTime: '4:05 PM',
    duration: '1h 50m',
    extraCost: 2400,
    refund: 0,
    hotelStatus: 'works',
    hotelNote: 'Hotel booking stays unchanged',
    convenience: 'Most convenient',
    summary: 'Fastest option. Your hotel booking stays exactly as planned.',
    itinerary: [
      { kind: 'flight', title: 'Air India AI-204', meta: 'Mumbai → Delhi · 12 Sep · 2:15 PM – 4:05 PM', details: 'Terminal 2 → T3. Same-day arrival, plenty of buffer.', links: [{ label: 'View flight details', url: 'https://www.airindia.in/' }] },
      { kind: 'cab', title: 'Delhi Airport → Manali cab', meta: '12 Sep · 4:30 PM pickup', details: 'Prepaid intercity cab to Mountain View Residency.', links: [{ label: 'Book cab on Uber', url: 'https://www.uber.com/' }] },
      { kind: 'hotel', title: 'Mountain View Residency', meta: 'Check-in 5:30 PM · 12–16 Sep', details: 'Unchanged. Your existing booking still works.', links: [{ label: 'View hotel', url: 'https://www.makemytrip.com/' }] },
      { kind: 'restaurant', title: "Johnson's Café", meta: '12 Sep · 8:00 PM dinner', details: 'Old Manali · 2 km from hotel · ₹600 avg per person', links: [{ label: 'Menu on Zomato', url: 'https://www.zomato.com/' }] },
      { kind: 'activity', title: 'Solang Valley Adventure', meta: '14 Sep · 9:00 AM', details: 'Paragliding + zipline · ₹2,500 · unchanged', links: [{ label: 'View on Thrillophilia', url: 'https://www.thrillophilia.com/' }] },
      { kind: 'place', title: 'Hadimba Temple & Mall Road', meta: '15 Sep · afternoon', details: 'Free entry · 15 min walk from hotel', links: [{ label: 'Explore on TripAdvisor', url: 'https://www.tripadvisor.in/' }] },
    ],
  },
  {
    id: 'save-money',
    tag: 'SAVE MONEY',
    title: 'Saves ₹1,100 vs fastest',
    headline: '5:30 PM Vande Bharat · overnight, cheaper',
    mode: 'train',
    transport: 'Vande Bharat Express',
    route: 'Mumbai → Delhi',
    date: '2026-09-12',
    depTime: '5:30 PM',
    arrTime: '9:05 AM',
    duration: '15h 35m',
    extraCost: 1100,
    refund: 0,
    hotelStatus: 'works',
    hotelNote: 'Hotel booking stays unchanged',
    convenience: 'Sleep on the train',
    summary: 'Cheaper than the fastest flight, and your hotel booking still works.',
    itinerary: [
      { kind: 'train', title: 'Vande Bharat Express 12952', meta: 'Mumbai → Delhi · 12 Sep · 5:30 PM → 13 Sep · 9:05 AM', details: 'AC chair car · onboard meals included · book by 2 PM.', links: [{ label: 'Book on IRCTC', url: 'https://www.irctc.co.in/' }] },
      { kind: 'cab', title: 'Delhi → Manali cab', meta: '13 Sep · 9:30 AM pickup', details: 'Shared cab from Delhi station.', links: [{ label: 'Book cab on Uber', url: 'https://www.uber.com/' }] },
      { kind: 'hotel', title: 'Mountain View Residency', meta: 'Check-in 13 Sep · 12–16 Sep', details: 'Unchanged. One night (12 Sep) is not charged since the hotel allows late check-in.', links: [{ label: 'View hotel', url: 'https://www.makemytrip.com/' }] },
      { kind: 'restaurant', title: 'Café 1947', meta: '13 Sep · 7:30 PM dinner', details: 'Riverside café · ₹700 avg per person', links: [{ label: 'Menu on Zomato', url: 'https://www.zomato.com/' }] },
      { kind: 'activity', title: 'Solang Valley Adventure', meta: '14 Sep · 9:00 AM', details: 'Paragliding + zipline · ₹2,500 · unchanged', links: [{ label: 'View on Thrillophilia', url: 'https://www.thrillophilia.com/' }] },
      { kind: 'place', title: 'Manu Temple Walk', meta: '15 Sep · morning', details: 'Old Manali temple · scenic 20 min hike', links: [{ label: 'Explore on TripAdvisor', url: 'https://www.tripadvisor.in/' }] },
    ],
  },
  {
    id: 'next-morning',
    tag: 'NEXT MORNING',
    title: 'Free rebooking + ₹7,200 refund',
    headline: '6:00 AM flight · no extra cost · new hotel',
    mode: 'flight',
    transport: 'Air India AI-208',
    route: 'Mumbai → Delhi',
    date: '2026-09-13',
    depTime: '6:00 AM',
    arrTime: '7:50 AM',
    duration: '1h 50m',
    extraCost: 0,
    refund: 7200,
    hotelStatus: 'change',
    hotelNote: 'Hotel needs changing — Himalaya Homestay',
    convenience: 'Best for your wallet',
    summary: 'Free rebooking and a ₹7,200 refund — but you move to a different hotel in Manali.',
    itinerary: [
      { kind: 'flight', title: 'Air India AI-208', meta: 'Mumbai → Delhi · 13 Sep · 6:00 AM – 7:50 AM', details: 'Free rebooking — ₹0 extra. Early start, relaxed evening.', links: [{ label: 'View flight details', url: 'https://www.airindia.in/' }] },
      { kind: 'cab', title: 'Delhi → Manali cab', meta: '13 Sep · 8:30 AM pickup', details: 'Prepaid intercity cab.', links: [{ label: 'Book cab on Uber', url: 'https://www.uber.com/' }] },
      { kind: 'hotel', title: 'Himalaya Homestay (new)', meta: 'Check-in 13 Sep · 12–16 Sep · ₹12,800', details: 'Old Manali homestay with valley view. Mountain View Residency gives you a ₹7,200 refund.', links: [{ label: 'Book Himalaya Homestay', url: 'https://www.makemytrip.com/' }] },
      { kind: 'restaurant', title: "Dylan's Toasted & Roasted", meta: '13 Sep · 8:00 PM dinner', details: 'Famous mountain café · ₹500 avg per person', links: [{ label: 'Menu on Zomato', url: 'https://www.zomato.com/' }] },
      { kind: 'activity', title: 'Solang Valley Adventure', meta: '14 Sep · 9:00 AM', details: 'Paragliding + zipline · ₹2,500 · unchanged', links: [{ label: 'View on Thrillophilia', url: 'https://www.thrillophilia.com/' }] },
      { kind: 'place', title: 'Jogini Waterfall Trek', meta: '15 Sep · morning', details: 'Easy 2-hour trek · free entry', links: [{ label: 'Explore on TripAdvisor', url: 'https://www.tripadvisor.in/' }] },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Other trips (ongoing / upcoming / completed)                        */
/* ------------------------------------------------------------------ */

export const trips = {
  upcoming: [
    {
      id: 't2',
      title: 'Goa Getaway',
      route: ['Mumbai', 'Goa'],
      datesLabel: '10 – 14 Oct 2026',
      status: 'upcoming',
      amount: 14200,
      detail: '2 travelers · Flight + beach resort',
      nextDeadline: { label: 'Train ticket payment due', when: '20 Sep 2026', amount: 3200 },
      links: [{ label: 'View on IRCTC', url: 'https://www.irctc.co.in/' }],
    },
  ],
  completed: [
    {
      id: 't3',
      title: 'Udaipur Weekend',
      route: ['Mumbai', 'Udaipur'],
      datesLabel: '2 – 4 Aug 2026',
      status: 'completed',
      amount: 24500,
      detail: '2 travelers · Heritage hotel + lake tour',
      links: [{ label: 'Download invoice', url: 'https://www.makemytrip.com/' }],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Document vault                                                      */
/* ------------------------------------------------------------------ */

export const documents = [
  {
    id: 'doc-flight',
    title: 'Flight Ticket',
    subtitle: 'Air India AI-123 · PNR AI9X4K2',
    kind: 'ticket',
    relevantOnDisruption: true,
    secure: true,
    offline: true,
    file: { name: 'AI123-ticket.pdf', size: '214 KB', date: '02 Sep 2026' },
    content: 'Air India · AI-123 · Mumbai (BOM) T2 → Delhi (DEL) T3 · 12 Sep 2026 · 8:30 AM · Passenger: Tanvi Sharma · PNR AI9X4K2 · Seat 21A',
    links: [{ label: 'Air India · manage PNR', url: 'https://www.airindia.in/' }],
  },
  {
    id: 'doc-hotel',
    title: 'Hotel Booking',
    subtitle: 'Mountain View Residency, Manali',
    kind: 'hotel',
    relevantOnDisruption: true,
    secure: true,
    offline: true,
    file: { name: 'MVR-booking.pdf', size: '342 KB', date: '02 Sep 2026' },
    content: 'Mountain View Residency · Old Manali Road, Manali · 12–16 Sep 2026 · 2 Deluxe rooms · ₹18,000 total · Free cancellation until 12 Sep (refund ₹6,500)',
    links: [{ label: 'View on MakeMyTrip', url: 'https://www.makemytrip.com/' }],
  },
  {
    id: 'doc-insurance',
    title: 'Travel Insurance',
    subtitle: 'HDFC Ergo Travel Protect · Policy TR-88231',
    kind: 'insurance',
    relevantOnDisruption: true,
    secure: true,
    offline: true,
    file: { name: 'insurance-policy.pdf', size: '508 KB', date: '01 Sep 2026' },
    content: 'HDFC Ergo Travel Protect · Policy TR-88231 · Covers flight cancellation, missed connections and trip interruption up to ₹50,000 · Valid 12–19 Sep 2026 · 24x7 helpline +91-1800-266-2880',
    links: [{ label: 'File a claim', url: 'https://www.hdfcergo.com/' }],
  },
  {
    id: 'doc-passport',
    title: 'Passport',
    subtitle: 'Tanvi Sharma · Z1234567',
    kind: 'passport',
    relevantOnDisruption: false,
    secure: true,
    offline: true,
    file: { name: 'passport.pdf', size: '188 KB', date: '18 Jan 2026' },
    content: 'Passport · Tanvi Sharma · Z1234567 · Issued 18 Jan 2026 · Expires 17 Jan 2036 · Domestic travel ID (scanned copy)',
    links: [{ label: 'Passport seva portal', url: 'https://portal2.passportindia.gov.in/' }],
  },
];

/* ------------------------------------------------------------------ */
/* Disruption presets (demo trigger)                                   */
/* ------------------------------------------------------------------ */

export const disruptionPresets = [
  {
    id: 'flight-cancelled',
    label: 'Flight cancelled',
    detail: 'AI-123 · Mumbai → Delhi · 8:30 AM',
    message: 'Your flight AI-123 from Mumbai to Delhi was cancelled.',
  },
  {
    id: 'train-cancelled',
    label: 'Train cancelled',
    detail: 'Vande Bharat 12952 · Mumbai → Delhi',
    message: 'Your train was cancelled by the operator.',
  },
  {
    id: 'bus-cancelled',
    label: 'Bus cancelled',
    detail: 'Volvo · Delhi → Manali',
    message: 'Your bus from Delhi to Manali was cancelled.',
  },
];