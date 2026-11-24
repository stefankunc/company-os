# KI-Modell-Auswahl & Live-Recherche

## 1. Live-Recherche-Workflow

- **Immer live prüfen (kein veraltetes Hardcoding):** Auf Zuruf oder bei neuen Major-Releases recherchiert der Agent live per Web-Suche die aktuell neuesten Frontier- & Open-Weight-Modelle (Gemini, Claude, OpenAI, DeepSeek/Qwen) und vergleicht sie direkt mit dem verfügbaren Nutzer-Pool (z. B. **Gemini 4 Neon**).
- **5 objektive Vergleichs-Kriterien:**
  1. **Reale Coding-/Reasoning-Benchmarks:** SWE-bench Verified, LiveBench, Aider Polyglot (keine reinen Marketing-Charts).
  2. **UI-/Frontend-Qualität:** Sauberes React, Next.js, Tailwind CSS v4 & `shadcn/ui` ohne Design-Slop.
  3. **Tool-Call- & Agent-Stabilität:** Präzise Multi-File-Edits, zuverlässige Terminal-/MCP-Aufrufe.
  4. **Kontext, Tempo & Multimodalität:** 1M+ Kontext für große Codebases/Docs, Tokens/s, native Bild-/PDF-/Video-Verarbeitung.
  5. **Macken & Verfügbarkeit:** Warnung vor Overthinking, Self-Gaslighting oder ungefragten Rewrites; Prüfung auf Verfügbarkeit im Nutzer-Pool/BYOK-Abo.

## 2. Task- & Projekt-Zuordnung (CNT)

- **UI / Frontend / Design** (`Company-OS`, `Flux`, `@cnt/ui`) → Stärkstes UI-/Frontend-Modell im Pool (visueller Geschmack, kein ungefragtes Umschreiben).
- **Architektur / Security / harte Logik-Bugs** (DAL, Billing, Auth) → Stärkstes Reasoning-Modell (High-Thinking nur für wirklich komplexe Logik, nie für Routine-Tasks).
- **Große Codebases / Recherche / Multimodal** (`Connect`, Docs, Video/PDF) → Stärkstes Long-Context-/Multimodal-Modell (z. B. Gemini-Linie).
- **Routine-Edits / Refactoring / Docs / Subagents** → Schnellstes zuverlässiges Standard-/Flash-Modell mit präzisen Tool-Calls.

## 3. Empfehlung & Eigene Meinung (Overrides)

- **Proaktive 1-Zeilen-Empfehlung:** Vor größeren Tasks oder neuen Projekten nennt der Agent in 1 Zeile das passendste Modell aus dem Nutzer-Pool inkl. kurzer Begründung.
- **Eigene Meinung schlägt Benchmarks:** Persönliche Praxiserfahrungen & Projekt-Präferenzen des Nutzers haben immer Vorrang.
- **Aktiver Referenz-Pool:** `Gemini 4 Neon` (+ weitere aktuell in Antigravity/Abos verfügbare Modelle).
- **Eigene Overrides:** _(Hier persönliche Erfahrungen & feste Projekt-Zuordnungen ergänzen.)_
