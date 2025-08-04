
-- supabase/migrations/20240523123000_create_notifications_table.sql

CREATE TYPE notification_type AS ENUM ('follow', 'reaction');

CREATE TABLE notifications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    emoji_id BIGINT REFERENCES public.emojis(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT sender_is_not_recipient CHECK (sender_id <> recipient_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to view their own notifications
CREATE POLICY "Allow individual read access" ON notifications
FOR SELECT USING (auth.uid() = recipient_id);

-- Policy: Allow users to create notifications for others
CREATE POLICY "Allow individual insert access" ON notifications
FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Indexes for performance
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_sender_id ON notifications(sender_id);
