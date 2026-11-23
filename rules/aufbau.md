# Aufbau

## 1. Monorepo-Ordnerstruktur

Alle CNT-Apps und geteilten Pakete liegen gemeinsam in einem Repository (`pnpm` Workspaces):

```txt
C:\Users\Kunc GmbH\Documents\CNT\
├── apps\
│   ├── Connect\               # Connect-App
│   ├── Hyper\                 # Hyper-App
│   ├── Analysis\              # Analysis-App
│   ├── Spark\                 # Spark-App
│   └── Flux\                  # Flux-App
│
├── packages\
│   ├── ui\                    # Geteilte UI-Komponenten (Tailwind + shadcn Basis)
│   │   ├── src\components\shadcn\
│   │   │   ├── elements\      # Allgemeine UI-Komponenten (shadcn/ui)
│   │   │   ├── editable\      # Inline-Textbearbeitung (shadcn.io)
│   │   │   └── studio\        # Vorgefertigte Blöcke & Komponenten (ShadCN Studio)
│   │   └── package.json
│   ├── types\                 # (Geplant) Gemeinsame TypeScript-Typen & Daten-Schemas
│   └── config\                # (Geplant) Geteilte TypeScript-, Prettier- & Tailwind-Configs
│
├── rules\
│   ├── tech-stack.md          # Verbindlicher Tech Stack
│   ├── aufbau.md              # Monorepo-Struktur & Architektur-Prinzipien
│   ├── vermeiden.md           # Verbindliche No-Gos & Alternativen
│   ├── ui-components.md       # UI-Quellen, Speicherorte und Integration
│   └── code-formatting.md     # Prettier-Regeln
│
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
└── Claude.md
```

## 2. Komponenten-Architektur (Baustein-Prinzip)

- **Modular bauen:** Jede Website in Next.js & React wird in kleine, wiederverwendbare Bausteine zerlegt.
- **Komponenten klein halten & Logik von der UI trennen:** UI-Komponenten (`.tsx`) bleiben schlank und auf die Darstellung fokussiert; Geschäftslogik, Berechnungen und API-Abfragen werden sauber in eigene `.ts`-Dateien oder Custom Hooks ausgelagert.
- **React Server Components (RSC) als Standard:** In Next.js (App Router) ist jede Komponente standardmäßig eine Server Component (Datenabfragen per `async/await` auf dem Server, kein unnötiges Client-JavaScript). `"use client"` wird nur für möglichst kleine, tief liegende interaktive Inseln genutzt (z. B. `useState`, Events, `Editable`). **Boundaries beachten:** Eine Client Component darf keine Server Component direkt importieren – stattdessen die Server Component als `children` oder Prop übergeben.
- **Klare Trennung nach Wiederverwendbarkeit:**
  - `packages/ui/src/components/shadcn/` → wiederverwendbare Basis-Elemente (`elements/`, `editable/`) und Blöcke (`studio/`), die app-übergreifend genutzt werden.
  - `apps/<App>/src/components/ui/` → Komponenten, die nur in einer einzelnen App benötigt werden.
- **Single Source of Truth für Typen:** Geteilte Datenmodelle und Schemas gehören perspektivisch zentral nach `packages/types`, damit Web-, Landing- und Mobile-Apps dieselben Typen nutzen.

## 3. Layout- & Abstands-Architektur

- **Elternelement bestimmt den Abstand:** Abstände zwischen Elementen werden über Flexbox/Grid + `gap` am Elternelement gesteuert – nicht über Außenabstände an Kind-Komponenten.
- **`padding` statt `margin`:** Innenabstände (`padding`, ggf. mit Wrapper-Element) ersetzen `margin` in fast allen Fällen und vermeiden Margin-Collapse-Fehler.
- **Spacer-Elemente:** Wenn zwischen einzelnen Elementen gezielt ungleiche Abstände nötig sind, werden explizite Wrapper-/Spacer-Elemente genutzt statt Margin-Hacks.
- **Natives HTML zuerst:** Interaktive Standardmuster (z. B. aufklappbare Bereiche) werden primär mit nativem HTML (`<details>` / `<summary>`) umgesetzt, bevor JavaScript eingesetzt wird.

## 4. Einrichtungs-Reihenfolge (Ausbaustufen)

1. **Stufe 1 – Fundament:** `pnpm-workspace.yaml` befüllen, `packageManager` auf `pnpm` festnageln, zentrale TypeScript- & Prettier-Config anlegen.
2. **Stufe 2 – Shared Packages:** `packages/ui` sauber als Workspace-Paket anbinden und bei Bedarf `packages/types` & `packages/config` ergänzen.
3. **Stufe 3 – Web-Apps & Landing Pages:** Apps unter `apps/` (Next.js für Web-Apps, Astro + optional HTMX für Landing Pages) mit `packages/ui` verbinden.
4. **Stufe 4 – Mobile:** React Native (Expo) ergänzen, sobald die Mobile-Phase startet, und geteilte Typen aus `packages/types` mitnutzen.

## 5. GitHub-Repository-Aufteilung

- **Fundament-Repo (`stefankunc/company-os`, privat):** Enthält `Claude.md`, `rules/`, `packages/ui`, `packages/types`, Submodules (`elements/`, `studio/`) sowie die Root-Configs (`pnpm-workspace.yaml`, TypeScript, Prettier).
- **Einzelne App-Repos (jeweils privat):** `apps/` bleibt in `company-os/.gitignore` ausgeschlossen. Jede App unter `apps/` (`Connect`, `Hyper`, `Analysis`, `Spark`, `Flux`) bekommt ein **eigenes privates GitHub-Repository**, sobald dort aktiv entwickelt wird. Lokal arbeiten alle Apps trotzdem nahtlos über `pnpm-workspace.yaml` mit `@cnt/ui` und `@cnt/types` zusammen.
