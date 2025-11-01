import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AppSettings {
  id?: string;
  player_download_url: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    player_download_url: 'https://play.google.com/store/apps',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      console.log('🔄 Loading settings from database...');
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1);

      console.log('📊 Load response:', { data, error });

      if (error) {
        console.error('Error loading settings:', error);
      } else if (data && data.length > 0) {
        console.log('✅ Found existing settings:', data[0]);
        setSettings(data[0]);
      } else {
        console.log('⚠️ No settings found, will create new one');
        // Keep default settings for new creation
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('💾 Saving settings:', settings);

      // Always try to get the first record and update it
      const { data: existingData, error: fetchError } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1);

      console.log('📊 Existing data check:', { existingData, fetchError });

      if (existingData && existingData.length > 0) {
        // Update the existing record
        const existingRecord = existingData[0];
        console.log('🔄 Updating existing record with ID:', existingRecord.id);
        
        const { data, error } = await supabase
          .from('app_settings')
          .update({ 
            player_download_url: settings.player_download_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRecord.id)
          .select();

        console.log('📊 Update response:', { data, error });
        if (error) throw error;
        
        if (data && data.length > 0) {
          setSettings(data[0]);
        }
      } else {
        // Create new record (shouldn't happen with the SQL default insert)
        console.log('➕ Creating new record');
        const { data, error } = await supabase
          .from('app_settings')
          .insert([{ player_download_url: settings.player_download_url }])
          .select()
          .single();

        console.log('📊 Insert response:', { data, error });
        if (error) throw error;
        if (data) setSettings(data);
      }

      console.log('✅ Settings saved successfully!');
      alert('✅ Settings saved successfully!');
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      alert(`❌ Failed to save settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">⚙️ App Settings</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '40px', color: '#03DA9D' }}>
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">⚙️ App Settings</h1>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="settings-card">
        <h2 className="section-title">Player App Download Link</h2>
        <p className="section-description">
          This link will be shown to users when they try to watch a match but don't have the Football Player app installed.
        </p>

        <div className="form-group">
          <label className="form-label">
            Google Play Store URL
          </label>
          <input
            type="url"
            value={settings.player_download_url}
            onChange={(e) => setSettings({ ...settings, player_download_url: e.target.value })}
            placeholder="https://play.google.com/store/apps/details?id=com.footballlive.player"
            className="form-input"
            style={{ color: '#000000' }}
          />
          <small className="form-hint">
            Enter the full Google Play Store URL for your Football Player app
          </small>
        </div>

        <div className="info-box">
          <h4>📱 How to get your app's Play Store URL:</h4>
          <ol style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>Publish your Football Player app to Google Play Store</li>
            <li>Go to your app's page on Play Store</li>
            <li>Copy the URL (it will look like: https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME)</li>
            <li>Paste it here</li>
          </ol>
          <p style={{ marginTop: '10px', color: '#03DA9D' }}>
            <strong>Current package name:</strong> com.footballlive.player
          </p>
        </div>
      </div>
    </div>
  );
}
