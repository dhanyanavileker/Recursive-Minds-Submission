# Re:Source — competition build plan

## Objective and constraints
Help people reuse surplus materials through “snap to list” and “chat to find.” Competition theme: sustainability and social impact. Distinction: turn a person's project into requirements and explain which actual surplus listings fit.

Mandatory: Google-operated hosted services only; zero paid usage; no billing-account attachment or Blaze upgrade. Ordinary local/open-source development libraries are not hosted services. Public GitHub submission is a competition deliverable noted in the transcript, not an application dependency.

Target: an accessible public evaluation link with a complete three-minute submission video and a concise two-minute interactive walkthrough. October 18 is the transcript's submission deadline; confirm dashboard deadline/time zone and registration status immediately.

## Scope for version one
- Focus on non-structural renovation leftovers: tiles for decorative projects, timber offcuts, pavers, pots, and basic fittings.
- One pilot locality, with approximately 20–30 explicitly labelled demo listings.
- Preserve the broader vision of reused items/equipment, but defer equipment-specific matching and safety checks.
- Three core capabilities: photo-assisted listing, conversational discovery, evidence-based suitability explanation.
- Stretch feature only after the core works: combine two or three listings to meet one project requirement.
- Exclude payments, delivery booking, live seller messaging, maps, carbon accounting, autonomous construction instructions, and structural suitability certification.

## Core journeys
### Owner: snap to list
1. Take/upload a photo or choose a supplied sample.
2. Gemini proposes category, title, description, visible condition, and unknowns.
3. Ask only necessary questions: quantity, units, dimensions, material if known, condition, price/free, locality, pickup window.
4. Owner edits and confirms facts. AI guesses stay separate from confirmed facts.
5. Preview and publish a demo listing; user can edit/delete their own listing.

### Finder: chat to find
1. Enter a need, e.g. “I need leftover tiles for a small mosaic tabletop.”
2. Gemini extracts requirements and asks about dimensions, budget, and pickup locality.
3. Application filters real inventory by category, availability, quantity, locality, and price. Unknown suitability remains unknown.
4. Normal code calculates area, unit conversions, quantity coverage, and price where data is sufficient.
5. Gemini explains matches using supplied listing IDs and confirmed facts; output is validated against retrieved inventory.
6. User sees match reasons, missing details, and questions to ask the owner.
7. Save materials to a project and complete a clearly labelled simulated pickup request.

### Evaluation experience
- No registration form for browsing or sample walkthrough; use anonymous Firebase authentication where needed.
- Landing choices: “Find materials” and “List leftovers,” with “Try a sample” visible.
- Supply sample photographs and suggested requests; do not depend on judge-provided content.
- Label seeded listings, simulated pickups, and recorded AI examples explicitly.
- A resettable personal demo workspace prevents one judge changing another's sample inventory.
- When live AI is unavailable, preserve manual listing/search and offer a labelled prerecorded example. Never present it as live output.

## Google AI implementation
- Photo understanding: Gemini multimodal request -> validated listing-draft structure.
- Conversation: Gemini -> requirement structure and one concise clarification at a time.
- Grounded explanation: bounded inventory shortlist + deterministic calculations -> explanation with listing references and uncertainties.
- Reject invented IDs, unsupported quantities, and unsupported safety assertions; fall back to factual listing cards.
- Treat listing text as data, never instructions. Do not let generated output directly authorize writes or change ownership.
- Prefer bounded calls over an open-ended agent loop. No vector database or ADK needed for this inventory size.
- Select a currently available image-input/text-output Gemini model with free-tier support after a real project quota check. Do not hardcode a model based on transcript names.

## Proposed zero-cost architecture
- Static web application on Firebase Hosting (classic Hosting, not App Hosting).
- Firebase AI Logic web SDK with Gemini Developer API, on an unbilled Spark project. Gemini service credentials must not be embedded directly in application code.
- Cloud Firestore for confirmed listing metadata, demo workspaces, and saved project selections.
- Firebase Authentication: anonymous demo sessions; defer seller accounts unless necessary.
- Firebase App Check with an eligible no-cost web attestation setup; verify enforcement and quotas during setup.
- Static sample photos packaged with the hosted site.
- User photos: resize in-browser for AI input; discard original after processing. For this bounded prototype, consider one small compressed thumbnail per listing in a separate Firestore document, with strict encoded-size validation and no indexing of image data. Validate feasibility before implementation; if unsuitable, keep user images session-local and state that limitation explicitly. This is not a production image-storage design.
- Use chosen localities instead of paid geocoding or driving-distance APIs. Do not label locality matches as measured travel distances.

## Cost and availability gates
- Keep project unlinked from Cloud Billing; do not enable Cloud Run, Cloud Functions, Vertex AI, or Cloud Storage as part of this plan.
- Check actual model access and project rate limits in AI Studio before building the live flow. Quotas are project/model dependent, not an assumed fixed allowance.
- Set bounded image sizes, prompt lengths, response tokens, and conversation length; explicit submit actions only, no inference per keystroke.
- Configure available service-side rate limits and App Check. Client cooldowns improve UX but are not security or spending controls.
- Use paginated/bounded Firestore reads; avoid global real-time listeners. Enforce ownership, field allowlists, size limits, and demo/real data separation in security rules.
- Exhausted free quotas can interrupt the public demo; zero cost cannot guarantee uninterrupted AI access.
- Keep originals, private addresses, contact information, and sensitive images out of the demo. Explain processing before upload and verify current Gemini free-tier data-use terms before release.

## Minimum data model
- Listing: id, ownerId, demo flag, category, title, description, confirmed facts, AI suggestions, quantity/unit, dimensions, condition, price, locality, pickup window, availability, timestamps, optional thumbnail reference.
- Project request: ownerId, intent, dimensions, material preferences, quantity, budget, locality, unanswered questions.
- Match: listing IDs, computed coverage/price, supporting facts, unresolved requirements; derive on demand rather than trust model-generated totals.
- Demo pickup: ownerId, selected IDs, requested quantity, simulated status. Never count as actual collection.

## Build sequence (proposed October 14–18)
1. October 14 — verify dashboard requirements and Google account/free-tier access; prove one deployed Gemini photo call; prepare seed inventory and build the app shell.
2. October 15 — complete photo -> questions -> confirmation -> persisted listing; enforce data ownership and validation.
3. October 16 — complete chat -> requirements -> inventory filtering -> calculations -> grounded match cards. Add project shortlist and simulated pickup.
4. October 17 — integrate the two-minute judge walkthrough, mobile usability, failure states, and meaningful evaluations. Add multi-listing combinations only if core checks pass.
5. October 18 — feature freeze; verify public link in a signed-out browser, record demo, finalize documentation and public repository, submit ahead of the confirmed deadline.

## Acceptance checks and evidence
- Owner can finish a listing without typing its full description; measure completion time with several people and report actual results.
- At least 15 reference scenarios: straightforward matches, quantity shortage, unit conversion, ambiguous photo, unavailable inventory, no match, unsupported safety claim, and instruction-like listing text.
- Every displayed recommendation references an existing available listing; no invented stock or seller details.
- Quantity/area/price calculations pass deterministic tests, including missing and incompatible units.
- User-confirmed fields cannot silently change after AI generation.
- Security-rule checks reject cross-user edits and oversized/invalid writes.
- Quota exhaustion and network failure show useful manual paths and honest status.
- Judge can finish the guided scenario on mobile and desktop without a registration form.
- Measure listing time, match relevance, unsupported-claim rate, and AI response latency. Do not invent performance results or environmental benefits.

## Submission template

The supplied `Submission Template  AI Builder Cup.pdf` asks for a 3-minute demo video, a prototype performance/benchmarking report, process/use-case and architecture diagrams, prototype screenshots, and public repository/product links. See `SUBMISSION_CHECKLIST.md` for the full section mapping. The two-minute walkthrough above is our interaction design target, not the required video duration.

## Submission package
- Public Firebase Hosting evaluation URL.
- Short narrated demo showing both listing and finding, Google AI's role, and the practical reuse outcome.
- Public GitHub repository per transcript, with setup instructions, architecture, security rules, sample data labels, and evaluation results; exclude secrets.
- English presentation/PDF: problem, target user, AI contribution, working features, evidence, limits, and path to production.
- State that live scale, real pickups, durable photo storage, and environmental outcomes remain future validation work.

## Decisions needed before implementation
- Confirm competition registration, dashboard deadline/time zone, and permitted submission format.
- Choose pilot city/locality; use a labelled illustrative locality until then.
- Identify a Google/Firebase project without billing and verify available Gemini quota.

## Official references checked October 13, 2026
- Firebase AI Logic free-tier/billing: https://firebase.google.com/docs/ai-logic/pricing
- Firebase plans and product availability: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans
- Gemini model pricing: https://ai.google.dev/gemini-api/docs/pricing
- Actual project rate limits: https://ai.google.dev/gemini-api/docs/rate-limits
- Cloud Storage billing requirement: https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024
- Hosting quotas: https://firebase.google.com/docs/hosting/usage-quotas-pricing

Architecture is a proposed design, not confirmation that the user's account is provisioned or quotas are sufficient. Recheck relevant official limits and data terms during implementation.
