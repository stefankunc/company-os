import { execFile } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface WorktreeHandle {
  worktreePath: string;
  branchName: string;
}

async function runGit(cwd: string, args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("git", args, {
    cwd,
    maxBuffer: 10 * 1024 * 1024,
    timeout: 60_000,
  });
  return stdout.trim();
}

export async function createTaskWorktree(
  projectDir: string,
  baseBranch: string,
  taskId: string
): Promise<WorktreeHandle> {
  const worktreesRoot = path.join(projectDir, ".factory-worktrees");
  await mkdir(worktreesRoot, { recursive: true });

  const worktreePath = path.join(worktreesRoot, taskId);
  const branchName = `factory/${taskId}`;

  await rm(worktreePath, { recursive: true, force: true }).catch(() => undefined);
  await runGit(projectDir, ["worktree", "prune"]);
  await runGit(projectDir, ["branch", "-D", branchName]).catch(() => undefined);
  await runGit(projectDir, ["worktree", "add", "-b", branchName, worktreePath, baseBranch]);

  return { worktreePath, branchName };
}

export async function getWorktreeDiff(worktreePath: string, baseBranch: string): Promise<string> {
  const status = await runGit(worktreePath, ["status", "--short"]);
  const diff = await runGit(worktreePath, ["diff", baseBranch]);
  return `STATUS:\n${status}\n\nDIFF:\n${diff}`.slice(0, 60_000);
}

export async function commitWorktreeChanges(
  worktreePath: string,
  message: string
): Promise<string | null> {
  const status = await runGit(worktreePath, ["status", "--porcelain"]);
  if (status.length === 0) {
    return null;
  }
  await runGit(worktreePath, ["add", "-A"]);
  await runGit(worktreePath, ["commit", "-m", message]);
  return runGit(worktreePath, ["rev-parse", "--short", "HEAD"]);
}

export async function mergeTaskBranch(
  projectDir: string,
  baseBranch: string,
  branchName: string
): Promise<void> {
  await runGit(projectDir, ["checkout", baseBranch]);
  await runGit(projectDir, ["merge", "--no-ff", branchName, "-m", `merge: ${branchName}`]);
}

export async function removeTaskWorktree(
  projectDir: string,
  handle: WorktreeHandle
): Promise<void> {
  await runGit(projectDir, ["worktree", "remove", "--force", handle.worktreePath]).catch(
    () => undefined
  );
  await runGit(projectDir, ["worktree", "prune"]).catch(() => undefined);
}
