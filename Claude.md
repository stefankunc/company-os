# CNT – Projektregeln (`Claude.md`)

Das CNT-Projekt ist ein `pnpm`-Monorepo mit den Apps:

- `apps/Connect`
- `apps/Hyper`
- `apps/Analysis`
- `apps/Spark`
- `apps/Flux`

## Verbindliche Regel-Dateien

Lies vor jeder Implementierung, Architektur-Entscheidung oder UI-Änderung die passende Regel-Datei in `C:\Users\Kunc GmbH\Documents\CNT\rules\` und befolge sie automatisch:

- **Tech Stack:** `C:\Users\Kunc GmbH\Documents\CNT\rules\tech-stack.md`
- **Aufbau & Struktur:** `C:\Users\Kunc GmbH\Documents\CNT\rules\aufbau.md`
- **Vermeiden (No-Gos):** `C:\Users\Kunc GmbH\Documents\CNT\rules\vermeiden.md`
- **UI-Komponenten & Quellen:** `C:\Users\Kunc GmbH\Documents\CNT\rules\ui-components.md`
- **Videoproduktion (Headless):** `C:\Users\Kunc GmbH\Documents\CNT\rules\video-production.md`
- **Code-Formatierung (Prettier):** `C:\Users\Kunc GmbH\Documents\CNT\rules\code-formatting.md`

## Kurz-Checkliste für jede Aufgabe

1. **Stack & Struktur:** Next.js (App Router, React Server Components als Standard – `"use client"` nur für kleine interaktive Inseln) + React (Web-Apps), Astro (+ optional HTMX) für Landing Pages, React Native/Expo (Mobile), striktes TypeScript (keine `any`-Typen), Tailwind CSS, immer `pnpm` statt `npm`. Komponenten klein halten und Geschäftslogik sauber von der UI trennen (eigene `.ts`-Module / Custom Hooks statt alles in `.tsx`).
2. **Layout & HTML:** Abstände über `gap` im Elternelement, `padding` oder Spacer statt `margin`. Natives HTML (z. B. `<details>`/`<summary>`) vor JavaScript bevorzugen.
3. **UI-Komponenten & Blöcke:** Zuerst lokal prüfen, dann im Browser in Reihenfolge `https://ui.shadcn.com/` → `https://www.shadcn.io/` → `https://shadcnstudio.com/` prüfen, bevorzugt per CLI installieren und gemäß `rules/ui-components.md` ablegen (`packages/ui/src/components/shadcn/` für geteilte Komponenten, `apps/<App>/src/components/ui/` für App-spezifische).
   - Lokale `Editable`-Backup-Quelle (falls offline benötigt): `C:\Users\Kunc GmbH\Documents\Tools Connect\ShadCN\components_ui`
4. **Qualität & Abschluss:** Code automatisch mit Prettier formatieren (`rules/code-formatting.md`), Imports/Theme/Styles anpassen, Build & Dev-Server testen und Fehler autonom beheben.
5. **Videos automatisch & headless erstellen:** Wenn ein Video erstellt werden soll, nutze `apps/Analysis` (`tools/Videos/remotion`, `tools/Videos/hyperframes`, `tools/Videos/Vorlagen`, `skills/video-production/SKILL.md`) gemäß `rules/video-production.md`. **Niemals** `localhost`-Studio/Preview öffnen — komplett unsichtbar per CLI rendern und direkt die fertige Videodatei liefern.

## Git & Pull-Request-Regel (`stefankunc/company-os` + Graphite)

Jede Änderung in der lokalen Version wird sauber über einen **neuen Pull Request (PR)** auf GitHub gespeichert – bevorzugt per **Graphite Stack Diffs (`gt`)**, sobald `gt auth` aktiv ist:

1. **Neuen Branch / Stack anlegen:** Nie unkontrolliert direkt auf `main` arbeiten – mit `gt create -m "<beschreibung>"` (bzw. `git checkout -b ...`) für jede Änderung einen kurzen Branch anlegen.
2. **Prüfen & Committen:** Vor dem Commit `pnpm format:check` (und ggf. `pnpm typecheck`) ausführen und die Änderung klar beschreiben.
3. **Hochladen & PR erstellen:** Mit `gt ss` (Stack Submit) alle offenen Stacks als PRs gegen `main` synchronisieren – bei Review-Feedback `gt modify` + `gt ss`, zum Aufräumen & Rebasen nach Merges `gt sync`. _(Fallback ohne Graphite-Auth: `git push` + PR via `gh api`.)_
4. **Agenten-Ausführung (Windows & Non-Interactive):** KI-Agenten führen `gt` immer non-interactive aus (`gt create -a -m "<beschreibung>" --no-interactive`, `gt ss --no-interactive`, `gt sync --no-interactive`) und setzen auf Windows `C:\Program Files\Git\mingw64\libexec\git-core` in den `PATH`. Merges auf `main` erfolgen erst nach Freigabe durch den Nutzer.
5. **Datenschutz, App-Repos & Submodules:** `apps/` bleibt in `company-os/.gitignore` ausgeschlossen — jede App unter `apps/` (`Connect`, `Hyper`, `Analysis`, `Spark`, `Flux`) bekommt ihr **eigenes privates GitHub-Repo** (sobald dort entwickelt wird), niemals in `company-os` pushen. Die Design-Bibliotheken `packages/ui/src/components/shadcn/elements` (`shadcn-ui/ui`) und `packages/ui/src/components/shadcn/studio` (`shadcnstudio/shadcn-studio`) sind als **Git-Submodules** eingebunden — zum Klonen inkl. beider Bibliotheken `git clone --recursive https://github.com/stefankunc/company-os.git` nutzen.
