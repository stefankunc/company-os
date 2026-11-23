# Code-Formatierung

## Regel

Nutze **Prettier**, um neu geschriebenen oder geänderten Code automatisch zu formatieren.

- Formatiere nach jeder wesentlichen Codeänderung.
- Verwende die im Projekt vorhandene Prettier-Konfiguration.
- Wenn keine Konfiguration existiert, erstelle eine konsistente Standardkonfiguration.
- Formatiere TypeScript, JavaScript, TSX, JSX, JSON, CSS, HTML und Markdown.
- Ändere keine Funktionalität beim Formatieren.
- Führe nach dem Formatieren gegebenenfalls Linting und Build-Checks aus.

## Befehle

### 1. Dateien formatieren und direkt speichern

Ganzes Projekt formatieren:

```bash
prettier --write .
```

Einzelne Datei formatieren:

```bash
prettier --write dateiname.ts
```

Bestimmten Ordner oder Dateitypen formatieren:

```bash
prettier --write "src/**/*.{js,ts,jsx,tsx,json,css,md}"
```

### 2. Nur prüfen, ohne Änderungen zu schreiben

Prüfen, ob Dateien formatiert werden müssen:

```bash
prettier --check .
```

- Exit-Code `0`: Alles ist korrekt formatiert.
- Exit-Code `1`: Mindestens eine Datei muss formatiert werden.

### 3. Projekt-spezifische Version verwenden

Falls ein Agent im Projektordner die dort definierte Prettier-Version erzwingen soll:

```bash
npx prettier --write .
```

## Prettier-Dokumentation

https://prettier.io/docs/install
