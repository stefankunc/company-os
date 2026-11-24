import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { AGENT_PROVIDERS, type AgentProvider } from "./schema.ts";

const execFileAsync = promisify(execFile);

export interface AgentRunOptions {
  provider: AgentProvider;
  cwd: string;
  prompt: string;
  readOnly?: boolean;
  timeoutMs?: number;
}

export interface AgentRunResult {
  provider: AgentProvider;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
}

function buildCommandArgs(
  provider: AgentProvider,
  prompt: string,
  readOnly: boolean
): { command: string; args: string[] } {
  const isWin = process.platform === "win32";

  switch (provider) {
    case "claude":
      return {
        command: "claude",
        args: readOnly
          ? ["-p", prompt, "--permission-mode", "plan"]
          : ["-p", prompt, "--dangerously-skip-permissions"],
      };
    case "codex":
      return {
        command: isWin ? "powershell" : "codex",
        args: isWin ? ["-NoProfile", "-Command", "codex", "exec", prompt] : ["exec", prompt],
      };
    case "gemini":
      return {
        command: isWin ? "powershell" : "gemini",
        args: isWin ? ["-NoProfile", "-Command", "gemini", "-p", prompt] : ["-p", prompt],
      };
    case "opencode":
      return {
        command: isWin ? "powershell" : "opencode",
        args: isWin ? ["-NoProfile", "-Command", "opencode", "run", prompt] : ["run", prompt],
      };
  }
}

export async function runAgentCli(options: AgentRunOptions): Promise<AgentRunResult> {
  const startedAt = Date.now();
  const timeoutMs = options.timeoutMs ?? 25 * 60 * 1000;
  const { command, args } = buildCommandArgs(
    options.provider,
    options.prompt,
    options.readOnly ?? false
  );

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutMs);

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (timedOut) {
        reject(new Error(`Agent ${options.provider} timed out after ${timeoutMs}ms`));
        return;
      }
      resolve({
        provider: options.provider,
        exitCode: code ?? 1,
        stdout,
        stderr,
        durationMs: Date.now() - startedAt,
      });
    });
  });
}

export async function detectInstalledTools(): Promise<Record<string, boolean>> {
  const tools = [...AGENT_PROVIDERS, "git", "pnpm", "python", "playwright", "ffmpeg"];
  const checker = process.platform === "win32" ? "where" : "which";
  const entries = await Promise.all(
    tools.map(async (tool) => {
      try {
        await execFileAsync(checker, [tool], { timeout: 5000 });
        return [tool, true] as const;
      } catch {
        return [tool, false] as const;
      }
    })
  );
  return Object.fromEntries(entries);
}

export function extractJsonBlock(rawOutput: string): unknown {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/iu.exec(rawOutput);
  const candidate = fenced?.[1]?.trim() ?? rawOutput.trim();
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("Agent output did not contain a valid JSON object.");
  }
  return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
}
