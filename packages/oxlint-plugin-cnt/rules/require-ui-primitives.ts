import { defineRule } from "@oxlint/plugins";

const RAW_CONTROL_TAGS = new Set(["input", "select", "textarea"]);
const ALLOWED_UI_PATH =
  /(?:^|[\\/])(?:packages[\\/]ui|components[\\/]ui|components[\\/]shadcn)[\\/]/u;

export default defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Erzwingt echte shadcn/ui-Primitives (@cnt/ui bzw. @/components/ui) statt roher HTML-Form-Controls in App-Features.",
    },
  },
  create(context) {
    if (ALLOWED_UI_PATH.test(context.filename)) {
      return {};
    }
    return {
      JSXOpeningElement(node) {
        if (node.name.type !== "JSXIdentifier") return;
        const tag = node.name.name;
        if (!RAW_CONTROL_TAGS.has(tag)) return;
        context.report({
          node: node.name,
          message: `Kein rohes <${tag}> in App-Features — nutze die echte shadcn/ui-Komponente aus @cnt/ui bzw. @/components/ui.`,
        });
      },
    };
  },
});
