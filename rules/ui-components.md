# UI-Komponenten & UI-Quellen

## Zweck

Dieses Dokument definiert alle UI-Quellen, den Installationsablauf (Browser + CLI) und die verbindlichen Speicherorte für UI-Komponenten im CNT-Monorepo (`apps/Connect`, `apps/Hyper`, `apps/Analysis`, `apps/Spark`, `apps/Flux`).

## UI-Quellen (Priorisierte Reihenfolge)

Wenn eine UI-Komponente, ein Element, ein Block oder ein Designbeispiel benötigt wird, nutze die Quellen in dieser Reihenfolge:

| Priorität | Quelle            | Wann verwenden                                                                            | Im Browser öffnen         | Zielordner im CNT-Repo                           | Installation                                                       |
| --------- | ----------------- | ----------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------ | ------------------------------------------------------------------ |
| 1         | **shadcn/ui**     | Standardkomponenten (`Button`, `Input`, `Dialog`, `Select`, `Table`, `Card`, `Form` usw.) | https://ui.shadcn.com/    | `packages/ui/src/components/shadcn/elements/`    | `npx shadcn@latest add <component>`                                |
| 2         | **shadcn.io**     | Erweiterte Komponenten & Spezial-Elemente (z. B. `Editable`)                              | https://www.shadcn.io/    | `packages/ui/src/components/shadcn/<component>/` | `npx shadcn@latest add "https://www.shadcn.io/r/<component>.json"` |
| 3         | **ShadCN Studio** | Fertige UI-Blöcke, Templates, Dashboards, Landing Pages, E-Commerce-UIs & Datatables      | https://shadcnstudio.com/ | `packages/ui/src/components/shadcn/studio/`      | Im Browser auswählen, nur benötigten Block übernehmen              |

## Speicherorte & Entscheidungshilfe

| Situation                                                                                   | Speicherort                                               |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Komponente wird nur in einer App benötigt (`Connect`, `Hyper`, `Analysis`, `Spark`, `Flux`) | `apps/<App>/src/components/ui/<component-name>/`          |
| Komponente wird in mehreren Apps benötigt / soll wiederverwendbar sein                      | `packages/ui/src/components/shadcn/<component-name>/`     |
| Allgemeine Basis-Elemente (`shadcn/ui`)                                                     | `packages/ui/src/components/shadcn/elements/`             |
| Inline-Textbearbeitung (`Editable` von `shadcn.io`)                                         | `packages/ui/src/components/shadcn/editable/editable.tsx` |
| Vorgefertigte Blöcke & Templates (`ShadCN Studio`)                                          | `packages/ui/src/components/shadcn/studio/`               |

## Ablauf (Browser + CLI)

1. **Zuerst lokal prüfen**, ob die benötigte Komponente bereits in `packages/ui` oder in der Ziel-App existiert.
2. **Quelle im Browser öffnen** (in der Reihenfolge 1 → 2 → 3), um Varianten, Aufbau und visuelle Beispiele zu prüfen.
3. **Bevorzugt per CLI installieren** (`npx shadcn@latest add ...`), sobald ein Registry-Befehl verfügbar ist. Code nur manuell übernehmen, wenn kein CLI-Befehl existiert (z. B. bei ShadCN Studio-Blöcken).
4. **Nur das Nötige übernehmen** – keine kompletten Demo-Seiten oder ganze Repositories in den Komponentenordner kopieren.
5. **Ordner & Namenskonvention:** Neue UI-Komponenten als eigenen Unterordner anlegen und Dateinamen in `kebab-case` benennen (z. B. `editable.tsx`). Fehlende Ordner automatisch erstellen.
6. **Abhängigkeiten & Primitives prüfen:** Fehlende Pakete (z. B. `lucide-react`, `@ark-ui/react`, Radix UI / Base UI) sauber mit `pnpm` installieren und React-/Tailwind-Kompatibilität prüfen.
7. **Imports, Theme & Styles anpassen:** An das CNT-Projekt anpassen, vorhandene Basiskomponenten (Buttons, Dialoge etc.) wiederverwenden statt Duplikate anzulegen.
8. **Formatieren & testen:** Code automatisch mit Prettier formatieren (`rules/code-formatting.md`), anschließend Build und Dev-Server testen und Fehler autonom beheben.

## Imports in Apps

- **App-spezifische Komponente:**
  ```tsx
  import { Editable } from "@/components/ui/editable";
  ```
- **Gemeinsame Komponente aus `packages/ui`:**
  ```tsx
  import { Editable } from "@cnt/ui/editable";
  ```
  _(Den exakten Package-Namen immer aus `packages/ui/package.json` prüfen.)_

## Zusatzregeln für ShadCN Studio

- Quelle: https://shadcnstudio.com/ | Repository: https://github.com/shadcnstudio/shadcn-studio
- Nur benötigte Komponenten/Blöcke und deren Abhängigkeiten übernehmen – niemals das gesamte Repository kopieren.
- Lizenz- und Copyright-Hinweise immer erhalten.
- Kostenpflichtige Inhalte nur mit vorhandener Lizenz nutzen.
