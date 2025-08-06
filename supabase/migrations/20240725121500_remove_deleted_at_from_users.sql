-- Removes the redundant `deleted_at` column from the public users table.
-- The source of truth for soft deletion is now the `deleted_at` column in `auth.users`.
ALTER TABLE public.users DROP COLUMN IF EXISTS deleted_at;
