-- Create the planner_state table for persisting user workout planner state
CREATE TABLE IF NOT EXISTS public.planner_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  program_name TEXT DEFAULT 'Return to Form',
  theme TEXT DEFAULT 'dark-knight',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_planner_state_user_id ON public.planner_state(user_id);
