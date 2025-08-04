
CREATE TABLE subscriptions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    subscriber_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscribee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_subscription UNIQUE (subscriber_id, subscribee_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to view subscriptions
CREATE POLICY "Allow public read access" ON subscriptions
FOR SELECT USING (true);

-- Policy: Allow users to insert their own subscriptions
CREATE POLICY "Allow individual insert access" ON subscriptions
FOR INSERT WITH CHECK (auth.uid() = subscriber_id);

-- Policy: Allow users to delete their own subscriptions
CREATE POLICY "Allow individual delete access" ON subscriptions
FOR DELETE USING (auth.uid() = subscriber_id);
