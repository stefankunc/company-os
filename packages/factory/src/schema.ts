import { z } from "zod";

export const AGENT_PROVIDERS = ["claude", "codex", "gemini", "opencode"] as const;
export type AgentProvider = (typeof AGENT_PROVIDERS)[number];

const TASK_PHASES = [
  "architecture",
  "database",
  "backend",
  "ui-variants",
  "ui-polish",
  "e2e",
  "security",
] as const;

const TASK_STATUSES = ["pending", "in_progress", "reviewing", "completed", "blocked"] as const;

const prdTaskSchema = z.object({
  id: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/u),
  title: z.string().min(3),
  phase: z.enum(TASK_PHASES),
  description: z.string().min(10),
  dependencies: z.array(z.string()).default([]),
  acceptanceCriteria: z.array(z.string().min(3)).min(1),
  verifyCommands: z.array(z.string().min(2)).default(["pnpm verify"]),
  uiRoutes: z.array(z.string()).default([]),
  status: z.enum(TASK_STATUSES).default("pending"),
  attempts: z.number().int().nonnegative().default(0),
  startedAt: z.string().nullable().default(null),
  completedAt: z.string().nullable().default(null),
  commitSha: z.string().nullable().default(null),
  lastError: z.string().nullable().default(null),
});

export type PrdTask = z.infer<typeof prdTaskSchema>;

export const prdDocumentSchema = z.object({
  version: z.literal(1).default(1),
  projectName: z.string().min(2),
  specFile: z.string().min(1),
  baseBranch: z.string().min(1).default("main"),
  createdAt: z.string(),
  updatedAt: z.string(),
  builderAgent: z.enum(AGENT_PROVIDERS).default("claude"),
  reviewerAgents: z.array(z.enum(AGENT_PROVIDERS)).min(1).default(["codex", "gemini"]),
  visionAgent: z.enum(AGENT_PROVIDERS).default("gemini"),
  maxHours: z.number().positive().default(72),
  maxTaskAttempts: z.number().int().positive().default(4),
  maxReviewRounds: z.number().int().positive().default(3),
  maxVisualRounds: z.number().int().positive().default(4),
  minVisualScore: z.number().min(1).max(10).default(8.5),
  tasks: z.array(prdTaskSchema).min(1),
});

export type PrdDocument = z.infer<typeof prdDocumentSchema>;

const councilFindingSchema = z.object({
  severity: z.enum(["critical", "high", "medium", "low"]),
  file: z.string(),
  issue: z.string(),
  fix: z.string(),
});

export const councilVerdictSchema = z.object({
  verdict: z.enum(["approve", "changes_requested"]),
  score: z.number().min(1).max(10),
  summary: z.string(),
  findings: z.array(councilFindingSchema),
});

export type CouncilVerdict = z.infer<typeof councilVerdictSchema>;

export const visualCritiqueSchema = z.object({
  score: z.number().min(1).max(10),
  passed: z.boolean(),
  summary: z.string(),
  issues: z.array(z.string()),
  nextActions: z.array(z.string()),
});

export type VisualCritique = z.infer<typeof visualCritiqueSchema>;

const progressEntrySchema = z.object({
  timestamp: z.string(),
  taskId: z.string().nullable(),
  event: z.string(),
  agent: z.string().nullable(),
  details: z.string(),
});

export type ProgressEntry = z.infer<typeof progressEntrySchema>;
