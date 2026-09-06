# DESIGN.md — TripSync

## Product
**HackCelestial — PS2: Travel Disruption Recovery Engine — Intelligent Travel Resilience**

**TripSync — Intelligent Travel Disruption & Recovery Platform**
Tagline: **One trip. Every booking. One intelligent recovery.**

TripSync should feel like a trustworthy, premium consumer travel product. It must not resemble an airline operations dashboard, admin panel, generic OTA clone, or futuristic AI command center.

## 1. Design Direction
Core feeling:
- calm
- trustworthy
- intelligent
- travel-focused
- premium
- clear under stress

A traveler may open TripSync immediately after a cancellation. Reduce cognitive load.

**Default: LIGHT MODE.**

Use light backgrounds, white cards, dark navy text, blue primary actions, teal/green success states, orange attention states, and red disruption states.

## 2. Color System
Base:
- white
- very light blue/periwinkle
- soft grey
- dark navy

Primary:
- medium blue for navigation and primary actions

Positive:
- teal / emerald green for recovered, confirmed, safe, completed

Attention:
- yellow / amber / orange for deadline approaching, at risk, action needed

Critical:
- red for cancelled, urgent, expired, serious disruption

Do not make the interface monochromatic teal. Do not use neon colors, purple-heavy gradients, or dark futuristic backgrounds. Never rely on color alone; pair state colors with text/icons.

## 3. Typography
Use a modern, highly readable sans-serif. Large page titles, strong section headings, medium card headings, compact readable body copy. Avoid decorative fonts.

## 4. Card Language
Cards generally contain:
1. icon
2. clear title
3. 1–3 useful details
4. status
5. one primary action

Avoid technical information overload.

## 5. Home Screen
Answer:
1. Is my trip okay?
2. Is anything wrong?
3. What should I do?

Recommended order:
- greeting
- current trip
- disruption/status
- what changed
- money/deadline risk
- best recovery options
- upcoming itinerary

## 6. Connected Trip
Never label the traveler-facing component "Dependency Graph".

Use:
**What does this affect?**

Show:
Flight → Transfer → Hotel → Activity

When the flight is cancelled:
- Flight = red/cancelled
- Transfer = amber/at risk
- Hotel = amber/at risk if relevant
- Activity = affected if relevant
- recovery can return affected nodes to green

This is a core differentiator.

## 7. Disruption UX
Example:
**Your flight was cancelled**
"AI-123 from Mumbai to Delhi was cancelled."

Then:
**What could be affected?**
- Airport transfer
- Hotel check-in
- Trip schedule

Then:
**Money you could lose**
₹6,500

Then:
CTA:
**Find the best options**

## 8. Recovery Center
Title:
**Best options for you**

Subtitle:
"We found recovery plans that fit your trip."

Three options:

**FASTEST**
2:15 PM
+₹2,400
Hotel works

**SAVE MONEY**
5:30 PM
+₹1,100
Hotel works

**NEXT MORNING**
₹0
₹7,200 refund
Hotel needs changing

Compare:
- time
- extra cost
- refund
- hotel compatibility
- convenience

## 9. Deadline Guard
Use:
**DON'T MISS YOUR REFUND**
Hotel cancellation deadline
**10h 42m left**
Potential refund: **₹6,500**
CTA: **Review booking**

Severity:
- >24h Safe
- 6–24h Attention
- <6h Urgent
- expired Expired

Always show remaining time as text.

## 10. Group Travel
Title:
**Your group**

Show five members:
Tanvi — Recovery needed
Aisha — Continuing
Rahul — Continuing
Riya — Continuing
Karan — Continuing

Explain:
"4 travelers can continue as planned."
"Tanvi needs a separate recovery plan."

Core idea: one affected traveler does not have to stop the entire group.

## 11. Document Vault
Title:
**Travel Documents**

Cards:
- Flight Ticket
- Hotel Booking
- Travel Insurance
- Passport

Show secure/locked status, offline availability, and "Open document".

During disruption:
**Documents you may need**
Surface relevant flight ticket, hotel booking, insurance/policy document.

## 12. Offline Assistant
Title:
**TripSync Assistant**

Example:
User: "My flight was cancelled. What can I do?"
Assistant: "Your flight AI-123 was cancelled. I found 3 recovery options. The fastest option keeps your hotel booking unchanged."

Actions:
- Compare options
- Check refund
- Open documents

Indicator:
**Offline mode · Using saved trip information**

Do not claim real-time information while offline.

## 13. Landing Page — Separate Design Direction
The landing page should be visually distinct from the dashboard: a premium modern product-launch experience with an animated 3D feel.

Use:
- React
- TailwindCSS 3
- Framer Motion
- CSS transforms
- perspective
- layered cards
- subtle 3D depth
- animated travel routes
- floating booking cards
- animated connection lines
- smooth scroll-triggered reveals

Do not use WebGL/Three.js unless explicitly requested. Prefer CSS 3D + Framer Motion so the prototype remains lightweight.

### Hero
Headline:
**When travel changes, TripSync changes with you.**

Supporting:
"Recover your entire journey — not just the booking that went wrong."

CTA:
**Explore TripSync**
Secondary:
**See how it works**

### 3D Hero Composition
Create a central 3D-style smartphone showing the TripSync trip. Around it, float booking cards:
- Flight
- Transfer
- Hotel
- Activity
- Refund deadline

Initial state: bookings confirmed.

Then animate:
Flight → cancelled
→ connected cards react
→ deadline appears
→ recovery options slide in
→ one plan is selected
→ itinerary returns to recovered state.

Use Framer Motion for:
- entrance animations
- staggered reveals
- floating motion
- route-line animation
- state transitions
- hover interactions
- scroll-triggered section reveals

Keep animation restrained and premium. Respect `prefers-reduced-motion`.

## 14. Landing Page Sections
1. Hero
2. Problem: "Travel disruptions rarely affect just one booking."
3. How TripSync works:
   Understand trip → Detect change → Find options → Protect money → Rebuild itinerary
4. Differentiators:
   Connected recovery, deadline protection, group recovery, secure documents, offline support
5. Interactive recovery demonstration
6. Final CTA:
   **Recover the journey, not just the booking.**

## 15. Responsive Landing Page
Desktop:
- large 3D hero
- floating cards
- wide composition

Tablet:
- reduced depth and fewer floating elements

Mobile:
- stacked composition
- fewer floating cards
- simpler animation
- no horizontal overflow

## 16. Overall Story
The design should communicate:

Something went wrong.
→ TripSync understands the whole trip.
→ It protects the traveler from unnecessary loss.
→ It finds realistic recovery choices.
→ The traveler chooses.
→ The trip continues.

Core principle:
**Show intelligence through behavior, not jargon.**

## 17. Additional Directive (from project owner)
Add glass morphism effect and also framer motion effects to the UI, and after the design the screens must be well connected (every screen reachable, shared state flows through the whole product, and the landing → demo → app journey is one connected story).