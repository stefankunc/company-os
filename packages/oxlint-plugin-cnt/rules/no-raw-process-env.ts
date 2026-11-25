import { defineRule } from "@oxlint/plugins";

const ALLOWED_PATH =
  /(?:^|[\\/])(?:env\.ts|next\.config\.|vite\.config\.|scripts[\\/]|packages[\\/]factory[\\/])/u;

export default defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Verbietet rohen process.env-Zugriff außerhalb von src/env.ts.",
    },
  },
  create(context) {
    if (ALLOWED_PATH.test(context.filename)) {
      return {};
    }
    return {
      MemberExpression(node) {
        if (
          node.object.type === "MemberExpression" &&
          !node.object.computed &&
          node.object.object.type === "Identifier" &&
          node.object.object.name === "process" &&
          node.object.property.type === "Identifier" &&
          node.object.property.name === "env"
        ) {
          context.report({
            node,
            message:
              "Kein rohes process.env.* quer im Code — Umgebungsvariablen zentral über src/env.ts (Zod) laden.",
          });
        }
      },
    };
  },
});
