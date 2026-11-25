import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

interface GateCommandResult {
  command: string;
  ok: boolean;
  output: string;
}

export interface GateRunSummary {
  passed: boolean;
  results: GateCommandResult[];
}

export async function runVerificationGates(
  worktreePath: string,
  commands: string[]
): Promise<GateRunSummary> {
  const results: GateCommandResult[] = [];
  const isWin = process.platform === "win32";

  for (const command of commands) {
    try {
      const { stdout, stderr } = isWin
        ? await execFileAsync("powershell", ["-NoProfile", "-Command", command], {
            cwd: worktreePath,
            maxBuffer: 10 * 1024 * 1024,
            timeout: 5 * 60 * 1000,
          })
        : await execFileAsync("sh", ["-c", command], {
            cwd: worktreePath,
            maxBuffer: 10 * 1024 * 1024,
            timeout: 5 * 60 * 1000,
          });
      results.push({
        command,
        ok: true,
        output: `${stdout}\n${stderr}`.trim().slice(-4000),
      });
    } catch (error) {
      const errObj = error as { stdout?: string; stderr?: string; message?: string };
      const combined = `${errObj.stdout ?? ""}\n${errObj.stderr ?? ""}\n${errObj.message ?? ""}`
        .trim()
        .slice(-6000);
      results.push({
        command,
        ok: false,
        output: combined,
      });
      return { passed: false, results };
    }
  }

  return { passed: true, results };
}
