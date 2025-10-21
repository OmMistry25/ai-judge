# AI Judge – Granular Build Plan

Each task is small, testable, and single‑concern. Suggested order.

## 0. Repo and tooling
- **T00** Init repo with pnpm and workspace layout (`apps/web`, `packages/shared`, `supabase`). Commit.
- **T01** Add ESLint + Prettier + TypeScript configs. Run `pnpm lint`. Expect no errors.

## 1. Shared types
- **T02** Create `packages/shared/src/types.ts` with Zod schemas: Submission, Question, Answer, Judge, Evaluation, Run.
- **T03** Export inferred TS types. Unit test: parse minimal objects and expect success/failure.

## 2. Supabase schema
- **T04** Write `supabase/migrations/001_init.sql` with all tables and `verdict` enum.
- **T05** Apply migration locally or in hosted project. Manual test: tables exist.
- **T06** Enable RLS and add permissive demo policies or keep disabled for speed. Document choice in README.

## 3. Edge function scaffolds
- **T07** Create `supabase/functions/evaluate/index.ts` that validates payload and returns static mock JSON for now.
- **T08** Create `supabase/functions/run-evaluations/index.ts` that accepts `queueId`, returns empty summary for now.
- **T09** Configure function env vars and run locally. Health check with `supabase functions serve`.

## 4. Web app scaffold
- **T10** `npm create vite@latest apps/web` with React + TS. Wire Tailwind + shadcn/ui.
- **T11** Add TanStack Router and Query providers in `app.tsx`. Smoke test route render.
- **T12** Implement `lib/supabase.ts` to init client from `VITE_*` env. Test a trivial `select 1` call via RPC or table.

## 5. Ingestion flow
- **T13** Build `FileDropzone` that reads a JSON file and shows basic stats.
- **T14** Parse file with Zod schemas. On parse error, block submission and show error.
- **T15** Insert one `queues` row; bulk insert `submissions`, `questions`, `answers` in a transaction (serverless SQL or batch rest).
- **T16** After success, navigate to `/queues/:id` and show counts. Manual test with sample JSON.

## 6. Judges CRUD
- **T17** Implement `/judges` list with pagination and empty state.
- **T18** `JudgesForm` create new judge: name, system_prompt, provider, model, active.
- **T19** Edit judge. Toggle active. All ops persisted. Optimistic UI with Query invalidate.
- **T20** Zod enforce required fields. Unit test: invalid forms blocked.

## 7. Assignment UI
- **T21** On `/queues/:id`, query distinct `template_id` + `question_text` for that queue.
- **T22** Show chips of selected judges per template. “Edit assignments” opens a multi‑select modal.
- **T23** Persist rows in `judge_assignments`. Manual test: reload page, selections remain.

## 8. Provider adapter + prompt
- **T24** Implement `packages/shared/src/prompts.ts` to build final system/user messages.
- **T25** Implement `packages/shared/src/llm.ts` with an interface and OpenAI implementation. For now returns mock JSON.
- **T26** Add JSON schema and Zod parser for `{verdict, reasoning}`. Fuzz test a few malformed blobs.

## 9. Evaluate function
- **T27** In `evaluate/index.ts`: accept `{ submissionId, templateId, judgeId }`. Load submission, answer, judge. Call OpenAI. Parse and insert into `evaluations`. Return row.
- **T28** Add retry on JSON parse failure (max 1 retry). Respect 20s timeout.
- **T29** Unit test: inject a fake OpenAI client that returns valid and invalid payloads.

## 10. Run‑evaluations orchestrator
- **T30** In `run-evaluations/index.ts`: create a `runs` row, compute cartesian of submissions × assignments for queue. For each, call `evaluate` sequentially with small concurrency (e.g., 3).
- **T31** Track `planned`, `completed`, `failed`. Update `runs` at end. Return summary.
- **T32** Manual test: small dataset completes and persists rows.

## 11. Run UI
- **T33** Add **Run AI Judges** button on `/queues/:id`. Disable if no assignments.
- **T34** Call Edge function and show a `RunSummary` component with counts. Show toasts for errors.
- **T35** Edge case: no submissions or no assignments → friendly message.

## 12. Results page
- **T36** Build `/results` table joined with judge, question, submission. Columns: Submission, Question, Judge, Verdict, Reasoning, Created.
- **T37** `FiltersBar`: multi‑select by Judge, Question, Verdict. Persist to URL params.
- **T38** Compute and display aggregate pass rate above table. Verify against DB counts.
- **T39** Empty + loading + error states covered.

## 13. Polish and docs
- **T40** Add minimal theming and keyboard focus states. Ensure mobile‑friendly table.
- **T41** README: setup, env, trade‑offs, time spent, provider choice, limitations.
- **T42** Record Loom: ingest → CRUD judges → assign → run → results. Link in README.

## Optional bonuses
- **B01** Attachments pass‑through to provider.
- **B02** Toggle prompt fields included in evaluation.
- **B03** Pass‑rate by judge chart with Recharts.
- **B04** Background job polling UI for long runs.

## Test Plan
- Unit tests for parsing and prompt builder.
- Manual E2E with provided sample file.
- Spot check DB rows for evaluations and run summary.
