-- Create posting_shapes table for map drawing functionality
CREATE TABLE IF NOT EXISTS public.posting_shapes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('marker', 'rectangle', 'polyline', 'polygon', 'circle', 'point', 'linestring', 'text')),
  coordinates JSONB NOT NULL,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX idx_posting_shapes_user_id ON public.posting_shapes(user_id);
CREATE INDEX idx_posting_shapes_created_at ON public.posting_shapes(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.posting_shapes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all posting shapes
CREATE POLICY "Anyone can view posting shapes" ON public.posting_shapes
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert their own posting shapes
CREATE POLICY "Authenticated users can insert posting shapes" ON public.posting_shapes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own posting shapes
CREATE POLICY "Users can update their own posting shapes" ON public.posting_shapes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own posting shapes
CREATE POLICY "Users can delete their own posting shapes" ON public.posting_shapes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posting_shapes_updated_at
  BEFORE UPDATE ON public.posting_shapes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT ON public.posting_shapes TO anon;
GRANT ALL ON public.posting_shapes TO authenticated;