import { defineRule } from "@oxlint/plugins";

const TEST_ROOTS = new Set(["it", "test", "describe"]);
const BANNED_PROPS = new Set(["skip", "only"]);

export default defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Verbietet it.skip/test.skip/describe.skip und .only (keine geschummelten Tests).",
    },
  },
  create(context) {
    return {
      MemberExpression(node) {
        if (
          node.computed ||
          node.object.type !== "Identifier" ||
          !TEST_ROOTS.has(node.object.name) ||
          node.property.type !== "Identifier" ||
          !BANNED_PROPS.has(node.property.name)
        ) {
          return;
        }
        context.report({
          node,
          message: `Verboten: ${node.object.name}.${node.property.name}. Tests niemals auskommentieren/skippen — immer den Code fixen.`,
        });
      },
    };
  },
});
