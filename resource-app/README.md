# Re:Source application

React and TypeScript frontend with an Express server, packaged together for Google Cloud Run.

## Run the complete application

```sh
npm install
npm run build
npm start
```

The Node server serves `dist/` and the `/api` endpoints. For frontend-only development, `npm run dev` proxies `/api` to a server running on port 8080.

## Environment setup

Copy `.env.example` to `.env.local` for local development. Firebase web configuration uses `VITE_FIREBASE_*` values because that configuration is designed to be public. Gemini uses the server-only variables below:

```text
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-3.5-flash-lite
```

Never prefix the Gemini credential with `VITE_`; Vite exposes such variables to browser code. In Cloud Run, inject `GEMINI_API_KEY` as a runtime environment variable or secret reference.

## Implemented journeys

1. Sign in with Google through Firebase Authentication or use the browser-local demo guest.
2. Search and filter the labelled sample inventory.
3. Ask the Copilot to discover resources or create a reuse plan.
4. Use the guided requirements flow and review grounded matches.
5. Save resources to a project; signed-in users sync their state to Firestore.
6. Create and manage a giveaway listing with local fallback persistence.
7. Preview the clearly labelled rewards and delivery simulations.

Gemini powers photo assessment, repair guidance and build-plan generation through the server API. Marketplace retrieval and category, area, quantity, budget and locality checks run as deterministic application code.

## Data and boundaries

- The 24 seeded listings and their localities are fictional evaluation data.
- Signed-in users sync listings, saved resources, project requirements, demo Karma and delivery-preview state to their private Firestore path. Guest sessions and chat history remain browser-local.
- Google sign-in supplies the account name, email and profile photo shown in the app header; the profile record is stored under the signed-in user's Firestore document.
- No owner contact, payment, reservation or delivery is created.
- Rewards, logistics and impact values are illustrative.
- The application does not certify material safety or structural suitability.

See `GROUNDING_AND_GUARDRAILS.md` and `AGENT_ARCHITECTURE.md` for evidence and authority boundaries.

## Firestore rules

Deploy `firestore.rules` before relying on cloud sync. The rules restrict each user to `/users/{theirUid}` and its subcollections:

```sh
firebase deploy --only firestore:rules
```

If Firestore is unavailable or the rules have not been deployed, the interface continues using browser-local data and logs a warning.

## Verification

```sh
npm run build
npm run lint
node --experimental-strip-types --test tests/matching.test.ts
```

The matching tests cover unit conversion, enough/short coverage, missing dimensions, budget, locality and incompatible categories.
