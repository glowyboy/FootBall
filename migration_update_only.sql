-- SAFE MIGRATION: Only add new columns and indexes
-- Run this in your Supabase SQL editor instead of the full schema

-- Add quality URL columns to matches table (if they don't exist)
DO $$ 
BEGIN
    -- Add live_url_low column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'matches' AND column_name = 'live_url_low') THEN
        ALTER TABLE matches ADD COLUMN live_url_low TEXT;
    END IF;
    
    -- Add live_url_high column  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'matches' AND column_name = 'live_url_high') THEN
        ALTER TABLE matches ADD COLUMN live_url_high TEXT;
    END IF;
    
    -- Add notification tracking columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'matches' AND column_name = 'reminder_sent') THEN
        ALTER TABLE matches ADD COLUMN reminder_sent BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'matches' AND column_name = 'live_notification_sent') THEN
        ALTER TABLE matches ADD COLUMN live_notification_sent BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add indexes (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_matches_notifications ON matches(reminder_sent, live_notification_sent, match_time, is_active);

-- Add comments for documentation
COMMENT ON COLUMN matches.live_url_low IS 'Low quality streaming URL (optional)';
COMMENT ON COLUMN matches.live_url_high IS 'High quality streaming URL (optional)';
COMMENT ON COLUMN matches.reminder_sent IS 'Whether 15-minute reminder notification has been sent';
COMMENT ON COLUMN matches.live_notification_sent IS 'Whether live notification has been sent when match starts';

-- Reset notification flags for future matches (optional)
UPDATE matches 
SET reminder_sent = false, live_notification_sent = false 
WHERE match_time > NOW() AND is_active = true;