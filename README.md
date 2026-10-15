# Re:Source UX prototype

Local React + TypeScript + shadcn/ui prototype based on ../RESOURCE_PLAN.md.

## Run

```sh
npm install
npm run dev
```

`npm run build` checks TypeScript and produces static files in `dist/`.

## Environment setup

Copy `.env.example` to `.env.local` and add the Firebase web-app configuration from Firebase Console. Do not put a Gemini API key in this client-side application; the planned integration uses Firebase AI Logic with App Check. Keep `VITE_ENABLE_LIVE_AI=false` until the live integration and quota failure states are implemented.

## Walkthrough

1. Try the mosaic tabletop example, filter by locality, open a material, and save it.
2. Open My project and try a clearly labelled simulated pickup.
3. List leftovers, use the illustrated sample or a local image, confirm fields, and publish a demo listing.
4. Delete your listing or reset the demo to restore the 20 original fictional listings.

## Boundaries

No live Gemini, Firebase, owner contact, payments, or reservations. Search uses explicit local keyword matching. No suitability or coverage calculations are claimed. Seed inventory and material illustrations are fictional. Bengaluru is an illustrative pilot locality. Listings and saves persist in this browser; user images stay in the tab and are not uploaded or retained in published listings. Google Fonts is used for the brand typography. No paid services are enabled. Future deployment must follow the Google-only, no-billing constraints in RESOURCE_PLAN.md.

## AI-ready UX update

Project requests open an editable three-step brief: size/material, budget, locality. This is a guided local demo, not generated AI. Match cards calculate area from recorded uniform piece dimensions, show sufficient/short/unknown coverage, and cite listing IDs. Three fictional tile reference lots have measured dimensions; the fourth remains unknown. Existing demo inventory uses a new storage version (`resource-items-v2`); earlier local listings are retained under the old key but are not shown in this version.

Saved projects show full-lot quantities, total lot price, known matching area and outstanding area. Calculated area excludes cutting waste and does not certify finish, compatibility or structural use. Listing review separates sample suggestions from fields awaiting owner confirmation; user photos still receive no live analysis. The availability control reports the known unconnected state, without making an AI call.

Run arithmetic and constraint checks with `node --experimental-strip-types --test tests/matching.test.ts`.

## Verification status

Verified October 14, 2026: production build passes, all six matching tests pass, and the core project, simulated pickup, and sample-assisted listing journeys work in the browser. Desktop and 390 px mobile layouts were visually checked. The linter reports only two non-blocking Fast Refresh warnings in generated-style UI component files.
