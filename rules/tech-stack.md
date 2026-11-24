# Tech Stack

## Frameworks & Apps

- **Next.js (App Router):** Full-Stack Web-Apps, Dashboards, Server Components, Server Actions, APIs.
- **React:** Wiederverwendbare UI-Bausteine in Next.js.
- **Astro:** Statische/Content-First Landing Pages & SEO-Seiten (`apps/Company-OS`).
- **HTMX:** Nur für einfache server-gerenderte Bereiche / Astro (nie mit React-State mischen).
- **React Native (Expo):** iOS/Android-Apps mit geteilten Typen aus `@cnt/types`.

## Sprache, Daten & Styling

- **TypeScript:** Strikte Typen & feste Schemas (`strict: true`, kein `any`).
- **Zod:** Schema- & Laufzeit-Validierung für APIs, Webhooks, Formulare, JSON-Payloads.
- **Drizzle ORM:** 100 % TypeScript SQL-ORM; App-Tabellen-Präfixe (`connect_`, `hyper_`, `analysis_`, `spark_`, `flux_`) für gemeinsame SQL-DB (PostgreSQL / Neon / Supabase).
- **JavaScript / Natives HTML:** JS nur für echte Logik; Standard-UI nativ (`<details>`/`<summary>`).
- **Tailwind CSS:** Utility-First Styling; `gap` & `padding` statt `margin`.

## SDKs & Tooling

- **Monorepo & `pnpm`:** `apps/*` + `packages/*` in einem Workspace; immer `pnpm` statt `npm`.
- **Prettier:** Auto-Formatierung (`package.json`-Config + `prettier-plugin-tailwindcss`).
- **`@vercel/sdk`:** Programmatisches Auto-Deployment, Env-Vars, Domains, Status & Logs (`apps/Flux`, Status-Dashboard; strikt `server-only` gekapselt).
- **Vercel AI SDK (`ai`):** Strukturierte KI-Ausgaben mit Zod (Texte, Alt-Texte, Templates in `Flux`/`Connect`; Claude/Gemini/OpenAI).
- **Bruno (vorgemerkt):** Offline-first Git-API-Tests (`bru`-Dateien + CLI), sobald eigene APIs getestet werden.
