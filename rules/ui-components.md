# UI-Komponenten & Quellen

## Quellen (Reihenfolge 1 → 2 → 3)

1. **shadcn/ui** (`https://ui.shadcn.com/`) → Standard-Primitives (`Button`, `Input`, `Dialog`, `Table`, `Form`) → `packages/ui/src/components/shadcn/elements/` · CLI: `npx shadcn@latest add <component>`
2. **shadcn.io** (`https://www.shadcn.io/`) → Spezial-Elemente (z. B. `Editable`) → `packages/ui/src/components/shadcn/<component>/` · CLI: `npx shadcn@latest add "https://www.shadcn.io/r/<component>.json"`
3. **ShadCN Studio** (`https://shadcnstudio.com/`, Repo `shadcnstudio/shadcn-studio`) → Blöcke, Dashboards, Templates → `packages/ui/src/components/shadcn/studio/` · Nur benötigten Block übernehmen.

## Speicherorte & Imports

- **Nur 1 App:** `apps/<App>/src/components/ui/<component>/` → `import { X } from "@/components/ui/<component>"`
- **Mehrere Apps / Shared:** `packages/ui/src/components/shadcn/<component>/` → `import { X } from "@cnt/ui/<component>"` _(Package-Name aus `packages/ui/package.json` prüfen)_
- **Editable:** `packages/ui/src/components/shadcn/editable/editable.tsx`

## Ablauf

1. Zuerst lokal prüfen (`packages/ui` & Ziel-App).
2. Quelle im Browser prüfen (1 → 2 → 3), bevorzugt per CLI installieren; nur benötigten Code übernehmen (nie ganze Demo-Seiten/Repos).
3. Eigener Unterordner + `kebab-case`-Dateien, fehlende Ordner automatisch anlegen.
4. Dependencies (`lucide-react`, `@ark-ui/react`, Radix/Base UI) mit `pnpm` installieren, Kompatibilität prüfen, vorhandene Basis-Komponenten wiederverwenden.
5. Imports, Theme & Styles ans CNT-Projekt anpassen; Lizenz-/Copyright-Hinweise erhalten (Bezahlinhalte nur mit Lizenz).
6. Prettier laufen lassen, Build & Dev-Server testen, Fehler autonom beheben.

## Barrierefreiheit (a11y)

- **Barrierefreie Primitives:** Interaktive UI-Muster (`Dialog`, `Dropdown`, `Tabs`, `Popover`, `Tooltip`) immer über `shadcn/ui`-Primitives (Radix / Ark UI) statt Eigenbau-`<div>`-Lösungen umsetzen.
- **Semantik, Tastatur & Fokus:** Echtes `<button>`/`<a>` statt `<div onClick>`, verknüpfte `<label>` für Inputs, `aria-label` für Icon-Buttons, sichtbare Fokus-States (`focus-visible`) und WCAG-Kontrast ≥ 4,5:1 (`rules/fonts.md`).

## Styling & Varianten

- **`cn()` & Varianten (`cva`):** Dynamische oder überschreibbare Tailwind-Klassen immer über `cn()` (`clsx` + `tailwind-merge`) mergen – nie per Template-String oder nacktem `clsx` (verhindert CSS-Spezifitäts-Bugs). Komponenten-Varianten typsicher mit `cva` definieren; wenn Ad-hoc-Overrides verboten sein sollen, `className`-Prop weglassen.

## UX-Konventionen

- **Bekannte Form-Signale wahren:** Checkboxen bleiben **quadratisch** (Mehrfachauswahl, nie `rounded-full`), Radio-Buttons bleiben **rund** (Einzelauswahl). Visuelle Effekte oder Styling dürfen nie funktionale Standard-Konventionen brechen.
