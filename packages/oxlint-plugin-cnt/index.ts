import { definePlugin } from "@oxlint/plugins";
import noManualMemo from "./rules/no-manual-memo.ts";
import noRawProcessEnv from "./rules/no-raw-process-env.ts";
import noSparklesIcon from "./rules/no-sparkles-icon.ts";
import noStubSlop from "./rules/no-stub-slop.ts";
import noTestSkipOrOnly from "./rules/no-test-skip-or-only.ts";
import requireUiPrimitives from "./rules/require-ui-primitives.ts";

export default definePlugin({
  meta: {
    name: "cnt",
  },
  rules: {
    "no-sparkles-icon": noSparklesIcon,
    "no-manual-memo": noManualMemo,
    "no-test-skip-or-only": noTestSkipOrOnly,
    "no-raw-process-env": noRawProcessEnv,
    "no-stub-slop": noStubSlop,
    "require-ui-primitives": requireUiPrimitives,
  },
});
