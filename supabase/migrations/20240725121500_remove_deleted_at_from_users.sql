-- This migration removes the redundant 'deleted_at' column from the public 'users' table.
-- The authoritative 'deleted_at' timestamp is now stored in the 'auth.users' table metadata.
ALTER TABLE public.users DROP COLUMN IF EXISTS deleted_at;
