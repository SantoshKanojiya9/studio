
-- Create the subscriptions table to store user follow relationships
CREATE TABLE public.subscriptions (
    subscriber_id uuid NOT NULL,
    subscribed_to_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),

    CONSTRAINT subscriptions_pkey PRIMARY KEY (subscriber_id, subscribed_to_id),
    CONSTRAINT subscriptions_subscriber_id_fkey FOREIGN KEY (subscriber_id) REFERENCES public.users (id) ON DELETE CASCADE,
    CONSTRAINT subscriptions_subscribed_to_id_fkey FOREIGN KEY (subscribed_to_id) REFERENCES public.users (id) ON DELETE CASCADE
);

-- Enable Row Level Security on the new table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user to view all subscriptions. This is needed to check who is subscribed to whom.
CREATE POLICY "Enable read access for all users"
ON public.subscriptions
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow a user to subscribe (insert) to another user.
CREATE POLICY "Users can insert their own subscriptions"
ON public.subscriptions
FOR INSERT WITH CHECK (auth.uid() = subscriber_id);

-- Allow a user to unsubscribe (delete) from another user.
CREATE POLICY "Users can delete their own subscriptions"
ON public.subscriptions
FOR DELETE USING (auth.uid() = subscriber_id);
