import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Category {
  id: string;
  name: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  name: string;
  type: string;
  stream_url: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  title: string;
  category_id: string | null;
  channel_id: string | null;
  opponent1_name: string;
  opponent1_image: string | null;
  opponent2_name: string;
  opponent2_image: string | null;
  match_time: string;
  video_type: string;
  live_url: string;
  live_url_low: string | null;
  live_url_high: string | null;
  status: string;
  thumbnail_url: string | null;
  reminder_sent: boolean;
  live_notification_sent: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdsSettings {
  id: string;
  ad_status: boolean;
  ad_network: string;
  publisher_id: string | null;
  banner_ad_id: string | null;
  interstitial_ad_id: string | null;
  updated_at: string;
}

export interface AppSettings {
  id: string;
  app_name: string;
  app_version: string;
  support_email: string | null;
  logo_url: string | null;
  updated_at: string;
}
