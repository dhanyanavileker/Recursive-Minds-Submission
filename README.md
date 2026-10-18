# Re:Source

**Turn leftover materials into a practical plan for the next project.**

Re:Source is an interactive marketplace prototype for people offering non-structural renovation leftovers and people looking for materials for small creative projects. It helps a finder describe what they want to make, turn that idea into clear requirements, and compare those requirements with available surplus materials using recorded facts and transparent calculations.

The project is being developed for the Google Cloud AI Builder Cup under the **Sustainability and Social Impact** theme.

## The problem

Useful tiles, timber offcuts, pavers, pots, and fittings are often discarded because listing them takes effort and finding the right quantity is difficult. Existing marketplaces make people search item by item, while project needs are usually expressed as an idea: “I want to make a small mosaic tabletop.”

Re:Source connects these two sides:

- Owners can turn leftover materials into a structured listing.
- Finders can describe a project and refine its material, size, budget, and locality requirements.
- Match cards explain why a listing may fit, show known coverage and cost, and clearly identify missing information.

## Current prototype

The repository currently contains a local React prototype with:

- A guided project brief for material type, dimensions, budget, and pickup locality.
- Twenty-four labelled fictional listings across illustrative Bengaluru localities.
- A multi-skill assistant for project plans, repair guidance, photo analysis and inventory discovery.
- Server-side Gemini integration with a deterministic offline fallback; responses do not expose the API key to the browser.
- Evidence-based match cards with listing references.
- Deterministic area, coverage, budget, and locality checks.
- Clear states for enough material, quantity short, and dimensions unknown.
- A saved-project view with known area, outstanding area, and total lot price.
- A guided flow for creating and managing demo listings.
- A simulated pickup flow and a resettable browser workspace.
- Responsive UI, keyboard navigation, and reduced-motion support.

All seeded inventory and material illustrations are fictional. Bengaluru is an illustrative pilot locality.

## Demo walkthrough

1. Open **Find materials** and select **Try the mosaic tabletop example**.
2. Enter or edit the tabletop dimensions, budget, and pickup locality.
3. Review matching tile lots and their supporting evidence.
4. Save one or more lots to **My project** and inspect the combined totals.
5. Try the simulated pickup step.
6. Open **List leftovers** to create a browser-local demo listing.

## Run locally

Requirements: a current Node.js release and npm.

```bash
git clone https://github.com/abhishekm0892/AIBuilderCup2026.git
cd AIBuilderCup2026/resource-app
npm install
npm run dev
```

Vite will print the local URL after the development server starts.

## Checks

From `resource-app/`:

```bash
npm run build
npm run lint
node --experimental-strip-types --test tests/matching.test.ts
```

The matching tests cover unit conversion, adequate and insufficient area, missing dimensions, budget limits, locality constraints, and material mismatches.

## Technology

- React 19 and TypeScript
- Vite
- Tailwind CSS and shadcn/ui primitives
- Local browser storage for prototype state
- Node's built-in test runner for deterministic matching checks

## Google architecture

The prototype uses a server-side Gemini endpoint and is designed to stay within a zero-paid-usage constraint:

- Firebase Hosting for the static application.
- Firebase Authentication for anonymous demo sessions.
- Cloud Firestore for confirmed listings and saved projects.
- Gemini Developer API for photo analysis, project planning and repair guidance, with local deterministic fallbacks.
- Firebase App Check and strict validation around user-provided data.

AI output will remain separate from owner-confirmed facts. Inventory filtering and quantity, area, and price calculations will continue to run as deterministic application code. Generated explanations must reference real listing IDs and preserve uncertainty.

Gemini availability depends on the configured project's active free-tier quota. Firebase persistence and production App Check remain future work.

## Prototype boundaries

- Gemini calls are routed through the Node server; when Gemini is unavailable the UI falls back to a clearly labelled local demo path.
- No real owner contact, reservations, payments, delivery, or pickup booking.
- No structural-use certification or autonomous construction advice.
- Calculated area assumes the recorded piece dimensions are uniform and excludes cuts and waste.
- User-created listings, saves, and project details remain in the current browser.
- Uploaded images are not analyzed or uploaded by the current prototype.
- Environmental impact and performance results have not yet been measured.

## Repository structure

```text
.
├── resource-app/              # React prototype and matching tests
├── PRODUCT.md                 # Product definition and constraints
├── RESOURCE_PLAN.md           # Build scope, architecture, and acceptance checks
├── COMPETITION_STRATEGY.md    # Competition positioning and priorities
├── SUBMISSION_CHECKLIST.md    # Submission-template mapping and open gaps
├── DESIGN.md                  # Interface design direction
├── UI_UX_NOTES.md             # UX decisions and review notes
└── BRAND_GUIDELINES.md        # Brand system
```

## Status

The local UX, server-side Gemini path, deterministic fallback, and evidence-based matching prototype are implemented. Public deployment, final link verification and real user testing remain submission tasks.

## License

No open-source license has been added yet. All rights are reserved by the project owner.
