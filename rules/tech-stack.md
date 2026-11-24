# Tech Stack

## Frameworks & Apps

| Technologie             | Rolle                                             | Wann wir es nutzen                                                                                   |
| ----------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Next.js**             | Full-Stack Web-Framework (Frontend + Backend/API) | Haupt-Web-Apps, Dashboards, geschützte Bereiche, Server Actions & API-Routen                         |
| **React**               | UI-Bibliothek                                     | Wiederverwendbare UI-Bausteine & komplexe interaktive Oberflächen in Next.js                         |
| **Astro**               | Static / Content-First Framework                  | Schnelle Landing Pages, Marketing-Seiten, SEO-Seiten                                                 |
| **HTMX**                | Server-gestützte Interaktivität                   | Einfache dynamische Bereiche auf server-gerenderten Seiten / Astro (nicht gegen React-State mischen) |
| **React Native (Expo)** | Mobile-Framework                                  | iOS- & Android-Apps mit geteilter Logik aus dem Monorepo                                             |

## Sprache, Styling & HTML

| Technologie      | Rolle                          | Grundprinzip                                                                                              |
| ---------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| **TypeScript**   | Typsichere Programmiersprache  | Feste Schemas & strikte Typen für stabilen, fehlerarmen Code                                              |
| **Zod**          | Schema- & Laufzeit-Validierung | Prüft externe Daten (APIs, Webhooks, Formulare, JSON-Payloads) zur Laufzeit und liefert passende TS-Typen |
| **JavaScript**   | Web-Logik                      | Nur für echte Anwendungslogik – nicht für Dinge, die natives HTML/CSS kann                                |
| **Natives HTML** | Semantik & Basis-Interaktion   | Z. B. `<details>` / `<summary>` für aufklappbare Bereiche statt unnötigem JS                              |
| **Tailwind CSS** | Utility-First Styling          | Schnelles, konsistentes Styling direkt an den Komponenten; Abstände über `gap` & `padding` statt `margin` |

## Tooling & Architektur

| Werkzeug        | Rolle                      | Standard                                                                                                                                                                                                       |
| --------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Monorepo**    | Repository-Architektur     | Alle Apps (`apps/`) und geteilter Code (`packages/`) in einem zentralen Repo                                                                                                                                   |
| **pnpm**        | Paketmanager               | Immer `pnpm` statt `npm` (schneller, konsistente Workspaces)                                                                                                                                                   |
| **Prettier**    | Code-Formatierung          | Automatische, einheitliche Formatierung im gesamten Repo                                                                                                                                                       |
| **Bruno**       | API-Tests (vorgemerkt)     | Offline-first, Git-basiert (`bru`-Dateien & CLI) – einsetzen, sobald eigene APIs getestet werden                                                                                                               |
| **Drizzle ORM** | SQL-ORM (100 % TypeScript) | Typsichere DB-Schemas ohne eigene Schema-Sprache; nutzt Tabellen-Präfixe pro App (`connect_`, `hyper_`, `analysis_`, `spark_`, `flux_`) für eine gemeinsame SQL-Datenbank (z. B. PostgreSQL / Neon / Supabase) |
