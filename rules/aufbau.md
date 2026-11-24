# Aufbau & Architektur

## 1. Monorepo-Struktur

```txt
CNT/
├── apps/ (Company-OS, Connect, Hyper, Analysis, Spark, Flux)   # lokal, nicht in company-os Git
├── packages/
│   ├── ui/src/components/shadcn/{elements, editable, studio}   # @cnt/ui
│   └── types/                                                  # @cnt/types
├── .agents/skills/ (code-review, next-rsc-audit, drizzle-pg-ops) # Repo-Skills für alle Agents
├── rules/ (tech-stack, aufbau, vermeiden, ui-components, fonts, video-production, code-formatting, model-selection)
└── package.json, pnpm-workspace.yaml, tsconfig.base.json, AGENTS.md, Claude.md
```

## 2. Komponenten, RSC & Daten

- **Modular & getrennt:** Kleine `.tsx`-UI-Komponenten; Geschäftslogik/APIs in `.ts`-Dateien oder Custom Hooks. Shared UI → `packages/ui`, App-UI → `apps/<App>/src/components/ui`, Shared Types → `packages/types`.
- **Colocation & flache Abstraktionen:** Feature-nah organisieren statt striktem MVC (UI, Tailwind-Styles & Feature-Logik nah beieinander; DB-Zugriffe bleiben sauber im DAL). Reine Datenstrukturen + zustandslose Funktionen statt tiefer OOP-Klassen-Hierarchien (max. 1 Abstraktionsebene).
- **RSC-First (Next.js App Router):** Standardmäßig Server Components (`async/await` auf Server). `"use client"` nur tief in kleinen interaktiven Inseln (`useState`, Events, `Editable`).
- **Boundaries:** Client Components importieren nie Server Components direkt – immer als `children` oder Prop übergeben.
- **Streaming & PPR:** Langsame/dynamische Server Components (`cookies()`, `headers()`, Nutzer-/Live-Daten) in `<Suspense fallback={...}>` kapseln, nie oben im statischen Layout – Hülle lädt sofort, Dynamik streamt nach.
- **URL-State (`searchParams`):** Filter, Suche, Sortierung & Pagination gehören typsicher (via **Zod**, bei Bedarf `nuqs`) in die URL statt in lokales `useState` → reload-/teilbar und direkt in RSC lesbar.
- **Externe SDKs/APIs:** Schwach getypte Drittanbieter-SDKs einmalig hinter typsicheren Wrappern kapseln; externe JSON-Payloads mit **Zod** validieren.
- **Kein Config Hell:** Tools mit guten Defaults; Configs wo möglich in `package.json`; Root schlank halten.

## 3. Layout & CSS

- **Elternelement steuert Abstände:** Flexbox/Grid + `gap` am Parent (keine Außenabstände an Kindern).
- **`padding` statt `margin`:** Vermeidet Margin-Collapse; bei ungleichen Abständen Wrapper-/Spacer-Elemente nutzen.
- **Natives HTML zuerst:** Z. B. `<details>`/`<summary>` statt JS.

## 4. Security & Data Access Layer (DAL)

- **Drizzle + Präfixe & Primärschlüssel:** Schemas in TS mit `tableCreator` (`connect_`, `hyper_`, `analysis_`, `spark_`, `flux_`). Als Primärschlüssel zeitlich sortierbare **UUID v7** (nativer Postgres-`uuid`-Typ, nie `varchar`/`text`) oder `bigint`/`identity` nutzen – keine zufälligen UUID v4 (verhindert B-Tree-Fragmentierung & Index-Bloat). Zeitliche Ereignisse als nullable Timestamp (`confirmedAt`, `deletedAt`) statt `boolean` modellieren und mehrstufige Zustände als einzelnes Status-Feld (String-Union/`pgEnum`) statt separater Boolean-Flags (verhindert ungültige Parallelzustände & Split-Brain).
- **Indizes & sichere Migrationen:** In PostgreSQL/Drizzle auf **jeden Foreign Key** (`userId`, `orgId`, …) und häufige Filter-/Sortier-Spalten explizit einen `index()` setzen (Postgres indiziert FKs _nicht_ automatisch → verhindert teure Full Table Scans); keine redundanten Left-Prefix-Duplikate (bei `(user_id, created_at)` kein extra Index auf `(user_id)`). Schema-Änderungen als versionierte Drizzle-Migrationen zuerst auf einem isolierten **DB-Branch** (z. B. Neon Branch) testen – nie blind auf Prod pushen; bei Live-Spalten **Expand-and-Contract** nutzen (erst neue Spalte optional anlegen, Code/Daten umstellen, alte Spalte erst im nächsten Deploy entfernen).
- **Typ-Inferenz, Request-Deduplication & Parallelisierung:** Keine manuellen Doppel-Typen für DB/Schemas schreiben – immer direkt aus **Drizzle** (`$inferSelect`/`$inferInsert`) und **Zod** (`z.infer`) ableiten. Wiederholt aufgerufene DAL-Leseabfragen mit React `cache()` wrappen, um doppelte DB-Queries im selben Request zu vermeiden. Unabhängige DB-Abfragen in einer Route/Action immer mit `Promise.all()` parallelisieren (keine sequenziellen `await`-Wasserfälle). Für wachsende Listen/Feeds **Cursor-Pagination** (über UUID v7 / Timestamp) statt `OFFSET` nutzen (verhindert Duplikate bei neuen Einträgen und langsame DB-Scans).
- **Zentraler DAL (`src/data/`):** Oben `import "server-only";` (bricht Build bei Client-Import).
- **Nur DTOs (auch im Cache):** Nie `SELECT *` oder rohe DB-Objekte an Clients geben – nur explizit erlaubte Felder. Beim Caching immer nur das kleine, transformierte Endergebnis cachen – nie rohe Multi-MB-API-Responses. Für Next.js-Caching `"use cache"` + `cacheLife()`/`cacheTag()` statt veraltetem `unstable_cache` nutzen (nie `cookies()`/`headers()` darin lesen); Request-APIs (`cookies()`, `headers()`, `params`, `searchParams`) immer mit `await` aufrufen.
- **Auth überall im DAL (nie in Middleware):** Cookies/Rechte bei jedem Datenzugriff prüfen – nie nur in Next.js-Middleware oder auf Seiten-Ebene (zerstört statisches Caching & Sicherheitsrisiko). `userId`/`orgId` niemals aus Client-Inputs übernehmen, sondern aus der serverseitigen Auth-Session beziehen (verhindert IDOR); bevorzugt passwortlos (OAuth/Passkeys).
- **Server Actions (`"use server"`):** Jeder Export in einer `"use server"`-Datei ist ein öffentlicher HTTP-Endpunkt – immer Auth/Rechte prüfen und nie interne Hilfsfunktionen daraus exportieren (diese gehören in `src/data/` mit `import "server-only";`). Secrets erst in der Action laden, IDs via `.bind()`, Inputs mit **Zod** (bei vielen geschützten Actions mit `next-safe-action`) prüfen und nach Mutationen direkt `revalidatePath()`/`revalidateTag()` aufrufen (statt extra `router.refresh()`). Keine Mutationen beim RSC-Rendern.
- **Region & Compute:** Next.js Node.js-Compute und SQL-Datenbank (Neon/Supabase) immer in **derselben Region** (z. B. EU/Frankfurt `fra1`) platzieren. Edge/CDN nur für statische Assets, Redirects, Header & leichte Middleware _ohne_ DB-Roundtrips.
- **Connection Pooling & Background-Jobs:** In Serverless-Umgebungen (Vercel) immer den DB-Connection-Pooler (Neon/Supabase HTTP/PgBouncer) nutzen, um Connection-Limits nicht zu sprengen. Produktiv-DBs für Kundendaten nicht auf Free-Tier/Scale-to-Zero betreiben (Always-On + automatische Backups/PITR). Kurze Nacharbeiten nach dem Response (Logging, Analytics) auf Vercel nie als unawaited Fire-and-Forget starten, sondern über Next.js `after()` (bzw. `waitUntil()` aus `@vercel/functions`) absichern. Lange oder rechenintensive Tasks (z. B. Video-Render, KI-Pipelines) aus HTTP-Requests auslagern und über zuverlässige Background-Jobs/Queues mit Retries ausführen.
- **Trust & Safety von Tag 1:** Öffentliche Endpunkte, Formulare, Uploads & Benachrichtigungen immer mit **Rate-Limiting** und Spam-/Missbrauchsschutz absichern. Uploads strikt auf erlaubte MIME-Types/Größen (Allowlist) beschränken – nie ausführbare Dateien (`.exe`, `.sh`) oder ungesichertes HTML hosten; sensible Uploads nie in öffentlichen/enumerierbaren Buckets speichern (signierte URLs nach Auth-Check) und bei Nutzer-Bildern EXIF-Metadaten (GPS/Gerätedaten) strippen. Bei nutzergenerierten Inhalten (UGC) von Anfang an **Soft-Delete / Audit-Logs** (gelöschte Inhalte bleiben für Moderation nachvollziehbar) und niedrigschwellige **1-Klick-Melde-Workflows** vorsehen.
- **Zahlungen & Billing-Sync (Stripe / MoR):** Vor jeder Checkout-Session zuerst eine `customerId` anlegen und fest mit der `userId` verknüpfen (keine verwaisten Kunden; bei Stripe _Limit to One Subscription_ aktivieren). Webhooks nie als partielle State-Patches parsen (Out-of-Order-Gefahr), sondern als Trigger für eine zentrale `syncBillingState(customerId)`-Funktion nutzen, die den aktuellen Gesamtzustand abruft und speichert – denselben Sync auch direkt auf der `/success`-Route auslösen (kein Split-Brain).

## 5. GitHub-Repo-Aufteilung

- **`stefankunc/company-os` (privat):** `AGENTS.md` (+ `Claude.md`-Pointer), `.agents/skills/`, `rules/`, `packages/ui`, `packages/types`, Submodules (`elements/`, `studio/`), Root-Configs.
- **App-Repos (je privat):** `apps/` bleibt in `.gitignore`; jede App bekommt ihr eigenes privates Repo, sobald dort Code entsteht. Lokal trotzdem voll über `pnpm-workspace.yaml` verbunden.
- **Kleine, atomare PRs (Graphite Stacking):** Änderungen in kleine, fokussierte PRs aufteilen und über Graphite (`gt`) stacken – keine monolithischen 500+-Zeilen-PRs.
