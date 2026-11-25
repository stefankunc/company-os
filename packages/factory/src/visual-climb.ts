import { execFile, spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { extractJsonBlock, runAgentCli } from "./agents.ts";
import {
  visualCritiqueSchema,
  type AgentProvider,
  type PrdTask,
  type VisualCritique,
} from "./schema.ts";

const execFileAsync = promisify(execFile);

const PYTHON_SCREENSHOT_SCRIPT = `
import sys, json
from playwright.sync_api import sync_playwright

base_url = sys.argv[1]
routes = json.loads(sys.argv[2])
out_dir = sys.argv[3]
saved = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for idx, route in enumerate(routes):
        url = base_url.rstrip("/") + "/" + route.lstrip("/")
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: errors.append(str(err)))
        page.goto(url, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(1200)
        desktop_file = f"{out_dir}/route-{idx}-desktop.png"
        page.screenshot(path=desktop_file, full_page=True)
        page.set_viewport_size({"width": 390, "height": 844})
        page.wait_for_timeout(500)
        mobile_file = f"{out_dir}/route-{idx}-mobile.png"
        page.screenshot(path=mobile_file, full_page=True)
        saved.append({"route": route, "desktop": desktop_file, "mobile": mobile_file, "consoleErrors": errors})
        page.close()
    browser.close()

print(json.dumps(saved))
`;

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.status < 500) return;
    } catch {
      // Server still booting
    }
    await new Promise((r) => setTimeout(r, 800));
  }
  throw new Error(`Preview server did not become ready at ${url} within ${timeoutMs}ms`);
}

async function killSpawnedPid(pid: number | undefined): Promise<void> {
  if (!pid) return;
  if (process.platform === "win32") {
    await execFileAsync("taskkill", ["/PID", String(pid), "/T", "/F"]).catch(() => undefined);
  } else {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      // Already exited
    }
  }
}

export async function runVisualHillClimbRound(params: {
  worktreePath: string;
  projectDir: string;
  task: PrdTask;
  round: number;
  visionAgent: AgentProvider;
  minScore: number;
  port?: number;
}): Promise<VisualCritique> {
  const port = params.port ?? 3199;
  const baseUrl = `http://localhost:${port}`;
  const outDir = path.join(
    params.projectDir,
    "factory",
    "screenshots",
    params.task.id,
    `round-${params.round}`
  );
  await mkdir(outDir, { recursive: true });

  const isWin = process.platform === "win32";
  const server = isWin
    ? spawn("powershell", ["-NoProfile", "-Command", `pnpm exec next start --port ${port}`], {
        cwd: params.worktreePath,
        stdio: "ignore",
        windowsHide: true,
      })
    : spawn("pnpm", ["exec", "next", "start", "--port", String(port)], {
        cwd: params.worktreePath,
        stdio: "ignore",
      });

  let captureMetadata = "";
  try {
    await waitForServer(baseUrl, 30_000);
    const { stdout } = await execFileAsync(
      "python",
      ["-c", PYTHON_SCREENSHOT_SCRIPT, baseUrl, JSON.stringify(params.task.uiRoutes), outDir],
      { timeout: 120_000, maxBuffer: 10 * 1024 * 1024 }
    );
    captureMetadata = stdout.trim();
  } finally {
    await killSpawnedPid(server.pid);
  }

  const critiquePrompt = [
    "Du bist ein gnadenloser Principal Product Designer (wie Linear / Vercel / TradingView).",
    `Bewerte die gerenderten Screenshots in diesem Ordner: ${outDir}`,
    `Capture-Metadaten (inkl. Console-Errors): ${captureMetadata}`,
    `Task: ${params.task.title}`,
    "Prüfe streng auf:",
    "- Wirkt das Design wie ein echtes Top-Produkt oder wie billiger 5-Minuten-KI-Slop?",
    "- Typografie-Hierarchie (Geist/Geist Mono, tabular-nums), Kontrast, Spacing, Alignment, Mobile-Layout",
    "- Echte Datentiefe, Interaktionsdichte, null abgeschnittene Achsen/Labels, null Console-Errors",
    "",
    `Mindest-Score zum Bestehen: ${params.minScore}/10.`,
    "Antworte AUSSCHLIESSLICH mit validem JSON:",
    '{"score":1-10,"passed":true|false,"summary":"...","issues":["..."],"nextActions":["..."]}',
  ].join("\n");

  const result = await runAgentCli({
    provider: params.visionAgent,
    cwd: params.worktreePath,
    prompt: critiquePrompt,
    readOnly: true,
    timeoutMs: 10 * 60 * 1000,
  });

  const parsed = visualCritiqueSchema.parse(extractJsonBlock(result.stdout));
  return {
    ...parsed,
    passed: parsed.passed && parsed.score >= params.minScore,
  };
}
