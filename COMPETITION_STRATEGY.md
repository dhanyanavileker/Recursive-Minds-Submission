# Re:Source — serious competition entry

Recorded: 13 October 2026. These are strategy recommendations from our discussion, not official judging requirements or a prediction of winning. Use RESOURCE_PLAN.md for implementation scope and HACKATHON_NOTES.md for competition context and mandatory constraints.

## Assessment

The current UX prototype is a promising starting point, but does not yet demonstrate the core AI value. Completing the planned AI journeys, reliable matching, user evaluation and a dependable public demo would make it a credible, potentially competitive submission. Winning remains uncertain and depends on execution, confirmed judging criteria and competing entries.

Focus on excellent core journeys rather than expanding the feature list. Visual polish helps, but the central proof must be useful, trustworthy AI and evidence that people benefit.

## Positioning

**We turn scattered leftovers into a practical material plan for your next project.**

Distinctive value: understand what someone wants to make, derive material requirements, then explain which available surplus listings meet those requirements using confirmed facts and explicit uncertainties.

The demo must prove this claim. Browsing leftovers alone does not establish it.

## Current state

- Local React, TypeScript and shadcn/ui UX prototype in `resource-app/`.
- Find-materials-first experience, filters, saved projects, manual listing and simulated pickup.
- Inventory is fictional and explicitly labelled; material previews are illustrations.
- Search uses local keywords. Live Gemini and Firebase are not connected.
- Build checks pass. Sample search, saving and simulated pickup were checked in-browser.
- Full desktop/mobile visual and accessibility verification remains pending.

## AI capabilities to implement

1. **Photo to listing draft:** Gemini proposes visible category, description, condition and unknowns. Owner reviews, edits and confirms facts. Suggestions must remain distinguishable from confirmed facts.
2. **Project idea to requirements:** Gemini turns a vague request into structured requirements and asks concise clarifications about dimensions, budget and pickup locality.
3. **Inventory to explained matches:** retrieve actual available listings, calculate quantities/area/prices in code, and have Gemini explain matches using those facts and listing IDs. Reject invented inventory and unsupported claims.

Prioritize one complete finding journey first: request → clarification → inventory filtering → calculations → grounded explanation → saved materials. Add photo-assisted listing next.

Verify actual free-tier Gemini access and quotas before connecting live AI. Preserve the Google-only, zero-paid-usage and no-billing constraints in RESOURCE_PLAN.md.

## Signature demonstration

Use a small mosaic tabletop as the main scenario:

1. The finder describes the project.
2. Re:Source clarifies tabletop dimensions, budget and locality.
3. It finds available tile listings.
4. Where listing dimensions and quantities are known, code calculates coverage and total price.
5. The interface explains the match, references its listings, and identifies missing information.
6. The finder saves materials and completes a clearly labelled simulated pickup.

The current sample tile listings have unconfirmed total area. Add an explicitly labelled reference scenario with sufficient confirmed dimensions for calculation; do not infer coverage from the existing sample quantities.

Show a difficult case too: insufficient quantity, unknown dimensions, unavailable materials or an unsuitable request. Useful clarification or an honest no-match result is part of the demonstration.

## Trust and usability

- Distinguish enough material, quantity short and dimensions unknown using evidence.
- Keep unknown suitability unknown. Do not certify structural use or provide autonomous construction instructions.
- Never present recorded examples as live AI.
- Preserve manual search and listing when AI or network access fails.
- Make the two-minute walkthrough usable on mobile without registration or judge-provided photos.
- No invented savings, environmental benefits, response times or user outcomes.

## Evidence to gather

Test both owner and finder journeys with a few potential users. Record actual findings:

- Task completion and completion time.
- Confusing steps and changes made in response.
- Whether recommended listings are useful for the stated project.
- Unsupported claims, incorrect matches and handling of uncertainty.
- AI latency and fallback behavior.

Use the reference scenarios and deterministic calculation checks in RESOURCE_PLAN.md. If feasible, demonstrate one actual reuse outcome with participants' consent. Clearly distinguish actual reuse from fictional inventory and simulated pickups.

## Optional differentiator

After single-listing matching works reliably, combine two or three surplus listings to fulfil one project requirement. Show verified totals, shortages, compatibility uncertainties and pickup trade-offs. This is a stretch feature, not a prerequisite to completing the core submission.

## Submission priorities

1. Prove the complete AI finding journey.
2. Complete photo-assisted listing with owner confirmation.
3. Verify calculations, inventory grounding and difficult cases.
4. Test with users and report measured evidence.
5. Provide a dependable public Google-hosted demo with manual fallback.
6. Record a short demo video showing both journeys, Google AI's contribution and observed results.
7. Finalize the public repository and clear documentation of architecture, setup, limitations and future work.

Confirm the official deadline, registration status and submission requirements in the participant dashboard. These priorities do not replace the full checklist in RESOURCE_PLAN.md.
