-- AI Judge Database Schema
-- Migration: 001_init.sql
-- Creates all tables and enums for the AI Judge system

-- Create verdict enum
CREATE TYPE verdict AS ENUM ('pass', 'fail', 'inconclusive');

-- Queues table
CREATE TABLE queues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions table (raw + denormalized pointers for filters)
CREATE TABLE submissions (
  id TEXT PRIMARY KEY,
  queue_id UUID REFERENCES queues(id) ON DELETE CASCADE,
  labeling_task_id TEXT,
  created_at_ms BIGINT,
  raw JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table (template per submission rev)
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id TEXT REFERENCES submissions(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  rev INTEGER NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('single_choice_with_reasoning', 'freeform', 'multi_choice')),
  question_text TEXT NOT NULL,
  UNIQUE(submission_id, template_id, rev)
);

-- Answers table (keyed by template_id in input)
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id TEXT REFERENCES submissions(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  choice TEXT,
  reasoning TEXT,
  UNIQUE(submission_id, template_id)
);

-- Judges table
CREATE TABLE judges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'openai',
  model TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Judge assignments (assign judges to a question template within a queue)
CREATE TABLE judge_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES queues(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  judge_id UUID REFERENCES judges(id),
  UNIQUE(queue_id, template_id, judge_id)
);

-- Evaluation runs (one click = one run)
CREATE TABLE runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES queues(id) ON DELETE CASCADE,
  planned_count INTEGER NOT NULL DEFAULT 0,
  completed_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evaluations (result per question × judge × submission per run)
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES runs(id) ON DELETE CASCADE,
  submission_id TEXT REFERENCES submissions(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  judge_id UUID REFERENCES judges(id),
  verdict verdict NOT NULL,
  reasoning TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  latency_ms INTEGER,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(run_id, submission_id, template_id, judge_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_submissions_queue_id ON submissions(queue_id);
CREATE INDEX idx_submissions_labeling_task_id ON submissions(labeling_task_id);
CREATE INDEX idx_questions_submission_id ON questions(submission_id);
CREATE INDEX idx_questions_template_id ON questions(template_id);
CREATE INDEX idx_answers_submission_id ON answers(submission_id);
CREATE INDEX idx_answers_template_id ON answers(template_id);
CREATE INDEX idx_judges_active ON judges(active);
CREATE INDEX idx_judge_assignments_queue_id ON judge_assignments(queue_id);
CREATE INDEX idx_judge_assignments_template_id ON judge_assignments(template_id);
CREATE INDEX idx_runs_queue_id ON runs(queue_id);
CREATE INDEX idx_evaluations_run_id ON evaluations(run_id);
CREATE INDEX idx_evaluations_submission_id ON evaluations(submission_id);
CREATE INDEX idx_evaluations_judge_id ON evaluations(judge_id);
CREATE INDEX idx_evaluations_verdict ON evaluations(verdict);
