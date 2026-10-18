# Re:Source agentic architecture

Re:Source uses a bounded multi-capability Copilot rather than an unrestricted autonomous loop. This keeps marketplace actions explainable and prevents generated text from changing inventory or creating real-world transactions.

## Capability map

| Capability | Responsibility | Implementation | Authority boundary |
|---|---|---|---|
| Need Understanding | Interpret a request and route it to discovery, photo analysis, repair guidance, build planning or the sourcing preview | `resource-app/src/agent/skillEngine.ts` | Cannot modify inventory or confirm facts |
| Resource Discovery | Search the current Re:Source inventory using material, category and locality terms | `searchMarketplace` in `skillEngine.ts` | Can return only listings already in application state |
| Matching | Evaluate category, dimensions, coverage, budget and locality | `resource-app/src/matching.ts` and `RequirementsPanel.tsx` | Deterministic calculations; missing values remain unknown |
| Reuse Planning | Generate photo guidance, repair steps and build plans with Gemini | `resource-app/server.js` through `@google/genai` | Suggestions only; no certification or inventory mutation |
| Logistics Preview | Demonstrate a possible handover flow after a match | `DeliveryTracker.tsx` | Simulation only; no driver, booking, route or active PIN |
| Impact Preview | Illustrate the future measurement and participation loop | dashboard and `RewardsModal.tsx` | No verified impact or real reward issuance |

## Orchestration

1. The skill router classifies the user's intent.
2. Discovery receives the current bounded inventory from application state.
3. Matching code evaluates recorded constraints.
4. Gemini is called only for the photo, repair and build-plan skills that benefit from generative reasoning.
5. Structured responses are rendered as guidance alongside deterministic marketplace facts.
6. A failed Gemini request returns to the local path without inventing marketplace results.

The implementation uses the official Google Gen AI SDK. It does not currently deploy an agent to Vertex AI Agent Engine, use ADK, or use Memory Bank; those products must not be listed as implemented services in the submission.

## Why this design is feasible

- The source of truth is small and structured, so deterministic retrieval is more reliable than open web search.
- Bounded capability routing limits prompt injection and unintended actions.
- Server-side Gemini calls protect the credential and provide one enforcement point.
- The core discovery journey remains available if model quota is exhausted.
- The same capability interfaces can later move behind managed agent infrastructure without changing the product journey.
