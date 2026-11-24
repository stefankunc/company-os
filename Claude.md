# CNT Monorepo (`Claude.md`)

`pnpm`-Monorepo (`C:\Users\Kunc GmbH\Documents\CNT`). Apps: `Company-OS` (Astro-Portfolio), `Connect`, `Hyper`, `Analysis` (Video-Studio), `Spark`, `Flux`.

## Regel-Dateien (bedarfsgerecht lesen)

- `rules/tech-stack.md` – Frameworks, DB, SDKs, Tooling
- `rules/aufbau.md` – Struktur, RSC/PPR, DAL/Security, Repo-Aufteilung
- `rules/vermeiden.md` – Verbindliche No-Gos
- `rules/ui-components.md` – UI-Quellen, CLI/Browser, Speicherorte
- `rules/fonts.md` – Geist & Geist Mono
- `rules/video-production.md` – Headless-Videos in `apps/Analysis`
- `rules/code-formatting.md` – Prettier
- `rules/model-selection.md` – Live-Modell-Recherche, Vergleich & Empfehlung pro Task/Projekt

## Kernregeln (immer aktiv)

1. **Stack:** Next.js (App Router, RSC-First, `"use client"` nur für kleine Inseln), React, Astro (+ opt. HTMX), Expo, strict TypeScript (kein `any`), Zod, Tailwind CSS, Drizzle ORM, immer `pnpm`.
2. **Code & Layout:** Komponenten klein halten, Logik in `.ts`/Hooks trennen. Abstände via `gap`/`padding`/Spacer (kein `margin`). Natives HTML (`<details>`/`<summary>`) vor JS.
3. **UI:** Lokal prüfen → `ui.shadcn.com` → `shadcn.io` → `shadcnstudio.com` → bevorzugt CLI, Ablage laut `rules/ui-components.md`. Offline-Backup `Editable`: `C:\Users\Kunc GmbH\Documents\Tools Connect\ShadCN\components_ui`.
4. **Videos:** Über `apps/Analysis` (Remotion/HyperFrames + `Vorlagen/`) – **strikt headless**, nie `localhost`/Studio öffnen, fertige Datei aus `outputs/` liefern.
5. **Qualität & Kürze:** `pnpm format:check` + `pnpm typecheck` vor Commit. PRs, Commits & Beschreibungen radikal kurz (1–3 Zeilen, null Füllwörter).

## Git & Graphite (`stefankunc/company-os`)

- Nie direkt auf `main`. Jede Änderung via Graphite PR: `gt create <branch> -a -m "<msg>" --no-interactive` → `gt submit --stack --no-interactive --publish` (Feedback: `gt modify` + `gt ss`; nach Merge: `gt sync --no-interactive`). Fallback ohne `gt`: `git push` + `gh api`.
- **Windows-PATH für `gt`:** `C:\Program Files\Git\mingw64\libexec\git-core` vor `.bun\bin` setzen.
- **Merges auf `main`:** Nur nach Nutzer-Freigabe.
- **Datenschutz & Submodules:** `apps/` bleibt in `.gitignore` (jede App eigenes privates Repo). `elements/` & `studio/` sind Submodules (`git clone --recursive https://github.com/stefankunc/company-os.git`).
