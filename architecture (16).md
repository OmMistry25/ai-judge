# AI Judge – Architecture

## Goal
Build a self‑contained web app that ingests submissions JSON, defines “AI Judges,” assigns them to questions, executes real LLM evaluations, persists results, and visualizes pass/fail stats. Meets the functional requirements and deliverables in the spec (React 18 + TS, Vite, real LLM calls, persisted backend, results with filters and pass‑rate).

## Tech Stack
- **Frontend:** React 18 + TypeScript (Vite), TanStack Router, TanStack Query, Zod, shadcn/ui + Tailwind, React Hook Form.
- **Backend & DB:** **Supabase** (Postgres + RLS) for persistence, **Supabase Edge Functions** for secure server‑side LLM calls.
- **LLM:** OpenAI (default). Swappable via provider adapter.
- **Types & Safety:** End‑to‑end Zod schemas shared by FE and Edge Functions.
- **Parsing robustness:** Strict JSON schema with retry and “fall back to tool schema” strategy.
- **Dev experience:** Cursor‑friendly, single repo, pnpm, env‑driven config.

## Monorepo Layout
```
ai-judge/
  package.json
  pnpm-lock.yaml
  .env            # frontend env (VITE_* only)
  .env.local
  .env.example
  /packages/
    /shared/
      src/types.ts            # Zod + TS types for domain (Submission, Question, Judge, Evaluation, etc.)
      src/llm.ts              # Provider-agnostic request/response types
      src/prompts.ts          # Prompt builders
      src/utils.ts
      tsconfig.json
  /apps/
    /web/                     # Vite React app
      index.html
      vite.config.ts
      tsconfig.json
      src/
        main.tsx
        app.tsx               # Router + Providers
        lib/
          supabase.ts         # Supabase client
          queryClient.ts      # TanStack Query
        routes/
          ingest.tsx          # Upload JSON → persist to Supabase
          queues/
            index.tsx         # List queues
            $queueId/
              index.tsx       # Queue detail: questions, assignments, Run button
          judges/
            index.tsx         # List + create/edit judges (CRUD)
            new.tsx
            $judgeId.tsx
          results.tsx         # Results table + filters + pass-rate
        components/
          FileDropzone.tsx
          JudgesForm.tsx
          AssignmentsTable.tsx
          RunSummary.tsx
          ResultsTable.tsx
          FiltersBar.tsx
          Empty.tsx
          ErrorView.tsx
        styles/globals.css
  /supabase/
    config.toml
    /migrations/              # SQL migrations for tables + RLS
      001_init.sql
    /functions/
      run-evaluations/        # Edge Function: orchestrate batch run
        index.ts
      evaluate/               # Edge Function: single evaluation
        index.ts
      utils/
        db.ts                 # Typed DB helpers (postgres-js or @supabase/postgrest-js)
        parse.ts              # Zod parsers, safeJSON helpers
        openai.ts             # OpenAI client + JSON schema tool call
```

## Data Model (Postgres)
```sql
-- Queues
queues(id uuid primary key, name text not null, created_at timestamptz default now());

-- Submissions (raw + denormalized pointers for filters)
submissions(
  id text primary key,
  queue_id uuid references queues(id) on delete cascade,
  labeling_task_id text,
  created_at_ms bigint,
  raw jsonb not null,
  created_at timestamptz default now()
);

-- Questions (template per submission rev)
questions(
  id uuid primary key default gen_random_uuid(),
  submission_id text references submissions(id) on delete cascade,
  template_id text not null,              -- "q_template_1"
  rev int not null,
  question_type text not null,            -- single_choice_with_reasoning | freeform | multi_choice
  question_text text not null,
  unique(submission_id, template_id, rev)
);

-- Answers keyed by template_id in input
answers(
  id uuid primary key default gen_random_uuid(),
  submission_id text references submissions(id) on delete cascade,
  template_id text not null,
  choice text,
  reasoning text,
  unique(submission_id, template_id)
);

-- Judges
judges(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  system_prompt text not null,
  provider text not null default 'openai',
  model text not null,
  active boolean not null default true,
  created_at timestamptz default now()
);

-- Assign judges to a question template within a queue
judge_assignments(
  id uuid primary key default gen_random_uuid(),
  queue_id uuid references queues(id) on delete cascade,
  template_id text not null,
  judge_id uuid references judges(id),
  unique(queue_id, template_id, judge_id)
);

-- Evaluation runs (one click = one run)
create type verdict as enum ('pass','fail','inconclusive');
runs(
  id uuid primary key default gen_random_uuid(),
  queue_id uuid references queues(id) on delete cascade,
  planned_count int not null default 0,
  completed_count int not null default 0,
  failed_count int not null default 0,
  created_at timestamptz default now()
);

-- Evaluations (result per question × judge × submission per run)
evaluations(
  id uuid primary key default gen_random_uuid(),
  run_id uuid references runs(id) on delete cascade,
  submission_id text references submissions(id) on delete cascade,
  template_id text not null,
  judge_id uuid references judges(id),
  verdict verdict not null,
  reasoning text not null,
  provider text not null,
  model text not null,
  latency_ms int,
  error text,
  created_at timestamptz default now(),
  unique(run_id, submission_id, template_id, judge_id)
);
```

### RLS (example sketch)
- Enable RLS on all tables.
- Simple single‑user demo policy: allow all operations for `auth.uid()` if you enable auth. For a fast take‑home, you can disable auth and run with service key in Edge Functions only, and anon key in FE with limited selects.

## Key Flows
### 1) Ingest JSON
- User uploads `sample_input.json`.
- Parse with Zod. Insert one row in `queues` (or select existing) and bulk insert `submissions`, `questions`, and `answers` in one transaction.
- Show count of submissions parsed.

### 2) Judges CRUD
- List, create, edit, deactivate. Persist in `judges`.
- Validation: name, system_prompt, model. Active flag used by assignment UI filter.

### 3) Assignment
- On a queue page, show distinct `template_id` + `question_text` derived from `questions` for that queue.
- Allow multi‑select judges per template. Persist `judge_assignments` rows.

### 4) Run AI Judges
- User clicks **Run** on queue page.
- Frontend POST → `supabase.functions.invoke('run-evaluations', {{ queueId }})`.
- Edge function:
  - Creates a `runs` row.
  - For each `submission` in queue and each `template_id` with assigned judges:
    - Build prompt from `prompts.ts` using judge.system_prompt + question + answer.
    - Call provider via `openai.ts` with JSON tool schema:
      ```json
      {{
        "type":"object",
        "properties": {{
          "verdict": {{"enum":["pass","fail","inconclusive"]}},
          "reasoning": {{"type":"string","maxLength":400}}
        }},
        "required":["verdict","reasoning"]
      }}
      ```
    - Parse, validate with Zod. Insert `evaluations` row. Tally counts.
  - Return summary {{planned, completed, failed}}.
- Handle rate limits with simple concurrency cap and exponential backoff.

### 5) Results View
- Server‑driven table: join `evaluations` with `submissions`, `judges`, `questions`.
- Filters:
  - Judge multi‑select → `judge_id IN (...)`
  - Question multi‑select → `template_id IN (...)`
  - Verdict multi‑select → `verdict IN (...)`
- Aggregate: `pass_rate = pass_count / total` displayed above table.
- Empty, loading, and error states.

## Prompting & Providers
- **Prompt builder**: deterministic frame, short outputs, JSON response enforced.
- **Guardrails**: if JSON parsing fails, attempt one retry with “reply ONLY valid JSON”.
- **Provider adapter** in `packages/shared/src/llm.ts` supports OpenAI first, Anthropic later.

## State Management
- **Remote state**: TanStack Query for Supabase reads/writes with optimistic updates.
- **UI state**: light Zustand or React state in components.
- **Runs**: long‑running jobs return aggregated summary; no websockets needed for MVP.

## Error Handling
- Frontend: toasts + inline component errors.
- Edge: structured error objects, partial progress continues, failed items recorded with `error` text.

## Security
- API keys live only in Edge Functions env. Frontend uses anon key with row‑level reads.
- CORS restricted to localhost for demo.

## Local Dev
- `pnpm i`
- `supabase start` (if using local) or connect to hosted project.
- `pnpm --filter @app/web dev` to run Vite on :5173.
- Environment:
  - FE `.env`:
    - `VITE_SUPABASE_URL=`
    - `VITE_SUPABASE_ANON_KEY=`
  - Edge Functions secrets:
    - `OPENAI_API_KEY`
    - `SUPABASE_URL`
    - `SUPABASE_SERVICE_ROLE_KEY`

## Why Supabase Edge Functions
- Keeps secrets off the client.
- Simple deploy or local run.
- Good fit for “real LLM call + persist” loop.

## Cursor Setup Notes
- Open the repo in Cursor.
- Create tasks from `tasks.md` one by one.
- Let Cursor scaffold Vite + shadcn components and Edge Functions using inline prompts.
- Keep commits per task to ease demo and rollbacks.
