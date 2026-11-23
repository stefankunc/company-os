# Videoproduktion (Headless in `apps/Analysis`)

## Grundprinzip

Alle automatischen Videos im CNT-Monorepo werden zentral in **`apps/Analysis`** produziert, damit **jeder KI-Agent** auf dieselben Tools, Skills und Design-Vorlagen zugreifen kann.

- **Komplett Headless (kein `localhost`!):** Remotion Studio, HyperFrames Preview oder lokale Browser-Server werden **nicht** geöffnet. Das Rendering läuft vollständig unsichtbar per CLI.
- **Ergebnis:** Der Agent liefert am Ende direkt die fertig gerenderte Videodatei unter `apps/Analysis/outputs/`.

## Speicherorte in `apps/Analysis`

- **Skills:** `apps/Analysis/skills/video-production/SKILL.md` (plus `npx skills add heygen-com/hyperframes`)
- **Video-Tools:**
  - `apps/Analysis/tools/Videos/remotion/` (`https://github.com/remotion-dev/remotion.git`)
  - `apps/Analysis/tools/Videos/hyperframes/` (`https://github.com/heygen-com/hyperframes.git`)
- **Vorlagen (gespeicherte Styles):** `apps/Analysis/tools/Videos/Vorlagen/`
- **Fertige Videos:** `apps/Analysis/outputs/`

## Wann welches Video-Tool nutzen?

| Situation                                                                                      | Tool            |
| ---------------------------------------------------------------------------------------------- | --------------- |
| React-/Tailwind-Komponenten, Charts, Datenvisualisierung, programmatische Serien-Videos        | **Remotion**    |
| Explainer-Videos, Launch-Clips, Motion Graphics, animierte Titelkarten auf HTML/CSS/GSAP-Basis | **HyperFrames** |

## Vorlagen-Regel

1. Vor jeder Video-Erstellung `apps/Analysis/tools/Videos/Vorlagen/` prüfen und vorhandene Styles wiederverwenden.
2. Gefällt ein neuer Style besonders gut, direkt unter `apps/Analysis/tools/Videos/Vorlagen/<style-name>/` (`style.md` + Template) speichern.
