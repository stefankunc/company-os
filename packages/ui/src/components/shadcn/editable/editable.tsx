"use client";

import * as React from "react";
import {
  Editable as ArkEditable,
  type EditableRootProviderProps,
  useEditable,
  useEditableContext,
} from "@ark-ui/react/editable";
import { cn } from "../../../lib/utils";
import { buttonVariants } from "../../ui/button";

// 1. Editable (Root)
export interface EditableProps extends React.ComponentPropsWithoutRef<typeof ArkEditable.Root> {
  orientation?: "horizontal" | "vertical";
}

export const Editable = React.forwardRef<React.ElementRef<typeof ArkEditable.Root>, EditableProps>(
  ({ className, orientation = "horizontal", selectOnFocus = false, ...props }, ref) => {
    return (
      <ArkEditable.Root
        ref={ref}
        data-slot="editable"
        data-orientation={orientation}
        selectOnFocus={selectOnFocus}
        className={cn(
          "group/editable text-foreground relative flex w-full flex-col gap-1.5",
          orientation === "vertical" && "data-[orientation=vertical]:items-start",
          className
        )}
        {...props}
      />
    );
  }
);
Editable.displayName = "Editable";

// 2. EditableLabel
export const EditableLabel = React.forwardRef<
  React.ElementRef<typeof ArkEditable.Label>,
  React.ComponentPropsWithoutRef<typeof ArkEditable.Label>
>(({ className, ...props }, ref) => {
  return (
    <ArkEditable.Label
      ref={ref}
      data-slot="editable-label"
      className={cn(
        "text-foreground text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
});
EditableLabel.displayName = "EditableLabel";

// 3. EditableHeading (for inline editable headings like h1, h2, h3)
export interface EditableHeadingProps extends React.ComponentPropsWithoutRef<
  typeof ArkEditable.Preview
> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const EditableHeading = React.forwardRef<
  React.ElementRef<typeof ArkEditable.Preview>,
  EditableHeadingProps
>(({ className, level = 2, ...props }, ref) => {
  const headingSizes = {
    1: "text-3xl font-extrabold tracking-tight lg:text-4xl",
    2: "text-2xl font-semibold tracking-tight",
    3: "text-xl font-semibold tracking-tight",
    4: "text-lg font-semibold tracking-tight",
    5: "text-base font-semibold",
    6: "text-sm font-semibold",
  };

  return (
    <ArkEditable.Preview
      ref={ref}
      data-slot="editable-heading"
      className={cn(
        "text-foreground flex cursor-text items-center overflow-hidden transition-colors outline-none",
        headingSizes[level],
        className
      )}
      {...props}
    />
  );
});
EditableHeading.displayName = "EditableHeading";

// 4. EditableArea
export const EditableArea = React.forwardRef<
  React.ElementRef<typeof ArkEditable.Area>,
  React.ComponentPropsWithoutRef<typeof ArkEditable.Area>
>(({ className, style, ...props }, ref) => {
  return (
    <ArkEditable.Area
      ref={ref}
      data-slot="editable-area"
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        ...style,
      }}
      className={cn("relative min-h-9 w-full max-w-full min-w-0", className)}
      {...props}
    />
  );
});
EditableArea.displayName = "EditableArea";

// Common input/preview styling
const editableFieldShell =
  "box-border w-full min-w-0 rounded-md border px-3 py-1 text-base sm:text-sm";
const editableSingleLineHeight = "min-h-9 data-autoresize:h-auto data-autoresize:min-h-20";

// 5. EditableInput
export const EditableInput = React.forwardRef<
  React.ElementRef<typeof ArkEditable.Input>,
  React.ComponentPropsWithoutRef<typeof ArkEditable.Input>
>(({ className, ...props }, ref) => {
  return (
    <ArkEditable.Input
      ref={ref}
      data-slot="editable-input"
      className={cn(
        editableFieldShell,
        "border-input text-foreground ring-ring/20 placeholder:text-muted-foreground focus-visible:border-ring bg-transparent transition-[border-color,box-shadow] duration-150 outline-none focus-visible:ring-2",
        editableSingleLineHeight,
        "data-autoresize:field-sizing-content data-autoresize:resize-none data-autoresize:break-words",
        className
      )}
      {...props}
    />
  );
});
EditableInput.displayName = "EditableInput";

// 6. EditablePreview
export const EditablePreview = React.forwardRef<
  React.ElementRef<typeof ArkEditable.Preview>,
  React.ComponentPropsWithoutRef<typeof ArkEditable.Preview>
>(({ className, ...props }, ref) => {
  return (
    <ArkEditable.Preview
      ref={ref}
      data-slot="editable-preview"
      className={cn(
        editableFieldShell,
        "text-foreground hover:bg-muted/50 focus-visible:border-ring flex cursor-text items-center overflow-hidden border-transparent transition-[border-color,box-shadow] duration-150 outline-none focus-visible:ring-2",
        editableSingleLineHeight,
        "truncate whitespace-nowrap",
        "data-placeholder-shown:text-muted-foreground",
        "data-autoresize:items-start data-autoresize:justify-start data-autoresize:overflow-visible data-autoresize:break-words data-autoresize:whitespace-pre-wrap",
        className
      )}
      {...props}
    />
  );
});
EditablePreview.displayName = "EditablePreview";

// 7. EditableControl
export const EditableControl = React.forwardRef<
  React.ElementRef<typeof ArkEditable.Control>,
  React.ComponentPropsWithoutRef<typeof ArkEditable.Control>
>(({ className, ...props }, ref) => {
  return (
    <ArkEditable.Control
      ref={ref}
      data-slot="editable-control"
      className={cn("flex flex-wrap items-center gap-2 pt-1", className)}
      {...props}
    />
  );
});
EditableControl.displayName = "EditableControl";

// 8. EditableEditTrigger
export const EditableEditTrigger = React.forwardRef<
  React.ElementRef<typeof ArkEditable.EditTrigger>,
  React.ComponentPropsWithoutRef<typeof ArkEditable.EditTrigger>
>(({ className, ...props }, ref) => {
  return (
    <ArkEditable.EditTrigger
      ref={ref}
      data-slot="editable-edit-trigger"
      className={cn(
        typeof buttonVariants === "function"
          ? buttonVariants({ size: "sm", variant: "secondary" })
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium",
        className
      )}
      {...props}
    />
  );
});
EditableEditTrigger.displayName = "EditableEditTrigger";

// 9. EditableSubmitTrigger
export const EditableSubmitTrigger = React.forwardRef<
  React.ElementRef<typeof ArkEditable.SubmitTrigger>,
  React.ComponentPropsWithoutRef<typeof ArkEditable.SubmitTrigger>
>(({ className, ...props }, ref) => {
  return (
    <ArkEditable.SubmitTrigger
      ref={ref}
      data-slot="editable-submit-trigger"
      className={cn(
        typeof buttonVariants === "function"
          ? buttonVariants({ size: "sm", variant: "default" })
          : "bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium",
        className
      )}
      {...props}
    />
  );
});
EditableSubmitTrigger.displayName = "EditableSubmitTrigger";

// 10. EditableCancelTrigger
export const EditableCancelTrigger = React.forwardRef<
  React.ElementRef<typeof ArkEditable.CancelTrigger>,
  React.ComponentPropsWithoutRef<typeof ArkEditable.CancelTrigger>
>(({ className, ...props }, ref) => {
  return (
    <ArkEditable.CancelTrigger
      ref={ref}
      data-slot="editable-cancel-trigger"
      className={cn(
        typeof buttonVariants === "function"
          ? buttonVariants({ size: "sm", variant: "outline" })
          : "border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-8 items-center justify-center rounded-md border px-3 text-sm font-medium",
        className
      )}
      {...props}
    />
  );
});
EditableCancelTrigger.displayName = "EditableCancelTrigger";

// Context & Provider exports
export const EditableContext = ArkEditable.Context;
export const EditableRootProvider = ArkEditable.RootProvider;

export { useEditable, useEditableContext };
export type { EditableEditChangeDetails, EditableValueChangeDetails } from "@ark-ui/react/editable";
