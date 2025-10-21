-- RLS (Row Level Security) Policies for AI Judge
-- Migration: 002_rls_policies.sql
-- Enables RLS and adds permissive demo policies

-- Enable RLS on all tables
ALTER TABLE queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE judge_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Permissive demo policies (allow all operations for demo purposes)
-- In production, these should be more restrictive based on user authentication

-- Queues policies
CREATE POLICY "Allow all operations on queues" ON queues
  FOR ALL USING (true) WITH CHECK (true);

-- Submissions policies  
CREATE POLICY "Allow all operations on submissions" ON submissions
  FOR ALL USING (true) WITH CHECK (true);

-- Questions policies
CREATE POLICY "Allow all operations on questions" ON questions
  FOR ALL USING (true) WITH CHECK (true);

-- Answers policies
CREATE POLICY "Allow all operations on answers" ON answers
  FOR ALL USING (true) WITH CHECK (true);

-- Judges policies
CREATE POLICY "Allow all operations on judges" ON judges
  FOR ALL USING (true) WITH CHECK (true);

-- Judge assignments policies
CREATE POLICY "Allow all operations on judge_assignments" ON judge_assignments
  FOR ALL USING (true) WITH CHECK (true);

-- Runs policies
CREATE POLICY "Allow all operations on runs" ON runs
  FOR ALL USING (true) WITH CHECK (true);

-- Evaluations policies
CREATE POLICY "Allow all operations on evaluations" ON evaluations
  FOR ALL USING (true) WITH CHECK (true);

-- Note: For production, consider more restrictive policies like:
-- - Only authenticated users can read/write
-- - Users can only access their own data
-- - Service role has full access for Edge Functions
-- Example:
-- CREATE POLICY "Authenticated users can read queues" ON queues
--   FOR SELECT USING (auth.role() = 'authenticated');
