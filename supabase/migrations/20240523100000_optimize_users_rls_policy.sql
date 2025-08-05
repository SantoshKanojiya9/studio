-- Optimize the RLS policy for inserting into public.users as per Supabase Performance Advisor recommendation.
-- This change wraps auth.uid() in a SELECT to cache the function result per statement, improving performance.

-- First, drop the existing policy if it exists
DROP POLICY IF EXISTS "Allow individual insert access" ON public.users;

-- Then, create the new, optimized policy
CREATE POLICY "Allow individual insert access"
ON public.users
FOR INSERT
WITH CHECK ((select auth.uid()) = id);

-- Additionally, let's optimize the existing SELECT policy on the users table.
-- It's good practice to apply this optimization to all RLS policies.
DROP POLICY IF EXISTS "Users can view their own data." ON public.users;

CREATE POLICY "Users can view their own data."
ON public.users
FOR SELECT
USING ((select auth.uid()) = id);

-- And the update policy
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;

CREATE POLICY "Users can update their own data"
ON public.users
FOR UPDATE
USING ((select auth.uid()) = id)
WITH CHECK ((select auth.uid()) = id);
