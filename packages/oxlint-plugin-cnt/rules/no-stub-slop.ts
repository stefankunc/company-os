import { defineRule } from "@oxlint/plugins";

const STUB_PATTERN = /\b(?:not\s+implemented|todo:\s*implement|stub\s+implementation)\b/iu;

export default defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Verbietet Dummy-Stubs und Platzhalter-Errors statt echter Logik.",
    },
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value !== "string") return;
        if (STUB_PATTERN.test(node.value)) {
          context.report({
            node,
            message: "Kein Stub-Slop: Implementiere die echte Logik statt Platzhalter-Errors.",
          });
        }
      },
    };
  },
});
