# UI/UX decisions

Updated: 13 October 2026

## Selected foundation: shadcn/ui

The user chose **shadcn/ui** as the UI foundation for the planned app.

- Free and open source under the MIT license.
- Provides customizable web UI components, including forms, dialogs, navigation, and tables.
- Component source code lives in the project and can be adapted to the app's needs.
- Provides accessible building blocks; the finished app still needs accessibility and responsive-layout checks.
- Official documentation: https://ui.shadcn.com/docs
- Source and license: https://github.com/shadcn-ui/ui

## Design guidance: Impeccable

The open-source **Impeccable** skill is installed in the user's personal Codex skills folder and available for future design work.

Use it for layout, typography, spacing, color, UX reviews, accessibility, onboarding, forms, error states, and visual polish. Use shadcn/ui for implementation components.

- Source: https://github.com/pbakaus/impeccable
- License: Apache 2.0.

## Project constraints and references

- Prefer free, open-source design tools; no paid design subscription is required for this foundation.
- Follow `BRAND_GUIDELINES.md` for Recursive Mind branding.
- Follow `HACKATHON_NOTES.md` for Google-only service and zero-paid-usage constraints. shadcn/ui is a local UI code dependency, not a hosted service.

## Setup status and open decisions

- shadcn/ui is installed and initialized in `resource-app/`.
- A React + TypeScript + Vite UX prototype has been created in `resource-app/`, based on RESOURCE_PLAN.md.
- Re:Source is a web prototype for finding and listing surplus materials; finding materials is the confirmed first screen.
- shadcn/ui is intended for a web interface. If native Android/iOS becomes a requirement, revisit the component choice.
- React with TypeScript and Vite is a proposed web-app setup, not a finalized stack decision.
