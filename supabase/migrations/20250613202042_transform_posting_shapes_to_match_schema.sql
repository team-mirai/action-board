-- Transform posting_shapes table to match the required schema exactly
-- Keep table name as posting_shapes, only text and polygon types

-- Step 1: Drop all RLS policies
DROP POLICY IF EXISTS "Anyone can view posting shapes" ON public.posting_shapes;
DROP POLICY IF EXISTS "Authenticated users can insert posting shapes" ON public.posting_shapes;
DROP POLICY IF EXISTS "Users can update their own posting shapes" ON public.posting_shapes;
DROP POLICY IF EXISTS "Users can delete their own posting shapes" ON public.posting_shapes;

-- Step 2: Disable RLS
ALTER TABLE public.posting_shapes DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop indexes related to user_id
DROP INDEX IF EXISTS idx_posting_shapes_user_id;

-- Step 4: Drop the foreign key constraint and user_id column
ALTER TABLE public.posting_shapes 
  DROP CONSTRAINT IF EXISTS posting_shapes_user_id_fkey,
  DROP COLUMN IF EXISTS user_id;

-- Step 5: Change id from UUID to TEXT (for cuid compatibility)
-- First, create a temporary column
ALTER TABLE public.posting_shapes ADD COLUMN id_new TEXT;

-- Generate cuid-like IDs for existing rows (using a combination of timestamp and random string)
UPDATE public.posting_shapes 
SET id_new = 'c' || to_char(created_at, 'YYYYMMDDHH24MISS') || substr(md5(random()::text), 1, 10);

-- Drop the old id column and rename the new one
ALTER TABLE public.posting_shapes DROP COLUMN id;
ALTER TABLE public.posting_shapes RENAME COLUMN id_new TO id;
ALTER TABLE public.posting_shapes ADD PRIMARY KEY (id);

-- Step 6: Ensure properties column has default empty object
ALTER TABLE public.posting_shapes 
  ALTER COLUMN properties SET DEFAULT '{}';

-- Step 7: Grant basic permissions (adjust as needed for your use case)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posting_shapes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posting_shapes TO authenticated;

-- Final schema matches:
-- id          TEXT PRIMARY KEY
-- type        TEXT with CHECK constraint for 'polygon' and 'text'
-- coordinates JSONB
-- properties  JSONB with default '{}'
-- created_at  TIMESTAMPTZ with default NOW()
-- updated_at  TIMESTAMPTZ with default NOW()

-- Note: Type constraint already exists for 'polygon' and 'text' only