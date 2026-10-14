# Re:Source design system

## Direction
Operate mode: a single conversation contains the complete finding journey. Structured confirmation cards and the three strongest inventory matches appear inside the thread; the homepage has no separate marketplace grid. Material illustrations carry visual specificity; actions and uncertainty remain legible. Saved projects and the user's own listings remain focused secondary views.

The same app shell scales across devices: a centered 760 px conversation workspace on desktop and an edge-to-edge, full-height messaging surface on mobile. Mobile uses a compact sticky app bar, bottom navigation, a scrollable conversation, and a composer anchored above navigation. The marketing split layout is intentionally absent.

## Tokens
- Background: #080D12; raised surface: #111E27; borders: #293640.
- Primary text: #EDF3F5; secondary: #A6AFB9; action: #25D9F0 with #06292D text.
- Space Grotesk headings; Inter body. Google Fonts, with sans-serif fallback.
- 5% page gutters; 1600px max width; 23px desktop grid gap; 8–13px surface radii.
- Four-column inventory on desktop, three on intermediate widths, two on mobile.
- Visible keyboard focus, semantic buttons and labels, reduced-motion support, dialog focus management via shadcn/Radix.

## Flows
Chat → describe a project → confirm requirements inline → inspect evidence → save → My project → simulated pickup.
Chat/photo action → illustrated sample or local image → confirm facts → publish locally → My listings → delete.

## Honest states
20 fictional seed listings. Illustrations are not photographs. Keyword search is not AI. Area coverage is calculated only from recorded uniform piece dimensions and a confirmed project size. It does not establish compatibility, cutting allowance or structural suitability. No owner is contacted. No hosted service is configured.

## Verification
TypeScript and production bundling pass. Browser preview opened successfully. Sample search returns evidence-backed tile listings; saving updates the project count; the saved-material plan calculates known and remaining area; and the pickup dialog explicitly confirms simulation. The sample-assisted listing form clearly separates suggestions from owner-confirmed facts. Desktop and 390 px mobile layouts were visually inspected on October 14, 2026 with no blocking layout defects.

## AI-ready flows
Request → editable guided requirements → factual match evidence → save → full-lot material plan.
Photo or sample → immutable suggestion summary → owner-editable facts and optional dimensions/pickup → explicit confirmation → local publication.
Requirement and saved-plan panels use the existing surface, type and color tokens. Status colors: enough area #9BECCE on #193B31; shortage #F1D49B on #3B3020. Unknown uses neutral text plus an explicit label.
Live AI remains unconnected; the manual brief and local calculations remain available.
