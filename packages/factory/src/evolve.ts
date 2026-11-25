import { appendFile, mkdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import { extractJsonBlock, runAgentCli } from "./agents.ts";
import { runVerificationGates } from "./gates.ts";
import type { AgentProvider } from "./schema.ts";
import { commitWorktreeChanges, createTaskWorktree, removeTaskWorktree } from "./worktree.ts";

interface EvalBenchmark {
  id: string;
  title: string;
  prompt: string;
}

const BENCHMARKS: readonly EvalBenchmark[] = [
  {
    id: "crypto-terminal",
    title: "Institutional Crypto Terminal (Candlesticks + Orderbook + Watchlist)",
    prompt:
      "Baue ein produktionsreifes Next.js App-Router Krypto-Terminal mit echten shadcn/ui-Komponenten (Button, Input, Tabs, Badge, Card, Table, ScrollArea, Tooltip — KEINE rohen HTML-Buttons/Inputs!), TradingView lightweight-charts (Candles + Area + EMA + Volume), Binance/Kraken Server-DAL mit Zod & Promise.allSettled, URL-State und Geist/Geist Mono.",
  },
  {
    id: "flux-product-table",
    title: "Flux Store Product Table (Filter, Bulk-Edit, Media & TOON Export)",
    prompt:
      "Baue eine Next.js App-Router Produkttabelle für Flux mit echten shadcn/ui-Komponenten (Table, Input, Select, Checkbox, Dialog, Sheet, Badge, Button), URL-State-Filtern (Zod), Bulk-Status-Actions, Inline-Editing und einem On-the-fly TOON-Encoder für LLM-Inputs.",
  },
  {
    id: "realtime-log-stream",
    title: "Wide-Events Telemetry & Log Explorer",
    prompt:
      "Baue einen Next.js App-Router Log-Explorer für strukturierte JSON Wide-Events mit echten shadcn/ui-Komponenten (Table, Tabs, Badge, Input, Sheet, Command/Search), Live-Filter nach Status/Latenz/UserId per URL-State, Detail-Drawer und P95/P99-Metrik-Karten.",
  },
  {
    id: "multi-step-workflow",
    title: "Multi-Step Checkout & Billing Configurator",
    prompt:
      "Baue einen Next.js App-Router Multi-Step-Wizard mit echten shadcn/ui-Komponenten (Card, Button, Input, RadioGroup, Checkbox, Progress, Alert), Zod-Validierung pro Schritt, Server Action mit Idempotenz-Simulation und fehlerfreier Tastatur-/a11y-Steuerung.",
  },
  {
    id: "agent-kanban",
    title: "Autonomous Task DAG & Review Board",
    prompt:
      "Baue ein Next.js App-Router Task-Board für KI-Agenten-Runs mit echten shadcn/ui-Komponenten (Tabs, Card, Badge, Button, Dialog, ScrollArea), Status-Spalten (pending, in_progress, reviewing, completed, blocked), Diff-Preview-Modal und Filterung per URL-State.",
  },
] as const;

const evalScoreSchema = z.object({
  totalScore: z.number().min(0).max(100),
  uiLibraryUsageScore: z.number().min(0).max(100),
  designQualityScore: z.number().min(0).max(100),
  architectureScore: z.number().min(0).max(100),
  slopFindings: z.array(z.string()),
  systemImprovements: z.array(
    z.object({
      target: z.enum(["oxlint-plugin-cnt", "frontend-design-skill", "agents-md", "factory"]),
      change: z.string(),
    })
  ),
});

interface ScorecardEntry {
  timestamp: string;
  round: number;
  benchmarkId: string;
  totalScore: number;
  uiLibraryUsageScore: number;
  designQualityScore: number;
  architectureScore: number;
  buildPassed: boolean;
  systemCommitSha: string | null;
  branchName: string | null;
  slopFindings: string[];
}

async function appendScorecard(cntRepoDir: string, entry: ScorecardEntry): Promise<void> {
  const dir = path.join(cntRepoDir, "factory");
  await mkdir(dir, { recursive: true });
  await appendFile(
    path.join(dir, "evolution-scorecard.jsonl"),
    `${JSON.stringify(entry)}\n`,
    "utf8"
  );
}

export async function runEvolveLoop(params: {
  cntRepoDir: string;
  hours: number;
  maxRounds: number;
  builderAgent: AgentProvider;
  evaluatorAgent: AgentProvider;
  baseBranch: string;
  dryRun: boolean;
}): Promise<void> {
  const deadline = Date.now() + params.hours * 60 * 60 * 1000;
  let consecutiveHighScores = 0;

  for (let round = 1; round <= params.maxRounds && Date.now() < deadline; round++) {
    const benchmark = BENCHMARKS[(round - 1) % BENCHMARKS.length]!;
    const evalDir = path.join(os.tmpdir(), `cnt-eval-round-${round}-${Date.now()}`);

    console.log(
      `\n=== [EVOLVE ROUND ${round}/${params.maxRounds}] Benchmark: ${benchmark.id} (${benchmark.title}) ===`
    );

    if (params.dryRun) {
      console.log(`[DRY-RUN] Would generate benchmark in ${evalDir}`);
      console.log(
        `[DRY-RUN] Builder: ${params.builderAgent} | Evaluator: ${params.evaluatorAgent}`
      );
      console.log(
        `[DRY-RUN] Would evaluate UI library usage (shadcn/ui), build, oxlint & evolve CNT repo on branch evolve/round-${round}`
      );
      return;
    }

    await mkdir(evalDir, { recursive: true });
    let buildPassed = false;
    let buildOutput = "";

    try {
      const builderPrompt = [
        `Lies zuerst ${path.join(params.cntRepoDir, "AGENTS.md")} und ${path.join(params.cntRepoDir, ".agents", "skills", "frontend-design", "SKILL.md")}.`,
        `Erstelle im aktuellen Verzeichnis (${evalDir}) ein vollständiges, lauffähiges Next.js App-Router Benchmark-Projekt:`,
        benchmark.prompt,
        "",
        "PFLICHT-ANFORDERUNGEN:",
        "1. Nutze echte shadcn/ui-Komponenten (installiere/kopiere sie sauber in src/components/ui/ — KEINE rohen <input>/<select>/<textarea> oder billig gestylten nackten HTML-Buttons in Feature-Komponenten!).",
        "2. Nutze pnpm, strict TypeScript (kein any, kein enum), Zod, Geist + Geist Mono, lucide-react (kein Sparkles-Icon).",
        "3. Führe am Ende `pnpm typecheck` und `pnpm build` aus und fixe alle Fehler, bevor du fertig bist.",
      ].join("\n");

      await runAgentCli({
        provider: params.builderAgent,
        cwd: evalDir,
        prompt: builderPrompt,
        timeoutMs: 25 * 60 * 1000,
      });

      const gate = await runVerificationGates(evalDir, ["pnpm typecheck", "pnpm build"]);
      buildPassed = gate.passed;
      buildOutput = gate.results
        .map((r) => `[${r.ok ? "OK" : "FAIL"}] ${r.command}\n${r.output}`)
        .join("\n\n");

      const evalPrompt = [
        "Du bist ein gnadenloser Principal Engineer & Design-Kritiker.",
        `Prüfe das gerade generierte Benchmark-Projekt in ${evalDir} (inspiziere Dateien unter src/).`,
        `Build-Ergebnis (${buildPassed ? "PASSED" : "FAILED"}):\n${buildOutput.slice(-4000)}`,
        "",
        "Bewerte streng (0-100) nach:",
        "1. uiLibraryUsageScore: Wurden echte shadcn/ui-Komponenten (Button, Input, Card, Table, Tabs, Dialog, Badge) genutzt oder rohes HTML/Inline-CSS-Slop?",
        "2. designQualityScore: Echte Pro-Ästhetik (Geist/Geist Mono, tabular-nums, klare Hierarchie, null KI-Slop) vs. flaches 5-Minuten-Template?",
        "3. architectureScore: RSC-First, Zod, server-only DAL, URL-State, strict TS, echte Funktionalität ohne Stubs?",
        "",
        "Nenne die 1-2 wichtigsten konkreten Verbesserungen für das CNT-Coding-System selbst (oxlint-plugin-cnt, frontend-design-skill, agents-md, oder factory), die diesen Slop künftig deterministisch verhindern.",
        "Antworte AUSSCHLIESSLICH mit validem JSON:",
        '{"totalScore":0-100,"uiLibraryUsageScore":0-100,"designQualityScore":0-100,"architectureScore":0-100,"slopFindings":["..."],"systemImprovements":[{"target":"oxlint-plugin-cnt"|"frontend-design-skill"|"agents-md"|"factory","change":"..."}]}',
      ].join("\n");

      const evalRes = await runAgentCli({
        provider: params.evaluatorAgent,
        cwd: evalDir,
        prompt: evalPrompt,
        readOnly: true,
        timeoutMs: 10 * 60 * 1000,
      });

      const score = evalScoreSchema.parse(extractJsonBlock(evalRes.stdout));
      console.log(
        `[EVOLVE ROUND ${round}] Score: ${score.totalScore}/100 (UI-Lib: ${score.uiLibraryUsageScore}, Design: ${score.designQualityScore}, Arch: ${score.architectureScore})`
      );

      let systemCommitSha: string | null = null;
      let branchName: string | null = null;

      if (score.totalScore >= 90 && buildPassed) {
        consecutiveHighScores += 1;
      } else {
        consecutiveHighScores = 0;

        if (score.systemImprovements.length > 0) {
          const handle = await createTaskWorktree(
            params.cntRepoDir,
            params.baseBranch,
            `evolve-round-${round}`
          );
          branchName = handle.branchName;

          try {
            const improvePrompt = [
              "Du verbesserst das CNT Coding-System im aktuellen Git-Worktree auf Basis eines echten Benchmark-Audits.",
              "WICHTIG: Bevorzuge harte Code-/Linter-Regeln (packages/oxlint-plugin-cnt) und präzise Factory-/Skill-Verbesserungen. KEIN Markdown-Bloat! Halte AGENTS.md kurz.",
              "",
              `Gefundener Slop im Benchmark "${benchmark.id}" (Score ${score.totalScore}/100):`,
              ...score.slopFindings.map((f) => `- ${f}`),
              "",
              "Umzusetzende System-Verbesserungen (maximal die 1-2 wirksamsten umsetzen):",
              ...score.systemImprovements
                .slice(0, 2)
                .map((imp) => `- [${imp.target}] ${imp.change}`),
              "",
              "Führe am Ende zwingend `pnpm format && pnpm verify` aus. Alles muss 100% grün sein.",
            ].join("\n");

            await runAgentCli({
              provider: params.builderAgent,
              cwd: handle.worktreePath,
              prompt: improvePrompt,
              timeoutMs: 20 * 60 * 1000,
            });

            const cntGate = await runVerificationGates(handle.worktreePath, [
              "pnpm format",
              "pnpm verify",
            ]);

            if (cntGate.passed) {
              systemCommitSha = await commitWorktreeChanges(
                handle.worktreePath,
                `chore(evolve): round ${round} improvements from ${benchmark.id} (score ${score.totalScore})`
              );
              console.log(
                `[EVOLVE ROUND ${round}] Committed verified improvement on branch ${handle.branchName} (${systemCommitSha ?? "no-diff"})`
              );
            } else {
              console.warn(
                `[EVOLVE ROUND ${round}] System improvement failed pnpm verify — discarded.`
              );
            }
          } finally {
            await removeTaskWorktree(params.cntRepoDir, handle);
          }
        }
      }

      await appendScorecard(params.cntRepoDir, {
        timestamp: new Date().toISOString(),
        round,
        benchmarkId: benchmark.id,
        totalScore: score.totalScore,
        uiLibraryUsageScore: score.uiLibraryUsageScore,
        designQualityScore: score.designQualityScore,
        architectureScore: score.architectureScore,
        buildPassed,
        systemCommitSha,
        branchName,
        slopFindings: score.slopFindings,
      });

      if (consecutiveHighScores >= 3) {
        console.log(`[EVOLVE] Converged! 3 consecutive rounds >= 90/100. Stopping cleanly.`);
        break;
      }
    } catch (error) {
      console.error(
        `[EVOLVE ROUND ${round}] Error:`,
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      await rm(evalDir, { recursive: true, force: true }).catch(() => undefined);
    }
  }
}
