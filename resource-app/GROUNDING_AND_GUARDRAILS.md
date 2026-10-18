# Re:Source grounding, data sources and guardrails

This document describes the evidence judges can verify in the repository. It separates working controls from planned production extensions.

## Implemented data flow

```text
User request
   |
   +--> Skill routing and structured requirements
   |       `resource-app/src/agent/skillEngine.ts`
   |
   +--> Bounded inventory retrieval
   |       24 labelled fictional listings in `resource-app/src/App.tsx`
   |
   +--> Deterministic evidence checks
   |       category, area, quantity, budget and locality
   |       `resource-app/src/matching.ts`
   |
   +--> Existing listing cards and explicit unknowns

Photo, repair or build-plan request
   |
   +--> Cloud Run Node API
   |       `resource-app/server.js`
   |
   +--> Official `@google/genai` SDK
   |       server-side `GEMINI_API_KEY`
   |
   +--> Schema-shaped JSON parsed by the application
           deterministic local fallback on failure
```

## Sources of truth

- **Marketplace inventory:** the structured `Listing` objects loaded by the application. The seeded set contains 24 fictional evaluation listings across three illustrative localities. It is deliberately bounded and labelled in the UI.
- **User-created listings:** facts entered and confirmed by the current user. They remain in browser storage in this prototype.
- **Project constraints:** category, dimensions, budget and locality entered through the guided requirements flow.
- **Gemini output:** suggestions for photo assessment, repair steps and reuse build plans. It is guidance, not marketplace inventory or proof of availability.

The application does not use Google Search grounding because marketplace availability must come from Re:Source records rather than arbitrary public web pages. Adding web results would not prove that an item is available through the platform.

## Implemented grounding controls

1. Inventory search operates only on listing objects already present in application state.
2. No-match searches return no results; they do not substitute unrelated inventory.
3. The Finder displays only the retrieved listings and reports the same visible result count.
4. Category compatibility is checked before area coverage can be credited.
5. Area is calculated in application code from confirmed dimensions and quantity.
6. Missing dimensions produce `Needs confirmation`; they never become an asserted coverage value.
7. Budget and locality constraints are evaluated by application code.
8. Gemini credentials stay on the Cloud Run server and are excluded from the repository and client bundle.
9. Gemini failures return control to a deterministic local path instead of blocking the core marketplace journey.
10. Fictional inventory, illustrative impact, demo rewards and simulated logistics are labelled in the interface.

## Safety and trust guardrails

- Re:Source does not certify structural suitability.
- AI suggestions remain distinguishable from recorded listing facts.
- Unknown material properties remain unknown until a user confirms them.
- No AI response can create a payment, contact a supplier, reserve a lot or book delivery.
- The sourcing and logistics experiences are inactive simulations.
- The prototype does not claim measured environmental outcomes.
- Original uploaded photos are not persisted by the application.
- Google sign-in is handled by Firebase Authentication; the application never receives the user's Google password.

## Verifiable evidence

Run these checks from `resource-app/`:

```bash
npm run build
npm run lint
node --experimental-strip-types --test tests/matching.test.ts
```

The deterministic test suite covers:

- centimetre-to-square-metre conversion;
- enough-area and quantity-short cases;
- missing and invalid dimensions;
- a zero budget;
- locality constraints; and
- rejection of incompatible categories.

On 18 October 2026, the configured server-side `gemini-3.5-flash-lite` model returned a successful minimal response, and the complete `/api/gemini/build_plan` endpoint returned parseable structured JSON. Deployment availability and quota should be checked again using the submitted Cloud Run endpoint immediately before recording.

## Sample-data disclosure

The seeded listings, Bengaluru localities, Karma, impact values, delivery details, supplier dialogue and handover identifiers are demonstration data. They exist to make the full workflow repeatable for judges. They are not evidence of real transfers, partnerships, emissions savings or rewards.

## Known production extensions

- Cloud Firestore persistence and ownership rules for listings, projects and conversations;
- Firebase App Check and server-side request throttling;
- verified impact methodology and audited measurements;
- real partner onboarding, consent and logistics integrations; and
- evaluation with real users and resources.

These extensions must be presented as future work unless they are implemented and verified in the submitted build.
