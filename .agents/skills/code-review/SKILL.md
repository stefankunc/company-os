---
name: code-review
description: Erzeugt einen fertigen Copy-Paste-Prompt für ein Cross-Model Code-Review in einer neuen Konversation mit einem anderen KI-Modell. Trigger: /code-review, "code review", "review prompt".
disable-model-invocation: true
---

# Cross-Model Code-Review Prompt Generator (`/code-review`)

## Ziel

Führe das Code-Review **nicht** selbst durch. Erzeuge stattdessen einen **sofort kopierbaren Review-Prompt** als Markdown-Codeblock, den der Nutzer in einer **neuen Konversation mit einem anderen KI-Modell** einfügt.

## Ablauf

1. **Änderungen ermitteln (kurz & gezielt):**
   - Prüfe im aktuellen Projektverzeichnis via `git status --short`, `git branch --show-current` und `git diff --stat main...HEAD` (oder `git diff --stat`, falls noch uncommittet), welche Dateien geändert wurden.
   - Falls unklar ist, welches Repo/welcher Bereich gemeint ist, kurz nachfragen.

2. **Fertigen Copy-Paste-Prompt ausgeben:**
   Gib dem Nutzer **direkt einen einzelnen kopierbaren `text`-/`markdown`-Codeblock** aus, der genau diese Struktur hat:

   ```text
   Führe ein gnadenlos ehrliches Code-Review der aktuellen Änderungen durch – keine Schmeichelei, kein Fülltext.

   **Kontext:**
   - Projekt / Pfad: <absoluter Pfad>
   - Branch / Scope: <Branch-Name bzw. uncommittete Änderungen>
   - Geänderte Dateien: <kompakte Liste der geänderten Dateien>
   - Kurzbeschreibung: <1–2 Sätze, was umgesetzt wurde>

   **Prüfauftrag:**
   1. Lies die geänderten Dateien bzw. führe `git diff main...HEAD` (und ggf. `git diff`) aus.
   2. Prüfe streng gegen unsere Regeln in `C:\Users\Kunc GmbH\Documents\CNT\rules\vermeiden.md` und `rules/aufbau.md`.
   3. Suche gezielt nach:
      - Echten Bugs, Logikfehlern, Race Conditions & Edge-Cases
      - Security-/Auth-/DAL-/IDOR-/XSS-/Injection-Lücken
      - Performance- & Kostenfallen (N+1/Wasserfälle, fehlende Indizes, ungeschützte Loops/Events, Egress)
      - Typ-Sicherheit (`any`, fehlende Zod-Validierung, fehlende `res.ok`/Timeouts)
      - Over-Engineering oder unnötiger Komplexität

   **Ausgabeformat:**
   - Nur echte Funde, priorisiert nach Schweregrad (`KRITISCH`, `HOCH`, `MITTEL`).
   - Pro Fund genau 1 knappe Zeile: `Datei:Zeile — Problem → konkreter Fix`.
   - Wenn alles sauber ist: kurz `LGTM – keine kritischen Funde` + max. 1–2 optionale Hinweise.
   ```

3. **Hinweis in 1 Zeile:**
   Empfiehl dem Nutzer unter dem Codeblock kurz ein **anderes Modell** aus seinem Pool (gemäß `rules/model-selection.md`), damit nicht dasselbe Modell seinen eigenen Code reviewt.
