---
name: next-rsc-audit
description: Prüft Next.js App-Router-Code auf RSC-Boundaries, DAL-Security, Server-Action-Validierung und React-Anti-Patterns (useEffect-Slop, Wasserfälle). Nutzen vor Commits oder bei neuen Next.js-Features/Routen.
---

# Next.js RSC & DAL Audit

Prüfe die betroffenen Dateien kurz und gezielt gegen diese 6 Guardrails (nur echte Verstöße melden, `Datei:Zeile — Problem → Fix`):

1. **RSC-First & `"use client"`-Inseln:**
   - Keine pauschalen `"use client"`-Direktiven auf ganzen Seiten oder Layouts.
   - Client Components importieren niemals Server Components direkt (immer als `children` oder Prop übergeben).
   - Dynamische Server Components (`cookies()`, `headers()`, Live-DB) in `<Suspense fallback={...}>` kapseln; Request-APIs immer mit `await` aufrufen.
2. **DAL & Auth (`src/data/`):**
   - Oben `import "server-only";` vorhanden.
   - Auth/Rechte direkt im DAL prüfen (nie nur in Middleware oder Layout/Page); `userId`/`orgId` aus der Server-Session beziehen (kein IDOR).
   - Nur explizite DTOs zurückgeben — kein `SELECT *`, keine rohen DB-Objekte an Clients.
3. **Server Actions (`"use server"`):**
   - Jeder Export ist öffentlich: Auth/Rechte + **Zod**-Input-Validierung zwingend; keine internen Helper aus `"use server"`-Dateien exportieren.
   - Nach Mutationen direkt `revalidatePath()`/`revalidateTag()` aufrufen. Keine Mutationen beim RSC-Rendern.
4. **Keine Daten-Wasserfälle:**
   - Unabhängige DB-Abfragen mit `Promise.all()` parallelisieren (API-Calls an mehrere Drittdienste mit `Promise.allSettled()`).
   - Wiederholte DAL-Reads im selben Request mit React `cache()` deduplizieren.
5. **Kein `useEffect`-Slop:**
   - Kein Data-Fetching und keine Mutationen/Nutzer-Aktionen in `useEffect` (Fetching via RSC oder `@tanstack/react-query`; Mutationen direkt in Event-Handlern `onClick`/`onSubmit`).
   - Abgeleitete Werte direkt im Render berechnen (kein extra `useState` + `useEffect`).
6. **Env, Caching & Hydration:**
   - Kein rohes `process.env.KEY!` (zentral aus `src/env.ts` via Zod).
   - Kein nicht-deterministisches `new Date()`/`Math.random()`/`window` im SSR-Render.
   - `"use cache"` + `cacheLife()`/`cacheTag()` statt `unstable_cache` (nie `cookies()`/`headers()` darin lesen).
