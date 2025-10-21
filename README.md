# AI Judge

AI Judge - LLM evaluation system for submissions

## Setup

### Prerequisites
- Node.js 18+
- pnpm
- Docker Desktop (for local Supabase development)
- Supabase CLI

### Development Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start local Supabase (requires Docker):**
   ```bash
   supabase start
   ```
   This will apply the database migration and start local services.

3. **Test Edge Functions locally:**
   ```bash
   supabase functions serve --env-file .env.local
   ```
   This will start the Edge Functions on http://localhost:54321

4. **Alternative: Use hosted Supabase**
   - Create a project at https://supabase.com
   - Copy the migration from `supabase/migrations/001_init.sql`
   - Apply it in the Supabase SQL editor

5. **Start development server:**
   ```bash
   pnpm dev
   ```

### Environment Variables

Create `.env` file in the root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For Edge Functions (server-side):
```env
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Schema

The migration `supabase/migrations/001_init.sql` creates:
- `verdict` enum (pass/fail/inconclusive)
- Core tables: queues, submissions, questions, answers, judges, judge_assignments, runs, evaluations
- Proper foreign key constraints and indexes

## Project Structure

```
ai-judge/
├── apps/web/          # React frontend (to be created)
├── packages/shared/   # Shared types and utilities
├── supabase/          # Database migrations and Edge Functions
└── README.md
```

## Current Status

✅ **Completed:**
- T00: Repo structure with pnpm workspace
- T01: ESLint + Prettier + TypeScript configs  
- T02: Zod schemas for domain types
- T03: TypeScript type exports
- T04: Database migration ready
- T05: Migration applied to hosted Supabase
- T06: RLS policies enabled
- T07-T08: Edge Function scaffolds created

🔄 **Next:**
- T09: Test Edge Functions locally
- T10+: React web app development