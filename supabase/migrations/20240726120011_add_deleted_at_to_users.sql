-- Add the deleted_at column to the public.users table to track soft deletes
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
