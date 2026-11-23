import * as React from "react";
import {
  Editable,
  EditableArea,
  EditableInput,
  EditablePreview,
  EditableEditTrigger,
  EditableSubmitTrigger,
  EditableCancelTrigger,
  EditableControl,
  EditableLabel,
  EditableHeading,
} from "./editable";

export function EditableDemo() {
  return (
    <div className="flex max-w-md flex-col gap-8 p-6">
      {/* 1. Einfache Inline-Bearbeitung */}
      <div>
        <Editable defaultValue="Klick mich zum Bearbeiten">
          <EditableLabel>Name</EditableLabel>
          <EditableArea>
            <EditablePreview />
            <EditableInput />
          </EditableArea>
        </Editable>
      </div>

      {/* 2. Mit Steuerelementen (Edit, Submit, Cancel Buttons) */}
      <div>
        <Editable defaultValue="Projekt-Titel">
          <EditableLabel>Titel mit Aktionen</EditableLabel>
          <EditableArea>
            <EditablePreview />
            <EditableInput />
          </EditableArea>
          <EditableControl>
            <EditableEditTrigger>Bearbeiten</EditableEditTrigger>
            <EditableSubmitTrigger>Speichern</EditableSubmitTrigger>
            <EditableCancelTrigger>Abbrechen</EditableCancelTrigger>
          </EditableControl>
        </Editable>
      </div>

      {/* 3. Überschrift (EditableHeading) */}
      <div>
        <Editable defaultValue="Große Überschrift">
          <EditableArea>
            <EditableHeading level={1} />
            <EditableInput />
          </EditableArea>
        </Editable>
      </div>
    </div>
  );
}
