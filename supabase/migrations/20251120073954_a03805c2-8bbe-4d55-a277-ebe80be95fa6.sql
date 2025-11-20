-- Create simulation_history table to store user's circuit simulations
CREATE TABLE public.simulation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  circuit_data JSONB NOT NULL,
  result_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  title TEXT
);

-- Enable RLS
ALTER TABLE public.simulation_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own history
CREATE POLICY "Users can view their own simulation history"
ON public.simulation_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own history
CREATE POLICY "Users can insert their own simulation history"
ON public.simulation_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own history
CREATE POLICY "Users can delete their own simulation history"
ON public.simulation_history
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_simulation_history_user_id ON public.simulation_history(user_id);
CREATE INDEX idx_simulation_history_created_at ON public.simulation_history(created_at DESC);