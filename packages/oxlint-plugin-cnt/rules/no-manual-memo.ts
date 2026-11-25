import { defineRule, type ESTree } from "@oxlint/plugins";

const MANUAL_MEMO = new Set(["useMemo", "useCallback", "memo"]);

function getManualMemoName(callee: ESTree.Node): string | null {
  if (callee.type === "Identifier" && MANUAL_MEMO.has(callee.name)) {
    return callee.name;
  }
  if (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.object.type === "Identifier" &&
    callee.object.name === "React" &&
    callee.property.type === "Identifier" &&
    MANUAL_MEMO.has(callee.property.name)
  ) {
    return callee.property.name;
  }
  return null;
}

export default defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description: "Verbietet pauschales useMemo/useCallback/React.memo (React Compiler aktiv).",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const name = getManualMemoName(node.callee);
        if (name === null) return;
        context.report({
          node: node.callee,
          message: `Kein manuelles ${name}: React Compiler übernimmt Memoizing automatisch.`,
        });
      },
    };
  },
});
