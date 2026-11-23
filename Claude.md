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
- **Code-Formatierung (Prettier):** `C:\Users\Kunc GmbH\Documents\CNT\rules\code-formatting.md`

## Kurz-Checkliste für jede Aufgabe

1. **Stack & Struktur:** Next.js + React (Web-Apps), Astro (+ optional HTMX) für Landing Pages, React Native/Expo (Mobile), striktes TypeScript, Tailwind CSS, immer `pnpm` statt `npm`.
2. **Layout & HTML:** Abstände über `gap` im Elternelement, `padding` oder Spacer statt `margin`. Natives HTML (z. B. `<details>`/`<summary>`) vor JavaScript bevorzugen.
3. **UI-Komponenten & Blöcke:** Zuerst lokal prüfen, dann im Browser in Reihenfolge `https://ui.shadcn.com/` → `https://www.shadcn.io/` → `https://shadcnstudio.com/` prüfen, bevorzugt per CLI installieren und gemäß `rules/ui-components.md` ablegen (`packages/ui/src/components/shadcn/` für geteilte Komponenten, `apps/<App>/src/components/ui/` für App-spezifische).
   - Lokale `Editable`-Backup-Quelle (falls offline benötigt): `C:\Users\Kunc GmbH\Documents\Tools Connect\ShadCN\components_ui`
4. **Qualität & Abschluss:** Code automatisch mit Prettier formatieren (`rules/code-formatting.md`), Imports/Theme/Styles anpassen, Build & Dev-Server testen und Fehler autonom beheben.

## Git & Pull-Request-Regel (`stefankunc/company-os`)

Jede Änderung in der lokalen Version wird sauber über einen **neuen Pull Request (PR)** auf GitHub gespeichert:

1. **Neuen Branch anlegen:** Nie unkontrolliert direkt auf `main` arbeiten – für jede Änderung einen kurzen Branch anlegen (z. B. `feat/...`, `fix/...`, `docs/...`, `chore/...`).
2. **Prüfen & Committen:** Vor dem Commit `pnpm format:check` (und ggf. `pnpm typecheck`) ausführen und die Änderung mit einer klaren Commit-Nachricht speichern.
3. **Pushen & PR erstellen:** Den Branch nach `origin` (`https://github.com/stefankunc/company-os`) pushen und direkt einen **Pull Request gegen `main`** erstellen (`gh pr create`) – inklusive kurzer Beschreibung, **was geändert wurde**.
4. **Datenschutz & Submodules:** `apps/` bleibt in `.gitignore` und wird nicht auf GitHub gepusht. Die Design-Bibliotheken `packages/ui/src/components/shadcn/elements` (`shadcn-ui/ui`) und `packages/ui/src/components/shadcn/studio` (`shadcnstudio/shadcn-studio`) sind als **Git-Submodules** eingebunden — zum Klonen inkl. beider Bibliotheken `git clone --recursive https://github.com/stefankunc/company-os.git` nutzen.
