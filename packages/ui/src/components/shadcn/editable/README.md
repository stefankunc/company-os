# ShadCN Editable Komponente (Ark UI)

Vollständige, produktionsreife React-Komponente für Inline-Textbearbeitung im shadcn/ui-Designsystem, basierend auf Ark UI Primitives (`@ark-ui/react`).

## Enthaltene Bausteine

- `Editable` (Root-Container)
- `EditableArea` (Layout-Bereich für Preview und Input)
- `EditableLabel` (Beschriftung)
- `EditableHeading` (Inline-bearbeitbare Überschrift)
- `EditablePreview` (Textanzeige im Lese-Modus)
- `EditableInput` (Eingabefeld im Bearbeiten-Modus)
- `EditableControl` (Container für Aktionsbuttons)
- `EditableEditTrigger` (Button zum Starten der Bearbeitung)
- `EditableSubmitTrigger` (Button zum Bestätigen/Speichern)
- `EditableCancelTrigger` (Button zum Abbrechen)
- `EditableContext` & `useEditable` (State-Hook)

## Voraussetzungen im Zielprojekt

```bash
npm install @ark-ui/react
```

Sowie die standardmäßigen shadcn-Hilfsdateien:

- `@/lib/utils` mit `cn()`
- `@/components/ui/button` (für Button-Stile)
