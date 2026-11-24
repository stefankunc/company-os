# Videoproduktion (Headless in `apps/Analysis`)

- **Strikt Headless:** Niemals `remotion studio`, `hyperframes preview` oder `localhost` öffnen. Unsichtbar per CLI rendern und fertige Datei aus `apps/Analysis/outputs/` liefern.
- **Pfade:**
  - Skill: `apps/Analysis/skills/video-production/SKILL.md` (`npx skills add heygen-com/hyperframes`)
  - Remotion (React/Charts/Daten-Videos): `apps/Analysis/tools/Videos/remotion/`
  - HyperFrames (Explainer/Motion/HTML-CSS-GSAP): `apps/Analysis/tools/Videos/hyperframes/`
  - Gespeicherte Styles/Templates: `apps/Analysis/tools/Videos/Vorlagen/`
  - Fertige Videos: `apps/Analysis/outputs/`
- **Vorlagen:** Vor jedem Video `Vorlagen/` prüfen & wiederverwenden; neue gelungene Styles als `Vorlagen/<style-name>/` (`style.md` + Template) sichern.
