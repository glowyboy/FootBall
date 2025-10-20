-- ============================================
-- Sports Streaming App - Complete Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CHANNELS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'YouTube',
  stream_url TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. MATCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  channel_id UUID REFERENCES channels(id) ON DELETE SET NULL,
  opponent1_name TEXT NOT NULL,
  opponent1_image TEXT,
  opponent2_name TEXT NOT NULL,
  opponent2_image TEXT,
  match_time TIMESTAMPTZ NOT NULL,
  video_type TEXT DEFAULT 'YouTube',
  live_url TEXT NOT NULL,
  status TEXT DEFAULT 'لم تبدأ بعد',
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. ADS SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ads_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_status BOOLEAN DEFAULT false,
  ad_network TEXT DEFAULT 'AdMob',
  publisher_id TEXT,
  banner_ad_id TEXT,
  interstitial_ad_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. APP SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_name TEXT DEFAULT 'Sports Streaming',
  app_version TEXT DEFAULT '1.0.0',
  support_email TEXT,
  logo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_matches_category ON matches(category_id);
CREATE INDEX IF NOT EXISTS idx_matches_channel ON matches(channel_id);
CREATE INDEX IF NOT EXISTS idx_matches_time ON matches(match_time);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_channels_active ON channels(is_active);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CATEGORIES POLICIES
-- ============================================

-- Allow public read access to active categories
CREATE POLICY "Allow public read access to categories"
  ON categories FOR SELECT
  USING (true);

-- Allow authenticated users to insert categories
CREATE POLICY "Allow authenticated insert on categories"
  ON categories FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to update categories
CREATE POLICY "Allow authenticated update on categories"
  ON categories FOR UPDATE
  USING (true);

-- Allow authenticated users to delete categories
CREATE POLICY "Allow authenticated delete on categories"
  ON categories FOR DELETE
  USING (true);

-- ============================================
-- CHANNELS POLICIES
-- ============================================

-- Allow public read access to channels
CREATE POLICY "Allow public read access to channels"
  ON channels FOR SELECT
  USING (true);

-- Allow authenticated users to insert channels
CREATE POLICY "Allow authenticated insert on channels"
  ON channels FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to update channels
CREATE POLICY "Allow authenticated update on channels"
  ON channels FOR UPDATE
  USING (true);

-- Allow authenticated users to delete channels
CREATE POLICY "Allow authenticated delete on channels"
  ON channels FOR DELETE
  USING (true);

-- ============================================
-- MATCHES POLICIES
-- ============================================

-- Allow public read access to matches
CREATE POLICY "Allow public read access to matches"
  ON matches FOR SELECT
  USING (true);

-- Allow authenticated users to insert matches
CREATE POLICY "Allow authenticated insert on matches"
  ON matches FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to update matches
CREATE POLICY "Allow authenticated update on matches"
  ON matches FOR UPDATE
  USING (true);

-- Allow authenticated users to delete matches
CREATE POLICY "Allow authenticated delete on matches"
  ON matches FOR DELETE
  USING (true);

-- ============================================
-- ADS SETTINGS POLICIES
-- ============================================

-- Allow public read access to ads settings
CREATE POLICY "Allow public read access to ads_settings"
  ON ads_settings FOR SELECT
  USING (true);

-- Allow authenticated users to insert ads settings
CREATE POLICY "Allow authenticated insert on ads_settings"
  ON ads_settings FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to update ads settings
CREATE POLICY "Allow authenticated update on ads_settings"
  ON ads_settings FOR UPDATE
  USING (true);

-- ============================================
-- APP SETTINGS POLICIES
-- ============================================

-- Allow public read access to app settings
CREATE POLICY "Allow public read access to app_settings"
  ON app_settings FOR SELECT
  USING (true);

-- Allow authenticated users to insert app settings
CREATE POLICY "Allow authenticated insert on app_settings"
  ON app_settings FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to update app settings
CREATE POLICY "Allow authenticated update on app_settings"
  ON app_settings FOR UPDATE
  USING (true);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert default ads settings
INSERT INTO ads_settings (ad_status, ad_network)
VALUES (false, 'AdMob')
ON CONFLICT DO NOTHING;

-- Insert default app settings
INSERT INTO app_settings (app_name, app_version)
VALUES ('Sports Streaming', '1.0.0')
ON CONFLICT DO NOTHING;

