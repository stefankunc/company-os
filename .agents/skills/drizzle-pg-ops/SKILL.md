---
name: drizzle-pg-ops
description: Guardrail für Drizzle ORM & PostgreSQL Schema-Design, Indizes, Pagination und sichere Migrationen auf Neon/Supabase. Nutzen bei jeder Schema-Änderung, neuen Tabellen oder DB-Queries.
---

# Drizzle & PostgreSQL Guardrails

Prüfe jede Schema-Änderung oder DB-Migration gegen diese 6 Pflichtregeln:

1. **Tabellen-Präfix, Primärschlüssel & Nullability:**
   - Immer App-Präfix via `tableCreator` (`connect_`, `hyper_`, `analysis_`, `spark_`, `flux_`).
   - Primärschlüssel: zeitlich sortierbare **UUID v7** (nativer Postgres-`uuid`-Typ, nie `varchar`/`text`) oder `bigint`/`identity` — keine zufälligen UUID v4.
   - Foreign Keys & Auth-Spalten (`userId`, `orgId`) strikt `.notNull()` definieren (nie heimlich nullable machen, um Validierungsfehler zu umgehen).
2. **Kein Boolean-Chaos (Timestamps & Status):**
   - Zeitliche Ereignisse als nullable Timestamp (`confirmedAt`, `deletedAt`, `verifiedAt`) statt `boolean` (verhindert Split-Brain).
   - Mehrstufige Zustände als einzelnes Status-Feld (`pgEnum` / String-Union) statt mehrerer paralleler Booleans (`isPending`, `isCompleted`, `isFailed`).
3. **Indizes Pflicht:**
   - Expliziter `index()` auf **jeden Foreign Key** (`userId`, `orgId`, …) und häufige Filter-/Sortier-Spalten (Postgres indiziert FKs nicht automatisch).
   - Keine redundanten Left-Prefix-Indizes (bei `(user_id, created_at)` kein extra Index auf `(user_id)`).
4. **Abfragen & Typen:**
   - Keine manuellen Doppel-Typen — immer `$inferSelect` / `$inferInsert` aus Drizzle ableiten.
   - Wachsende Listen/Feeds immer mit **Cursor-Pagination** (UUID v7 / Timestamp) statt `OFFSET`.
   - Flache SQL-/Tabellen-Payloads für LLM-Inputs on-the-fly in **TOON** encodieren (DB bleibt Postgres/Drizzle; LLM-Outputs weiter als JSON + Zod).
5. **Sichere Migrationen (kein Blind-Push auf Prod):**
   - Versionierte Migrationen via `drizzle-kit generate` erzeugen und zuerst auf einem isolierten **DB-Branch** (z. B. Neon Branch) testen.
   - Destruktive Live-Änderungen (Spalte umbenennen/löschen) immer per **Expand-and-Contract** über 2 Deploys ausführen.
6. **Connection Pooling:**
   - In Serverless (Vercel) zwingend den Neon-/Supabase-Pooler (HTTP/PgBouncer) nutzen; keine Geschäftslogik oder Auth in DB-Triggern/Stored Procedures/komplexem RLS verstecken.
