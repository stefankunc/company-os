# Vermeiden (No-Gos)

- **`npm` / `yarn`** → Immer `pnpm`.
- **`margin` für Layout-Abstände** → `gap` im Parent, `padding` oder Spacer (kein Margin-Collapse).
- **React `useEffect`-Endlosschleifen** → Dependency-Array sauber setzen, Effekte minimal halten.
- **`Promise.all()` für mehrere APIs/Börsen** → `Promise.allSettled()` (ein Ausfall darf nicht alles verwerfen).
- **JS für Standard-HTML** → Natives HTML (`<details>`/`<summary>`).
- **Ungetyptes JS / `any`** → Strikte TypeScript-Typen & feste Schemas.
- **HTMX + React-State mischen** → React/Next.js für Web-Apps; HTMX nur für einfache Server-/Astro-Seiten.
- **Monolithische Seiten-Komponenten** → Kleine Bausteine (`packages/ui` bzw. `apps/<App>/src/components/ui`).
- **Manuelles Formatieren** → Prettier (`pnpm format`).
- **Ganze Demo-Seiten/Repos kopieren** → Nur benötigte Komponente/Block (`rules/ui-components.md`).
- **Pauschales `"use client"` / `getServerSideProps`** → RSC-First; `"use client"` nur in kleinen Inseln.
- **Ungekapselte Fremd-SDKs / ungeprüftes JSON** → Typsichere Wrapper + **Zod**-Laufzeitvalidierung.
- **`SELECT *` / rohe DB-Objekte an Client** → DAL (`src/data/` + `import "server-only";`) + explizite DTOs.
- **Mutationen beim RSC-Rendern / Auth nur in Seite** → Mutationen nur in Server Actions (`"use server"` + Zod); Auth bei jedem DAL-Zugriff prüfen.
- **Rohe Third-Party-`<script>` / schwere Embeds (YouTube, Maps, GTM)** → `@next/third-parties` (Lite-Embeds / optimiertes GTM).
- **Manuelles Cloud-/DevOps-Setup (VPC, IAM, Kubernetes)** → Spezialisierte Managed-Dienste aus dem Tool Stack (`Vercel`, `Neon`/`Supabase`, `Clerk`, `UploadThing`).
- **Google Analytics (GA4) / ungeprüfte Pakete & Easter Eggs** → DSGVO-konform **Plausible** / **PostHog (EU)** nutzen; Dependencies via `pnpm-lock.yaml` pinnen und keine Easter Eggs in Produktion.
