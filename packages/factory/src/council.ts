import { extractJsonBlock, runAgentCli } from "./agents.ts";
import {
  councilVerdictSchema,
  type AgentProvider,
  type CouncilVerdict,
  type PrdTask,
} from "./schema.ts";

export async function runCouncilReview(params: {
  reviewer: AgentProvider;
  worktreePath: string;
  task: PrdTask;
  diff: string;
}): Promise<CouncilVerdict> {
  const prompt = [
    "Du bist ein gnadenloser Senior Staff Engineer im Cross-Model Council-Review.",
    "Keine Schmeichelei, keine Ausreden. Prüfe den folgenden Diff streng gegen:",
    "- Echte Bugs, Logikfehler, Race Conditions & fehlende Edge-Cases",
    "- Security (Auth im DAL, Zod-Input-Validierung, kein IDOR/XSS, kein rohes process.env)",
    "- Performance & Kostenfallen (N+1/Wasserfälle, fehlende Indizes, ungeschützte Loops)",
    "- Anti-Slop (keine Stubs, keine geschummelten Tests, keine generische KI-Optik)",
    "",
    `TASK: ${params.task.id} — ${params.task.title}`,
    `ACCEPTANCE CRITERIA:\n${params.task.acceptanceCriteria.map((c) => `- ${c}`).join("\n")}`,
    "",
    "GIT DIFF:",
    params.diff,
    "",
    "Antworte AUSSCHLIESSLICH mit validem JSON in genau diesem Schema (keine Prosa davor/danach):",
    '{"verdict":"approve"|"changes_requested","score":1-10,"summary":"...","findings":[{"severity":"critical"|"high"|"medium"|"low","file":"...","issue":"...","fix":"..."}]}',
    'Setze verdict="changes_requested", sobald mindestens ein "critical" oder "high" Finding existiert oder ein Acceptance Criterion fehlt.',
  ].join("\n");

  const result = await runAgentCli({
    provider: params.reviewer,
    cwd: params.worktreePath,
    prompt,
    readOnly: true,
    timeoutMs: 10 * 60 * 1000,
  });

  if (result.exitCode !== 0 && result.stdout.trim().length === 0) {
    throw new Error(`Council reviewer ${params.reviewer} failed: ${result.stderr.slice(-500)}`);
  }

  const parsedJson = extractJsonBlock(result.stdout);
  return councilVerdictSchema.parse(parsedJson);
}
