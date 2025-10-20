import { useState, useEffect } from 'react';
import { Save, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdsSettings {
  id: string;
  ad_status: boolean;
  ad_network: string;
  publisher_id: string;
  banner_ad_id: string;
  interstitial_ad_id: string;
  rewarded_ad_id?: string;
  native_ad_id?: string;
  app_open_ad_id?: string;
  banner_frequency?: number;
  interstitial_frequency?: number;
  show_banner_on_home?: boolean;
  show_banner_on_categories?: boolean;
  show_banner_on_channels?: boolean;
  show_banner_on_matches?: boolean;
  show_interstitial_on_navigation?: boolean;
  show_interstitial_before_video?: boolean;
  test_mode?: boolean;
}

export default function AdsPage() {
  const [settings, setSettings] = useState<AdsSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('ads_settings').select('*').single();
      if (data) setSettings(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('ads_settings')
        .update({ ...settings, updated_at: new Date().toISOString() })
        .eq('id', settings.id);
      if (error) throw error;
      alert('✅ تم حفظ الإعدادات بنجاح!');
    } catch (error) {
      console.error('Error:', error);
      alert('❌ فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <DollarSign className="page-icon" size={32} />
          <div>
            <h1 className="page-title">إعدادات الإعلانات</h1>
            <p className="page-subtitle">إدارة شبكات الإعلانات والوحدات الإعلانية</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          <Save size={20} />
          {saving ? 'جاري الحفظ...' : 'حفظ'}
        </button>
      </div>

      <div className="ads-compact-grid">
        {/* Status & Network */}
        <div className="settings-card-compact">
          <h3 className="card-title-compact">الحالة والشبكة</h3>
          <div className="form-group-compact">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.ad_status}
                onChange={(e) => setSettings({ ...settings, ad_status: e.target.checked })}
                className="toggle-checkbox"
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">{settings.ad_status ? 'مفعل' : 'معطل'}</span>
            </label>
          </div>
          <div className="form-group-compact">
            <label>الشبكة</label>
            <select
              value={settings.ad_network}
              onChange={(e) => setSettings({ ...settings, ad_network: e.target.value })}
              className="form-select-compact"
            >
              <option value="AdMob">AdMob</option>
              <option value="Facebook">Facebook</option>
              <option value="Unity">Unity</option>
              <option value="AppLovin">AppLovin</option>
              <option value="IronSource">IronSource</option>
            </select>
          </div>
        </div>

        {/* Publisher ID */}
        <div className="settings-card-compact">
          <h3 className="card-title-compact">معرف الناشر</h3>
          <input
            type="text"
            value={settings.publisher_id || ''}
            onChange={(e) => setSettings({ ...settings, publisher_id: e.target.value })}
            placeholder="ca-app-pub-XXXXXXXX~YYYYYY"
            className="form-input-compact"
          />
        </div>

        {/* Banner Ad */}
        <div className="settings-card-compact">
          <h3 className="card-title-compact">إعلان البانر</h3>
          <input
            type="text"
            value={settings.banner_ad_id || ''}
            onChange={(e) => setSettings({ ...settings, banner_ad_id: e.target.value })}
            placeholder="ca-app-pub-XXXXXXXX/111111"
            className="form-input-compact"
          />
          <div className="form-group-compact">
            <label>التكرار</label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.banner_frequency || 1}
              onChange={(e) => setSettings({ ...settings, banner_frequency: parseInt(e.target.value) })}
              className="form-input-compact"
            />
          </div>
        </div>

        {/* Interstitial Ad */}
        <div className="settings-card-compact">
          <h3 className="card-title-compact">الإعلان البيني</h3>
          <input
            type="text"
            value={settings.interstitial_ad_id || ''}
            onChange={(e) => setSettings({ ...settings, interstitial_ad_id: e.target.value })}
            placeholder="ca-app-pub-XXXXXXXX/222222"
            className="form-input-compact"
          />
          <div className="form-group-compact">
            <label>التكرار</label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.interstitial_frequency || 3}
              onChange={(e) => setSettings({ ...settings, interstitial_frequency: parseInt(e.target.value) })}
              className="form-input-compact"
            />
          </div>
        </div>

        {/* Rewarded Ad */}
        <div className="settings-card-compact">
          <h3 className="card-title-compact">إعلان المكافأة</h3>
          <input
            type="text"
            value={settings.rewarded_ad_id || ''}
            onChange={(e) => setSettings({ ...settings, rewarded_ad_id: e.target.value })}
            placeholder="ca-app-pub-XXXXXXXX/333333"
            className="form-input-compact"
          />
        </div>

        {/* Native Ad */}
        <div className="settings-card-compact">
          <h3 className="card-title-compact">الإعلان الأصلي</h3>
          <input
            type="text"
            value={settings.native_ad_id || ''}
            onChange={(e) => setSettings({ ...settings, native_ad_id: e.target.value })}
            placeholder="ca-app-pub-XXXXXXXX/444444"
            className="form-input-compact"
          />
        </div>

        {/* App Open Ad */}
        <div className="settings-card-compact">
          <h3 className="card-title-compact">إعلان فتح التطبيق</h3>
          <input
            type="text"
            value={settings.app_open_ad_id || ''}
            onChange={(e) => setSettings({ ...settings, app_open_ad_id: e.target.value })}
            placeholder="ca-app-pub-XXXXXXXX/555555"
            className="form-input-compact"
          />
        </div>

        {/* Banner Placement */}
        <div className="settings-card-compact">
          <h3 className="card-title-compact">أماكن البانر</h3>
          <div className="checkbox-group-compact">
            <label className="checkbox-label-compact">
              <input
                type="checkbox"
                checked={settings.show_banner_on_home ?? true}
                onChange={(e) => setSettings({ ...settings, show_banner_on_home: e.target.checked })}
              />
              <span>الرئيسية</span>
            </label>
            <label className="checkbox-label-compact">
              <input
                type="checkbox"
                checked={settings.show_banner_on_categories ?? true}
                onChange={(e) => setSettings({ ...settings, show_banner_on_categories: e.target.checked })}
              />
              <span>التصنيفات</span>
            </label>
            <label className="checkbox-label-compact">
              <input
                type="checkbox"
                checked={settings.show_banner_on_channels ?? true}
                onChange={(e) => setSettings({ ...settings, show_banner_on_channels: e.target.checked })}
              />
              <span>القنوات</span>
            </label>
            <label className="checkbox-label-compact">
              <input
                type="checkbox"
                checked={settings.show_banner_on_matches ?? true}
                onChange={(e) => setSettings({ ...settings, show_banner_on_matches: e.target.checked })}
              />
              <span>المباريات</span>
            </label>
          </div>
        </div>

        {/* Interstitial Placement */}
        <div className="settings-card-compact">
          <h3 className="card-title-compact">أماكن الإعلان البيني</h3>
          <div className="checkbox-group-compact">
            <label className="checkbox-label-compact">
              <input
                type="checkbox"
                checked={settings.show_interstitial_on_navigation ?? true}
                onChange={(e) => setSettings({ ...settings, show_interstitial_on_navigation: e.target.checked })}
              />
              <span>عند التنقل</span>
            </label>
            <label className="checkbox-label-compact">
              <input
                type="checkbox"
                checked={settings.show_interstitial_before_video ?? false}
                onChange={(e) => setSettings({ ...settings, show_interstitial_before_video: e.target.checked })}
              />
              <span>قبل الفيديو</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
