import path from "node:path";
import { detectInstalledTools } from "./agents.ts";
import { initProjectFromSpec, loadPrd, runFactoryLoop } from "./orchestrator.ts";
import { AGENT_PROVIDERS, type AgentProvider } from "./schema.ts";

function parseArgs(argv: string[]): { command: string; flags: Record<string, string | boolean> } {
  const cleaned = argv[0] === "--" ? argv.slice(1) : argv;
  const command = cleaned[0] ?? "help";
  const flags: Record<string, string | boolean> = {};

  for (let i = 1; i < cleaned.length; i++) {
    const token = cleaned[i];
    if (!token || !token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = cleaned[i + 1];
    if (next && !next.startsWith("--")) {
      flags[key] = next;
      i += 1;
    } else {
      flags[key] = true;
    }
  }
  return { command, flags };
}

function asProvider(value: string | boolean | undefined, fallback: AgentProvider): AgentProvider {
  if (typeof value === "string" && (AGENT_PROVIDERS as readonly string[]).includes(value)) {
    return value as AgentProvider;
  }
  return fallback;
}

function printHelp() {
  console.log(`CNT Autonomous Factory CLI

Commands:
  doctor                                  Check installed agent CLIs & runtime tools
  init --spec <file.pdf|md> --project <dir> [--builder claude] [--reviewers codex,gemini] [--vision gemini] [--max-hours 72] [--base-branch main]
  run --project <dir> [--max-hours 72] [--dry-run]
  status --project <dir>                  Print current PRD progress`);
}

async function main() {
  const { command, flags } = parseArgs(process.argv.slice(2));

  if (command === "doctor") {
    const tools = await detectInstalledTools();
    console.log("CNT Factory Environment Check:");
    for (const [tool, ok] of Object.entries(tools)) {
      console.log(`  ${ok ? "[OK]" : "[MISSING]"} ${tool}`);
    }
    return;
  }

  if (command === "init") {
    const spec = typeof flags.spec === "string" ? flags.spec : null;
    const project = typeof flags.project === "string" ? flags.project : null;
    if (!spec || !project) {
      throw new Error("init requires --spec <file.pdf|md> and --project <dir>");
    }
    const builderAgent = asProvider(flags.builder, "claude");
    const visionAgent = asProvider(flags.vision, "gemini");
    const reviewerAgents =
      typeof flags.reviewers === "string"
        ? flags.reviewers
            .split(",")
            .map((r) => asProvider(r.trim(), "codex"))
            .filter((r) => r !== builderAgent)
        : (["codex", "gemini"] as AgentProvider[]).filter((r) => r !== builderAgent);
    const maxHours = typeof flags["max-hours"] === "string" ? Number(flags["max-hours"]) : 72;
    const baseBranch = typeof flags["base-branch"] === "string" ? flags["base-branch"] : "main";

    const prd = await initProjectFromSpec({
      specPath: spec,
      projectDir: path.resolve(project),
      builderAgent,
      reviewerAgents: reviewerAgents.length > 0 ? reviewerAgents : ["codex"],
      visionAgent,
      maxHours,
      baseBranch,
    });
    console.log(
      `Initialized ${prd.tasks.length} tasks in ${path.join(project, "factory", "prd.json")}`
    );
    return;
  }

  if (command === "run") {
    const project = typeof flags.project === "string" ? flags.project : null;
    if (!project) {
      throw new Error("run requires --project <dir>");
    }
    const maxHoursOverride =
      typeof flags["max-hours"] === "string" ? Number(flags["max-hours"]) : undefined;
    const prd = await runFactoryLoop({
      projectDir: path.resolve(project),
      maxHoursOverride,
      dryRun: flags["dry-run"] === true,
    });
    const done = prd.tasks.filter((t) => t.status === "completed").length;
    console.log(`Factory run ended: ${done}/${prd.tasks.length} tasks completed.`);
    return;
  }

  if (command === "status") {
    const project = typeof flags.project === "string" ? flags.project : null;
    if (!project) {
      throw new Error("status requires --project <dir>");
    }
    const prd = await loadPrd(path.resolve(project));
    const counts = {
      completed: prd.tasks.filter((t) => t.status === "completed").length,
      in_progress: prd.tasks.filter((t) => t.status === "in_progress" || t.status === "reviewing")
        .length,
      pending: prd.tasks.filter((t) => t.status === "pending").length,
      blocked: prd.tasks.filter((t) => t.status === "blocked").length,
    };
    console.log(
      `${prd.projectName}: ${counts.completed}/${prd.tasks.length} done | ${counts.in_progress} active | ${counts.pending} pending | ${counts.blocked} blocked`
    );
    for (const task of prd.tasks) {
      console.log(`  [${task.status.toUpperCase()}] ${task.id} (${task.phase}) — ${task.title}`);
    }
    return;
  }

  printHelp();
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
