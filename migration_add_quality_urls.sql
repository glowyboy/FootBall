-- Migration to add quality URL columns to matches table
-- Run this in your Supabase SQL editor

-- Add new columns for different quality URLs
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS live_url_low TEXT,
ADD COLUMN IF NOT EXISTS live_url_medium TEXT,
ADD COLUMN IF NOT EXISTS live_url_high TEXT;

-- Add comments for documentation
COMMENT ON COLUMN matches.live_url IS 'Original/default streaming URL';
COMMENT ON COLUMN matches.live_url_low IS 'Low quality streaming URL (optional)';
COMMENT ON COLUMN matches.live_url_medium IS 'Medium quality streaming URL (optional)';
COMMENT ON COLUMN matches.live_url_high IS 'High quality streaming URL (optional)';

-- Update existing matches to have the original URL as default if needed
-- (This is optional and only if you want to populate existing data)
-- UPDATE matches SET live_url_low = live_url WHERE live_url_low IS NULL;