# Re:Source design system

## Direction
Operate mode: finding useful surplus materials comes first. The opening viewport combines project intent with browsable inventory. Material illustrations carry visual specificity; actions and uncertainty remain legible.

## Tokens
- Background: #080D12; raised surface: #111E27; borders: #293640.
- Primary text: #EDF3F5; secondary: #A6AFB9; action: #25D9F0 with #06292D text.
- Space Grotesk headings; Inter body. Google Fonts, with sans-serif fallback.
- 5% page gutters; 1600px max width; 23px desktop grid gap; 8–13px surface radii.
- Four-column inventory on desktop, three on intermediate widths, two on mobile.
- Visible keyboard focus, semantic buttons and labels, reduced-motion support, dialog focus management via shadcn/Radix.

## Flows
Find → filter → inspect → save → My project → simulated pickup.
List → illustrated sample or local image → confirm → publish locally → My listings → delete.

## Honest states
20 fictional seed listings. Illustrations are not photographs. Keyword search is not AI. Coverage and structural suitability are never asserted. No owner is contacted. No hosted service is configured.

## Verification
TypeScript and production bundling pass. Browser inspection could not attach to the in-app preview during initial QA; desktop/mobile visual verification remains outstanding.
