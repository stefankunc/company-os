# Fonts & Typografie

- **Standard-Schriften:** **Geist** (`Geist Sans` für Headlines, UI & Text) + **Geist Mono** (Zahlen, Tabellen, Kurse, IDs, Code).
- **Immer selbstgehostet (DSGVO & Speed):** Nie externe Google-Fonts-`<link>`-Tags; immer `next/font/google` (`Geist`, `Geist_Mono`) oder `pnpm add geist`.
- **Tailwind:** Als CSS-Variablen `--font-geist-sans` / `--font-geist-mono` im Root-Layout registrieren und auf `font-sans` / `font-mono` mappen.
- **Einheitlich:** Standard für alle 6 CNT-Apps sowie Design-/Video-Vorlagen (`apps/Analysis/tools/Videos/Vorlagen/`), sofern kein eigener Brand-Font definiert ist.
- **Lesbarkeit & Kontrast:** Ausreichende Zeilenabstände (`leading-relaxed` im Fließtext) und starker Kontrast (WCAG ≥ 4,5:1), besonders bei Text auf Farbverläufen.
