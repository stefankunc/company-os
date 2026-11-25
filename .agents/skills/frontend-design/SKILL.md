---
name: frontend-design
description: Verhindert generischen KI-UI-Slop und erzwingt das CNT-Designsystem (Geist/Geist Mono, semantische shadcn/ui-Tailwind-Tokens, lucide-react, cn/cva, a11y, gap/padding). Nutzen beim Erstellen oder Überarbeiten von UI-Komponenten, Seiten und Layouts.
---

# Frontend Design & Anti-Slop Guardrails

Halte bei jeder neuen oder überarbeiteten UI-Komponente diese 6 Pflichtregeln strikt ein:

1. **Keine generische KI-Optik:**
   - Keine willkürlichen lila/neon-blauen AI-Gradients, keine überladenen Glow-Effekte, keine beliebigen Hex-Codes (`#1a2b3c`) im JSX.
   - Ausschließlich semantische Tailwind-/shadcn-Tokens (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border`, `ring`) nutzen.
2. **Typografie (`rules/fonts.md`):**
   - Immer **Geist** (UI/Fließtext) und **Geist Mono** (Code, Zahlen, Tabellen, IDs) — keine Standard-Inter/Roboto/Arial-Fallbacks.
   - Klare visuelle Hierarchie (Gewicht, Größe, Kontrast ≥ 4,5:1 nach WCAG AA) statt gleichförmiger Textwände.
3. **Komponenten & Icons (`rules/ui-components.md`):**
   - Zuerst lokal prüfen (`packages/ui`, App-UI) → `ui.shadcn.com` → `shadcn.io` → `shadcnstudio.com`.
   - Interaktive Primitives (`Dialog`, `Dropdown`, `Tabs`, `Popover`, `Tooltip`) immer über barrierefreie `shadcn/ui`-Primitives (Radix/Base UI/Ark UI), nie als Eigenbau-`<div>`.
   - Icons **ausschließlich** über `lucide-react` (keine exotischen Icon-Sets halluzinieren).
4. **Styling & Layout (`rules/aufbau.md`):**
   - Dynamische Klassen immer über `cn()` (`clsx` + `tailwind-merge`), Varianten typsicher mit `cva` — kein `@apply`-Missbrauch für `.card`/`.btn`.
   - Elternelement steuert Abstände via Flexbox/Grid + `gap`, innen via `padding` oder explizite Spacer — kein `margin` für Layout-Abstände.
5. **Semantik, a11y & Form-Signale:**
   - Echtes `<button>`, `<a>`, `<label>` (nie `<div onClick>`); `aria-label` auf Icon-Buttons; sichtbare `focus-visible`-Ringe.
   - Natives HTML vor JS (`<details>`/`<summary>`).
   - Checkboxen bleiben **quadratisch** (Mehrfachauswahl), Radio-Buttons **rund** (Einzelauswahl).
6. **Sauberes JSX & Wahrgenommene Geschwindigkeit:**
   - Keine verschachtelten Ternaries und kein `{count && ...}` in JSX (Guard Clauses + explizite Booleans `items.length > 0 ? ... : null`).
   - Für dynamische/langsame Bereiche klare `<Suspense>`-Skeletons vorsehen, sodass Klicks sofort reagieren.
