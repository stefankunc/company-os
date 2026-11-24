# Code-Formatierung (Prettier)

- Nach jeder wesentlichen Änderung automatisch mit **Prettier** formatieren (TS, JS, TSX, JSX, JSON, CSS, HTML, MD) – Config liegt in `package.json`. Keine Funktionsänderungen beim Formatieren.
- **Befehle:**
  - Formatieren: `pnpm format` (oder `pnpm exec prettier --write <pfad>`)
  - Prüfen (Exit `0` = OK, `1` = unformatiert): `pnpm format:check`
- Danach bei Bedarf Typecheck (`pnpm typecheck`) & Build prüfen. Docs: https://prettier.io/docs/install
