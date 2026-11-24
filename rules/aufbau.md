# Aufbau & Architektur

## 1. Monorepo-Struktur

```txt
CNT/
├── apps/ (Company-OS, Connect, Hyper, Analysis, Spark, Flux)   # lokal, nicht in company-os Git
├── packages/
│   ├── ui/src/components/shadcn/{elements, editable, studio}   # @cnt/ui
│   └── types/                                                  # @cnt/types
├── rules/ (tech-stack, aufbau, vermeiden, ui-components, fonts, video-production, code-formatting)
└── package.json, pnpm-workspace.yaml, tsconfig.base.json, Claude.md
```

## 2. Komponenten, RSC & Daten

- **Modular & getrennt:** Kleine `.tsx`-UI-Komponenten; Geschäftslogik/APIs in `.ts`-Dateien oder Custom Hooks. Shared UI → `packages/ui`, App-UI → `apps/<App>/src/components/ui`, Shared Types → `packages/types`.
- **Colocation & flache Abstraktionen:** Feature-nah organisieren statt striktem MVC (UI, Tailwind-Styles & Feature-Logik nah beieinander; DB-Zugriffe bleiben sauber im DAL). Reine Datenstrukturen + zustandslose Funktionen statt tiefer OOP-Klassen-Hierarchien (max. 1 Abstraktionsebene).
- **RSC-First (Next.js App Router):** Standardmäßig Server Components (`async/await` auf Server). `"use client"` nur tief in kleinen interaktiven Inseln (`useState`, Events, `Editable`).
- **Boundaries:** Client Components importieren nie Server Components direkt – immer als `children` oder Prop übergeben.
- **Streaming & PPR:** Langsame/dynamische Server Components (`cookies()`, `headers()`, Nutzer-/Live-Daten) in `<Suspense fallback={...}>` kapseln, nie oben im statischen Layout – Hülle lädt sofort, Dynamik streamt nach.
- **Externe SDKs/APIs:** Schwach getypte Drittanbieter-SDKs einmalig hinter typsicheren Wrappern kapseln; externe JSON-Payloads mit **Zod** validieren.
- **Kein Config Hell:** Tools mit guten Defaults; Configs wo möglich in `package.json`; Root schlank halten.

## 3. Layout & CSS

- **Elternelement steuert Abstände:** Flexbox/Grid + `gap` am Parent (keine Außenabstände an Kindern).
- **`padding` statt `margin`:** Vermeidet Margin-Collapse; bei ungleichen Abständen Wrapper-/Spacer-Elemente nutzen.
- **Natives HTML zuerst:** Z. B. `<details>`/`<summary>` statt JS.

## 4. Security & Data Access Layer (DAL)

- **Drizzle + Präfixe:** Schemas in TS mit `tableCreator` (`connect_`, `hyper_`, `analysis_`, `spark_`, `flux_`).
- **Typ-Inferenz & Request-Deduplication:** Keine manuellen Doppel-Typen für DB/Schemas schreiben – immer direkt aus **Drizzle** (`$inferSelect`/`$inferInsert`) und **Zod** (`z.infer`) ableiten. Wiederholt aufgerufene DAL-Leseabfragen mit React `cache()` wrappen, um doppelte DB-Queries im selben Request zu vermeiden.
- **Zentraler DAL (`src/data/`):** Oben `import "server-only";` (bricht Build bei Client-Import).
- **Nur DTOs:** Nie `SELECT *` oder rohe DB-Objekte an Clients geben – nur explizit erlaubte Felder.
- **Auth überall im DAL:** Cookies/Rechte bei jedem Datenzugriff prüfen, nicht nur auf Seiten-Ebene.
- **Server Actions (`"use server"`):** Secrets erst in der Action laden, IDs via `.bind()`, Inputs mit **Zod** (bei vielen geschützten Actions mit `next-safe-action`) prüfen und nach Mutationen direkt `revalidatePath()`/`revalidateTag()` aufrufen (statt extra `router.refresh()`). Keine Mutationen beim RSC-Rendern.
- **Region & Compute:** Next.js Node.js-Compute und SQL-Datenbank (Neon/Supabase) immer in **derselben Region** (z. B. EU/Frankfurt `fra1`) platzieren. Edge/CDN nur für statische Assets, Redirects, Header & leichte Middleware _ohne_ DB-Roundtrips.

## 5. GitHub-Repo-Aufteilung

- **`stefankunc/company-os` (privat):** `Claude.md`, `rules/`, `packages/ui`, `packages/types`, Submodules (`elements/`, `studio/`), Root-Configs.
- **App-Repos (je privat):** `apps/` bleibt in `.gitignore`; jede App bekommt ihr eigenes privates Repo, sobald dort Code entsteht. Lokal trotzdem voll über `pnpm-workspace.yaml` verbunden.
