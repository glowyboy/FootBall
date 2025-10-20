-- Migration to add notification tracking fields to matches table
-- Run this in your Supabase SQL editor

-- Add notification tracking columns
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS live_notification_sent BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN matches.reminder_sent IS 'Whether 15-minute reminder notification has been sent';
COMMENT ON COLUMN matches.live_notification_sent IS 'Whether live notification has been sent when match starts';

-- Create index for notification queries
CREATE INDEX IF NOT EXISTS idx_matches_notifications ON matches(reminder_sent, live_notification_sent, match_time, is_active);

-- Reset notification flags for existing matches (optional)
-- UPDATE matches SET reminder_sent = false, live_notification_sent = false WHERE match_time > NOW();