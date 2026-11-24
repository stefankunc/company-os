import { defineRule } from "@oxlint/plugins";

const SPARKLE_NAME = /sparkle/iu;
const MESSAGE =
  "Kein generisches Sparkles-Icon (AI-Slop). Wähle ein konkretes Aktions-Icon aus lucide-react.";

export default defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Verbietet Sparkles-Icons aus lucide-react.",
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value !== "lucide-react" && node.source.value !== "lucide") {
          return;
        }
        for (const specifier of node.specifiers) {
          if (specifier.type !== "ImportSpecifier") continue;
          const imported =
            specifier.imported.type === "Identifier"
              ? specifier.imported.name
              : specifier.imported.value;
          if (SPARKLE_NAME.test(imported)) {
            context.report({ node: specifier, message: MESSAGE });
          }
        }
      },
    };
  },
});
