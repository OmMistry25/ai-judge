-- Add missing columns to runs table
ALTER TABLE runs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'running';
ALTER TABLE runs ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Update existing runs to have default status
UPDATE runs SET status = 'completed' WHERE status IS NULL;
