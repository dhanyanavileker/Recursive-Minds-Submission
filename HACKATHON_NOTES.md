# Google Cloud AI Builder Cup — quick reference

User is participating in this hackathon. Use these notes as project context for planning, building, and preparing the submission.

## Our project: Re:Source
- AI-assisted reuse of items, equipment, and leftover building materials, using a snap-and-chat interface to reduce listing and discovery effort.
- Selected theme: sustainability and social impact.
- Proposed competition scope: non-structural leftover materials; photo-assisted listing, conversational project requirements, and explained matches against actual inventory.
- Detailed build plan, evaluation journey, Google-only architecture, and milestones: `RESOURCE_PLAN.md`.

## User constraints — mandatory
- Use only Google services for the solution. This is the user's requirement, stricter than the session's allowance for other providers.
- Stay within free-tier limits: the organizers are not covering service costs, per the user. Plan for zero paid service usage; do not assume sponsored credits or a paid budget.
- Before choosing or enabling a service/model, verify its current free-tier availability, quotas, billing requirements, and overage behavior. A Google service is not automatically free.
- Design prototype and demo usage to fit those limits, with usage caps or other controls to prevent paid overages. Budget alerts alone do not cap spending.
- If a required capability cannot be delivered within these constraints, flag it and seek the user's decision before introducing a paid service or another provider.

Source: `Youtube video Transcript.docx` (introductory session). These are transcript-derived notes, not independently verified official rules. Dates are recorded as spoken; confirm current deadlines and exact requirements in the participant dashboard.

## Dates and participation
- October 11: registration/team finalization deadline mentioned.
- October 18: working prototype submission deadline.
- November 7: shortlisted teams announced.
- December 4: in-person finale in Singapore.
- Top 50 teams: sponsored travel and stay; only two members per team travel. Teams arrange their own visas.
- Working professionals, entrepreneurs, and startups are eligible; students excluded from this edition.
- Registrations approved in batches; monitor registered email/dashboard.
- Team size is inconsistent in the transcript: initially “up to two,” later “two to four” for building, with two attending the finale. Verify official rule.
- Participants retain project IP. Prize pool stated as up to US$30,000.

## Choose one theme
1. BFSI: banking, financial services, insurance.
2. Retail and commerce.
3. Manufacturing.
4. Media, content, and digital experiences.
5. Future of work and enterprise productivity.
6. Sustainability and social impact.

Define a specific problem within the chosen theme; the themes themselves are broad. Favor a problem informed by real experience with clear user value.

## Build requirements
- Deliver a functional, usable prototype demonstrating the capabilities claimed in the documentation.
- Meaningfully use Google AI/Cloud technologies; Gemini and Gemma are mentioned. Additional APIs/frameworks are allowed.
- Deploy the final solution on Google Cloud; Cloud Run and Firebase are suggested options.
- AI should do substantial work beyond a simple prompt-and-response wrapper.
- Address practical usability, reliability, scalability, and production feasibility.

## Submission checklist
- Documentation/presentation: problem, chosen theme, solution, impact, what was implemented, and future scalability/production feasibility. Include usage instructions where helpful; check accepted formats in the dashboard.
- Working deployed prototype accessible for evaluation.
- Publicly accessible demo video showing the product in use; YouTube, Vimeo, or a publicly shared Drive video are mentioned.
- Public GitHub repository showing the implementation and work done during the hackathon.
- Text, documentation, and presentations in English.

## Judging and awards
- Technical merit: 40%; meaningful AI use and sound implementation.
- Theme/problem alignment: assessed; percentage not stated in the transcript.
- Innovation and creativity: assessed; percentage not stated in the transcript.
- User experience and solution design: 10%; ease of getting value, beyond appearance.
- Additional award categories mentioned: best Google Cloud AI use, most impactful solution, jury choice, and best UI/UX, alongside top-three prizes.

## Technical guidance from the session
- Start with the problem and a simple proof of concept; add infrastructure when justified.
- Basic architecture: application/runtime + AI access + appropriate data storage.
- Gemini SDK or ADK are suggested; an agent architecture is a choice based on the use case, not a universal requirement.
- Cloud Run suggested for deployment; Firestore or Cloud SQL for storage, BigQuery for analytical workloads. Local SQLite can support early prototyping.
- Use RAG when the data/use case warrants it; a small document can go directly in model context. DIY and managed retrieval approaches are both acceptable.
- Evaluate output quality and accuracy with explicit checks; follow model prompting guidance.
- Model names in the transcript appear unreliable. Verify actual model availability before selecting one.

## Project details still to establish
- Team and registration status, pilot locality, existing implementation, and available Google free-tier quotas. Paid budget: zero, per user constraint.
