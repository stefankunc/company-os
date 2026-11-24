# Tech Stack

## Frameworks & Apps

- **Next.js (App Router):** Full-Stack Web-Apps, Dashboards, Server Components, Server Actions, APIs.
- **React:** Wiederverwendbare UI-Bausteine in Next.js.
- **Astro:** Statische/Content-First Landing Pages & SEO-Seiten (`apps/Company-OS`).
- **HTMX:** Nur für einfache server-gerenderte Bereiche / Astro (nie mit React-State mischen).
- **React Native (Expo):** Android- & iOS-Apps mit geteilten Typen aus `@cnt/types`; immer **Expo Prebuild (CNG / Config Plugins) + Dev Client + EAS Cloud-Builds** (kein manuelles `android/`/`ios/`-Ejecting, sauber auf Windows entwickelbar).

## Sprache, Daten & Styling

- **TypeScript:** Strikte Typen & feste Schemas (`strict: true`, kein `any`).
- **Zod:** Schema- & Laufzeit-Validierung für APIs, Webhooks, Formulare, JSON-Payloads.
- **Drizzle ORM:** 100 % TypeScript SQL-ORM; App-Tabellen-Präfixe (`connect_`, `hyper_`, `analysis_`, `spark_`, `flux_`) für gemeinsame SQL-DB (PostgreSQL / Neon / Supabase).
- **JavaScript / Natives HTML:** JS nur für echte Logik; Standard-UI nativ (`<details>`/`<summary>`).
- **Tailwind CSS v4:** Utility-First Styling (CSS-First via `@import "tailwindcss";` & `@theme`, keine `tailwind.config.js` / kein `autoprefixer`); `gap` & `padding` statt `margin`.

## SDKs & Tooling

- **Monorepo & `pnpm`:** `apps/*` + `packages/*` in einem Workspace; immer `pnpm` statt `npm`.
- **Prettier:** Auto-Formatierung (`package.json`-Config + `prettier-plugin-tailwindcss`).
- **`@vercel/sdk`:** Programmatisches Auto-Deployment, Env-Vars, Domains, Status & Logs (`apps/Flux`, Status-Dashboard; strikt `server-only` gekapselt).
- **Vercel AI SDK (`ai`):** Strukturierte KI-Ausgaben mit Zod (Texte, Alt-Texte, Templates in `Flux`/`Connect`; Claude/Gemini/OpenAI).
- **Bruno (vorgemerkt):** Offline-first Git-API-Tests (`bru`-Dateien + CLI), sobald eigene APIs getestet werden.
- **Testing (`Vitest` & `Playwright`):** Pragmatisch ohne 100 %-Coverage-Zwang — **Vitest** für komplexe Logik, Parser, Berechnungen & kritische DAL-/Zod-Regeln; **Playwright** für kritische E2E-Flows (kein Jest/Enzyme).

## Plattform & Infrastruktur (Tool Stack)

- **Vercel:** Standard-Hosting, Auto-Deployments & Preview-URLs (inkl. `@vercel/sdk`).
- **Neon / Supabase (PostgreSQL):** Managed SQL-Datenbank für Drizzle ORM (mit App-Tabellen-Präfixen).
- **Clerk** _(oder Better Auth self-hosted)_: Authentifizierung, Sessions & Nutzerverwaltung.
- **UploadThing & Mux:** Datei-/Bild-Uploads (`UploadThing`) und Video-Streaming (`Mux`, bei Bedarf).
- **Plausible & PostHog (EU-Cloud):** DSGVO-konforme Analytics – **Plausible** (cookiefrei für Landingpages wie `Company-OS`) und **PostHog EU** (Produkt-Analytics via Next.js-Rewrite-Proxy + typsicherem Server-Wrapper).
