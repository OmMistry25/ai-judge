import { z } from 'zod';

// Core domain types based on the architecture

// Verdict enum for evaluations
export const VerdictSchema = z.enum(['pass', 'fail', 'inconclusive']);
export type Verdict = z.infer<typeof VerdictSchema>;

// Question types
export const QuestionTypeSchema = z.enum([
  'single_choice_with_reasoning',
  'freeform',
  'multi_choice'
]);
export type QuestionType = z.infer<typeof QuestionTypeSchema>;

// Question data structure
export const QuestionDataSchema = z.object({
  id: z.string(),
  questionType: QuestionTypeSchema,
  questionText: z.string(),
});
export type QuestionData = z.infer<typeof QuestionDataSchema>;

// Question with revision
export const QuestionSchema = z.object({
  rev: z.number().int().positive(),
  data: QuestionDataSchema,
});
export type Question = z.infer<typeof QuestionSchema>;

// Answer structure
export const AnswerSchema = z.object({
  choice: z.string().optional(),
  reasoning: z.string().optional(),
});
export type Answer = z.infer<typeof AnswerSchema>;

// Submission structure (matches sample JSON)
export const SubmissionSchema = z.object({
  id: z.string(),
  queueId: z.string(),
  labelingTaskId: z.string(),
  createdAt: z.number().int().positive(), // timestamp in ms
  questions: z.array(QuestionSchema),
  answers: z.record(z.string(), AnswerSchema), // template_id -> answer
});
export type Submission = z.infer<typeof SubmissionSchema>;

// Judge configuration
export const JudgeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  systemPrompt: z.string().min(1),
  provider: z.string().default('openai'),
  model: z.string().min(1),
  active: z.boolean().default(true),
  createdAt: z.date().optional(),
});
export type Judge = z.infer<typeof JudgeSchema>;

// Evaluation result
export const EvaluationSchema = z.object({
  id: z.string().uuid().optional(),
  runId: z.string().uuid(),
  submissionId: z.string(),
  templateId: z.string(),
  judgeId: z.string().uuid(),
  verdict: VerdictSchema,
  reasoning: z.string().max(400),
  provider: z.string(),
  model: z.string(),
  latencyMs: z.number().int().positive().optional(),
  error: z.string().optional(),
  createdAt: z.date().optional(),
});
export type Evaluation = z.infer<typeof EvaluationSchema>;

// Run summary
export const RunSchema = z.object({
  id: z.string().uuid().optional(),
  queueId: z.string().uuid(),
  plannedCount: z.number().int().nonnegative().default(0),
  completedCount: z.number().int().nonnegative().default(0),
  failedCount: z.number().int().nonnegative().default(0),
  createdAt: z.date().optional(),
});
export type Run = z.infer<typeof RunSchema>;

// Queue structure
export const QueueSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  createdAt: z.date().optional(),
});
export type Queue = z.infer<typeof QueueSchema>;

// Judge assignment
export const JudgeAssignmentSchema = z.object({
  id: z.string().uuid().optional(),
  queueId: z.string().uuid(),
  templateId: z.string(),
  judgeId: z.string().uuid(),
});
export type JudgeAssignment = z.infer<typeof JudgeAssignmentSchema>;

// Input JSON structure (for file upload)
export const InputJsonSchema = z.array(SubmissionSchema);
export type InputJson = z.infer<typeof InputJsonSchema>;

// LLM response structure
export const LLMResponseSchema = z.object({
  verdict: VerdictSchema,
  reasoning: z.string().max(400),
});
export type LLMResponse = z.infer<typeof LLMResponseSchema>;
