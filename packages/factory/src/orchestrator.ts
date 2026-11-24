import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { extractJsonBlock, runAgentCli } from "./agents.ts";
import { runCouncilReview } from "./council.ts";
import { runVerificationGates } from "./gates.ts";
import {
  prdDocumentSchema,
  type AgentProvider,
  type PrdDocument,
  type PrdTask,
  type ProgressEntry,
} from "./schema.ts";
import { readSpecFile } from "./spec-reader.ts";
import { runVisualHillClimbRound } from "./visual-climb.ts";
import {
  commitWorktreeChanges,
  createTaskWorktree,
  getWorktreeDiff,
  mergeTaskBranch,
  removeTaskWorktree,
} from "./worktree.ts";

function getFactoryPaths(projectDir: string) {
  const factoryDir = path.join(projectDir, "factory");
  return {
    factoryDir,
    prdPath: path.join(factoryDir, "prd.json"),
    progressPath: path.join(factoryDir, "progress.jsonl"),
  };
}

async function appendProgress(projectDir: string, entry: Omit<ProgressEntry, "timestamp">) {
  const { factoryDir, progressPath } = getFactoryPaths(projectDir);
  await mkdir(factoryDir, { recursive: true });
  const record: ProgressEntry = {
    timestamp: new Date().toISOString(),
    ...entry,
  };
  await appendFile(progressPath, `${JSON.stringify(record)}\n`, "utf8");
}

async function savePrd(projectDir: string, prd: PrdDocument): Promise<void> {
  const { factoryDir, prdPath } = getFactoryPaths(projectDir);
  await mkdir(factoryDir, { recursive: true });
  prd.updatedAt = new Date().toISOString();
  await writeFile(prdPath, `${JSON.stringify(prd, null, 2)}\n`, "utf8");
}

export async function loadPrd(projectDir: string): Promise<PrdDocument> {
  const { prdPath } = getFactoryPaths(projectDir);
  const raw = await readFile(prdPath, "utf8");
  return prdDocumentSchema.parse(JSON.parse(raw));
}

export async function initProjectFromSpec(params: {
  specPath: string;
  projectDir: string;
  projectName?: string;
  builderAgent: AgentProvider;
  reviewerAgents: AgentProvider[];
  visionAgent: AgentProvider;
  maxHours: number;
  baseBranch: string;
}): Promise<PrdDocument> {
  const specText = await readSpecFile(params.specPath);
  const projectName = params.projectName ?? path.basename(path.resolve(params.projectDir));

  const architectPrompt = [
    "Du bist ein Principal Systems Architect. Zerlege die folgende Produktspezifikation in einen echten, mehrtägigen Produktions-Plan (15 bis 40 atomare, sequenziell baubare Tasks).",
    "Regeln für die Zerlegung:",
    "1. Starte mit Phase 'architecture' (Monorepo/Projekt-Fundament, striktes TS, Linter, Env-Schema).",
    "2. Dann 'database' (Drizzle/Postgres Schemas, UUID v7, FK-Indizes, Timestamps/Status statt Booleans).",
    "3. Dann 'backend' (DAL mit server-only, Auth, Zod-Validierung, echte APIs & Unit-Tests).",
    "4. Dann 'ui-variants' (5-Routen-Design-Exploration oder Core-Screens mit echten Komponenten) + mehrere 'ui-polish'-Tasks mit uiRoutes für Visual Hill-Climbing.",
    "5. Zum Schluss 'e2e' (Playwright End-to-End-Tests) und 'security' (Audit).",
    "Jeder Task muss klein genug für einen einzelnen, fokussierten PR sein und glasklare acceptanceCriteria sowie verifyCommands haben.",
    "",
    "SPEZIFIKATION:",
    specText.slice(0, 80_000),
    "",
    'Antworte AUSSCHLIESSLICH mit validem JSON für ein Array von Tasks im Wrapper {"tasks": [...]}.',
    'Jeder Task hat: {"id":"kebab-case","title":"...","phase":"architecture"|"database"|"backend"|"ui-variants"|"ui-polish"|"e2e"|"security","description":"...","dependencies":["..."],"acceptanceCriteria":["..."],"verifyCommands":["pnpm verify"],"uiRoutes":["/"]}',
  ].join("\n");

  const result = await runAgentCli({
    provider: params.builderAgent,
    cwd: params.projectDir,
    prompt: architectPrompt,
    readOnly: true,
    timeoutMs: 15 * 60 * 1000,
  });

  const rawJson = extractJsonBlock(result.stdout) as { tasks?: unknown };
  const now = new Date().toISOString();
  const prd = prdDocumentSchema.parse({
    version: 1,
    projectName,
    specFile: path.resolve(params.specPath),
    baseBranch: params.baseBranch,
    createdAt: now,
    updatedAt: now,
    builderAgent: params.builderAgent,
    reviewerAgents: params.reviewerAgents,
    visionAgent: params.visionAgent,
    maxHours: params.maxHours,
    tasks: rawJson.tasks,
  });

  await savePrd(params.projectDir, prd);
  await appendProgress(params.projectDir, {
    taskId: null,
    event: "prd_initialized",
    agent: params.builderAgent,
    details: `Generated ${prd.tasks.length} tasks from ${path.basename(params.specPath)}`,
  });

  return prd;
}

function pickNextTask(prd: PrdDocument): PrdTask | null {
  const completedIds = new Set(prd.tasks.filter((t) => t.status === "completed").map((t) => t.id));
  for (const task of prd.tasks) {
    if (task.status !== "pending" && task.status !== "in_progress") continue;
    if (task.attempts >= prd.maxTaskAttempts) continue;
    const depsMet = task.dependencies.every((dep) => completedIds.has(dep));
    if (depsMet) return task;
  }
  return null;
}

function buildTaskPrompt(task: PrdTask, feedback: string | null): string {
  const sections = [
    "Lies zuerst AGENTS.md und relevante rules/*.md im Projekt. Arbeite strikt im aktuellen Git-Worktree.",
    "Baue KEINEN 5-Minuten-Prototyp und KEINE Stubs — liefere echte, vollständige Produktionsqualität.",
    "",
    `TASK [${task.id}] (${task.phase}): ${task.title}`,
    `BESCHREIBUNG:\n${task.description}`,
    `ACCEPTANCE CRITERIA:\n${task.acceptanceCriteria.map((c) => `- ${c}`).join("\n")}`,
    `VERIFIKATION (muss am Ende 100% grün sein):\n${task.verifyCommands.map((c) => `- ${c}`).join("\n")}`,
  ];

  if (feedback) {
    sections.push(
      "",
      "FEEDBACK AUS VORHERIGEM CHECK / COUNCIL / VISUAL REVIEW (ZWINGEND BEHEBEN):",
      feedback
    );
  }

  return sections.join("\n");
}

export async function runFactoryLoop(params: {
  projectDir: string;
  maxHoursOverride?: number;
  dryRun?: boolean;
}): Promise<PrdDocument> {
  const prd = await loadPrd(params.projectDir);
  const maxHours = params.maxHoursOverride ?? prd.maxHours;
  const deadline = Date.now() + maxHours * 60 * 60 * 1000;

  while (Date.now() < deadline) {
    const task = pickNextTask(prd);
    if (!task) {
      await appendProgress(params.projectDir, {
        taskId: null,
        event: "factory_finished",
        agent: null,
        details: "No further runnable tasks remaining.",
      });
      break;
    }

    if (params.dryRun) {
      console.log(`[DRY-RUN] Next task: ${task.id} (${task.phase}) — ${task.title}`);
      break;
    }

    task.status = "in_progress";
    task.attempts += 1;
    task.startedAt = task.startedAt ?? new Date().toISOString();
    task.lastError = null;
    await savePrd(params.projectDir, prd);
    await appendProgress(params.projectDir, {
      taskId: task.id,
      event: "task_started",
      agent: prd.builderAgent,
      details: `Attempt ${task.attempts}/${prd.maxTaskAttempts}`,
    });

    const handle = await createTaskWorktree(params.projectDir, prd.baseBranch, task.id);
    let feedback: string | null = null;
    let taskPassed = false;

    try {
      for (let round = 1; round <= prd.maxReviewRounds; round++) {
        const buildRes = await runAgentCli({
          provider: prd.builderAgent,
          cwd: handle.worktreePath,
          prompt: buildTaskPrompt(task, feedback),
        });

        if (buildRes.exitCode !== 0) {
          feedback = `Builder exited with ${buildRes.exitCode}:\n${buildRes.stderr.slice(-2000)}`;
          continue;
        }

        const gateRes = await runVerificationGates(handle.worktreePath, task.verifyCommands);
        if (!gateRes.passed) {
          const failed = gateRes.results.find((r) => !r.ok);
          feedback = `Quality gate failed (${failed?.command ?? "unknown"}):\n${failed?.output ?? ""}`;
          await appendProgress(params.projectDir, {
            taskId: task.id,
            event: "gate_failed",
            agent: prd.builderAgent,
            details: failed?.command ?? "verify",
          });
          continue;
        }

        const reviewer = prd.reviewerAgents[(round - 1) % prd.reviewerAgents.length] ?? "codex";
        const diff = await getWorktreeDiff(handle.worktreePath, prd.baseBranch);
        task.status = "reviewing";
        await savePrd(params.projectDir, prd);

        const verdict = await runCouncilReview({
          reviewer,
          worktreePath: handle.worktreePath,
          task,
          diff,
        });

        await appendProgress(params.projectDir, {
          taskId: task.id,
          event: "council_review",
          agent: reviewer,
          details: `${verdict.verdict} (score ${verdict.score}/10, ${verdict.findings.length} findings)`,
        });

        if (verdict.verdict !== "approve") {
          feedback = [
            `Council (${reviewer}) requested changes (Score ${verdict.score}/10): ${verdict.summary}`,
            ...verdict.findings.map((f) => `- [${f.severity}] ${f.file}: ${f.issue} → ${f.fix}`),
          ].join("\n");
          continue;
        }

        if (task.uiRoutes.length > 0) {
          const visual = await runVisualHillClimbRound({
            worktreePath: handle.worktreePath,
            projectDir: params.projectDir,
            task,
            round,
            visionAgent: prd.visionAgent,
            minScore: prd.minVisualScore,
          });
          await appendProgress(params.projectDir, {
            taskId: task.id,
            event: "visual_review",
            agent: prd.visionAgent,
            details: `score ${visual.score}/10 (${visual.passed ? "passed" : "needs polish"})`,
          });
          if (!visual.passed) {
            feedback = [
              `Visual Hill-Climb Round ${round} failed (${visual.score}/10 < ${prd.minVisualScore}): ${visual.summary}`,
              ...visual.issues.map((i) => `- Issue: ${i}`),
              ...visual.nextActions.map((a) => `- Fix: ${a}`),
            ].join("\n");
            continue;
          }
        }

        taskPassed = true;
        break;
      }

      if (taskPassed) {
        const sha = await commitWorktreeChanges(
          handle.worktreePath,
          `feat(${task.phase}): ${task.title} [${task.id}]`
        );
        await mergeTaskBranch(params.projectDir, prd.baseBranch, handle.branchName);
        task.status = "completed";
        task.completedAt = new Date().toISOString();
        task.commitSha = sha;
        await savePrd(params.projectDir, prd);
        await appendProgress(params.projectDir, {
          taskId: task.id,
          event: "task_completed",
          agent: prd.builderAgent,
          details: `Merged ${handle.branchName} (${sha ?? "no-diff"})`,
        });
      } else {
        task.status = task.attempts >= prd.maxTaskAttempts ? "blocked" : "pending";
        task.lastError = feedback ?? "Exceeded review/verification rounds.";
        await savePrd(params.projectDir, prd);
        await appendProgress(params.projectDir, {
          taskId: task.id,
          event: "task_failed_round",
          agent: prd.builderAgent,
          details: task.lastError.slice(0, 300),
        });
      }
    } catch (error) {
      task.status = task.attempts >= prd.maxTaskAttempts ? "blocked" : "pending";
      task.lastError = error instanceof Error ? error.message : String(error);
      await savePrd(params.projectDir, prd);
      await appendProgress(params.projectDir, {
        taskId: task.id,
        event: "task_error",
        agent: null,
        details: task.lastError.slice(0, 300),
      });
    } finally {
      await removeTaskWorktree(params.projectDir, handle);
    }
  }

  return prd;
}
