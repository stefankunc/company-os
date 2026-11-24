# Fonts & Typografie

## Standard-Schriftarten (CNT-Monorepo)

| Schriftart               | Einsatzbereich                                                    | Einbindung                                              |
| ------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------- |
| **Geist** (`Geist Sans`) | Standard für Headlines, UI-Elemente & Fließtext in allen CNT-Apps | `next/font/google` (`Geist`) oder `pnpm add geist`      |
| **Geist Mono**           | Zahlen, Tabellen, Kurse, IDs, Code-Blöcke & Dashboards            | `next/font/google` (`Geist_Mono`) oder `pnpm add geist` |

## Regeln

1. **Immer selbstgehostet (DSGVO & Speed):** Schriftarten niemals über externe `<link>`-Tags von Google Fonts im Browser laden – immer über `next/font` oder lokale Pakete (`pnpm add geist`) bundeln.
2. **Tailwind CSS Variablen:** Im Root-Layout als CSS-Variablen (`--font-geist-sans`, `--font-geist-mono`) registrieren und in Tailwind als `font-sans` bzw. `font-mono` hinterlegen.
3. **Konsistenz über alle Apps:** `Connect`, `Hyper`, `Analysis`, `Spark` und `Flux` nutzen standardmäßig Geist & Geist Mono (sofern eine App oder Video-Vorlage nicht ausdrücklich eine eigene Brand-Schrift definiert).
4. **Design-Tools & Videos:** Für Figma, Paper oder Video-Vorlagen (`apps/Analysis/tools/Videos/Vorlagen/`) die offiziellen Open-Source-Schriftschnitte von Vercel (`Geist` / `Geist Mono`) nutzen.
