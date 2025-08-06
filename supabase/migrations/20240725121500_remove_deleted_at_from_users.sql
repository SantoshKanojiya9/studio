
-- Removes the redundant deleted_at column from the public users table.
-- The canonical source for this information is now `auth.users.deleted_at`.
ALTER TABLE public.users DROP COLUMN IF EXISTS deleted_at;
