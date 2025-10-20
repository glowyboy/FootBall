/*
  # Admin Dashboard Schema - لوحة التحكم

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `image_url` (text)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `channels`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text) - YouTube, m3u8, Twitch
      - `stream_url` (text)
      - `logo_url` (text)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `matches`
      - `id` (uuid, primary key)
      - `title` (text)
      - `category_id` (uuid, foreign key)
      - `channel_id` (uuid, foreign key)
      - `opponent1_name` (text)
      - `opponent1_image` (text)
      - `opponent2_name` (text)
      - `opponent2_image` (text)
      - `match_time` (timestamptz)
      - `video_type` (text)
      - `live_url` (text)
      - `status` (text) - لم تبدأ بعد, جارية الآن, انتهت
      - `thumbnail_url` (text)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `ads_settings`
      - `id` (uuid, primary key)
      - `ad_status` (boolean)
      - `ad_network` (text)
      - `publisher_id` (text)
      - `banner_ad_id` (text)
      - `interstitial_ad_id` (text)
      - `updated_at` (timestamptz)
    
    - `app_settings`
      - `id` (uuid, primary key)
      - `app_name` (text)
      - `app_version` (text)
      - `support_email` (text)
      - `logo_url` (text)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated admin access
    - Restrict all operations to authenticated users only

  3. Important Notes
    - All tables use UUID primary keys with automatic generation
    - Timestamps are automatically managed
    - Foreign key constraints ensure data integrity
    - RLS policies ensure only authenticated users can access data
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create channels table
CREATE TABLE IF NOT EXISTS channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  stream_url text,
  logo_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  channel_id uuid REFERENCES channels(id) ON DELETE SET NULL,
  opponent1_name text NOT NULL,
  opponent1_image text,
  opponent2_name text NOT NULL,
  opponent2_image text,
  match_time timestamptz NOT NULL,
  video_type text NOT NULL,
  live_url text NOT NULL,
  status text DEFAULT 'لم تبدأ بعد',
  thumbnail_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ads_settings table
CREATE TABLE IF NOT EXISTS ads_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_status boolean DEFAULT false,
  ad_network text DEFAULT 'AdMob',
  publisher_id text,
  banner_ad_id text,
  interstitial_ad_id text,
  updated_at timestamptz DEFAULT now()
);

-- Create app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name text DEFAULT 'لوحة التحكم',
  app_version text DEFAULT '1.0.0',
  support_email text,
  logo_url text,
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Authenticated users can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Channels policies
CREATE POLICY "Authenticated users can view channels"
  ON channels FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert channels"
  ON channels FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update channels"
  ON channels FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete channels"
  ON channels FOR DELETE
  TO authenticated
  USING (true);

-- Matches policies
CREATE POLICY "Authenticated users can view matches"
  ON matches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update matches"
  ON matches FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete matches"
  ON matches FOR DELETE
  TO authenticated
  USING (true);

-- Ads settings policies
CREATE POLICY "Authenticated users can view ads settings"
  ON ads_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert ads settings"
  ON ads_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update ads settings"
  ON ads_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- App settings policies
CREATE POLICY "Authenticated users can view app settings"
  ON app_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert app settings"
  ON app_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update app settings"
  ON app_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default ads settings
INSERT INTO ads_settings (ad_status, ad_network)
VALUES (false, 'AdMob')
ON CONFLICT DO NOTHING;

-- Insert default app settings
INSERT INTO app_settings (app_name, app_version)
VALUES ('لوحة التحكم', '1.0.0')
ON CONFLICT DO NOTHING;