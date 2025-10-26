import { useState, useEffect } from 'react';
import { Save, DollarSign, Smartphone, Play, Gift } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdsSettings {
  id?: string;
  ads_enabled: boolean;
  selected_network: 'admob' | 'meta' | 'startapp' | 'unity' | 'startio';
  
  // Ad Types Control
  banner_enabled: boolean;
  interstitial_enabled: boolean;
  rewarded_enabled: boolean;
  
  // AdMob
  admob_enabled: boolean;
  admob_app_id: string;
  admob_banner_id: string;
  admob_interstitial_id: string;
  admob_rewarded_id: string;
  
  // Meta (Facebook)
  meta_enabled: boolean;
  meta_app_id: string;
  meta_banner_id: string;
  meta_interstitial_id: string;
  meta_rewarded_id: string;
  
  // StartApp
  startapp_enabled: boolean;
  startapp_app_id: string;
  startapp_banner_id: string;
  startapp_interstitial_id: string;
  startapp_rewarded_id: string;
  
  // Unity Ads
  unity_enabled: boolean;
  unity_game_id: string;
  unity_banner_id: string;
  unity_interstitial_id: string;
  unity_rewarded_id: string;
  
  // Start.io
  startio_enabled: boolean;
  startio_app_id: string;
  startio_banner_id: string;
  startio_interstitial_id: string;
  startio_rewarded_id: string;
}

const defaultSettings: AdsSettings = {
  ads_enabled: false,
  selected_network: 'admob',
  banner_enabled: true,
  interstitial_enabled: true,
  rewarded_enabled: false,
  admob_enabled: false,
  admob_app_id: '',
  admob_banner_id: '',
  admob_interstitial_id: '',
  admob_rewarded_id: '',
  meta_enabled: false,
  meta_app_id: '',
  meta_banner_id: '',
  meta_interstitial_id: '',
  meta_rewarded_id: '',
  startapp_enabled: false,
  startapp_app_id: '',
  startapp_banner_id: '',
  startapp_interstitial_id: '',
  startapp_rewarded_id: '',
  unity_enabled: false,
  unity_game_id: '',
  unity_banner_id: '',
  unity_interstitial_id: '',
  unity_rewarded_id: '',
  startio_enabled: false,
  startio_app_id: '',
  startio_banner_id: '',
  startio_interstitial_id: '',
  startio_rewarded_id: ''
};

export default function AdsPage() {
  const [settings, setSettings] = useState<AdsSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('ads_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading ads settings:', error);
      } else if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const settingsData = {
        ...settings,
        updated_at: new Date().toISOString()
      };

      if (settings.id) {
        // Update existing
        const { error } = await supabase
          .from('ads_settings')
          .update(settingsData)
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('ads_settings')
          .insert([settingsData])
          .select()
          .single();
        if (error) throw error;
        setSettings(data);
      }

      alert('✅ تم حفظ إعدادات الإعلانات بنجاح!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ فشل في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (field: keyof AdsSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>جاري تحميل إعدادات الإعلانات...</p>
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
            <h1 className="page-title">إدارة الإعلانات</h1>
            <p className="page-subtitle">تكوين شبكات الإعلانات وإدارة الإعدادات</p>
          </div>
        </div>
        <button onClick={saveSettings} disabled={saving} className="btn-primary">
          <Save size={20} />
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      <div className="ads-settings-grid">
        {/* Master Toggle */}
        <div className="settings-card">
          <h3 className="card-title">
            <DollarSign size={20} />
            حالة الإعلانات العامة
          </h3>
          <div className="toggle-container">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.ads_enabled}
                onChange={(e) => updateSettings('ads_enabled', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">
              {settings.ads_enabled ? '🟢 الإعلانات مفعلة' : '🔴 الإعلانات معطلة'}
            </span>
          </div>
        </div>

        {/* Ad Types Control */}
        <div className="settings-card">
          <h3 className="card-title">أنواع الإعلانات المفعلة</h3>
          <div className="ad-types-grid">
            <div className="ad-type-option">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.banner_enabled}
                  onChange={(e) => updateSettings('banner_enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
              <div className="ad-type-info">
                <span className="ad-type-name">🏷️ Banner Ads</span>
                <small>إعلانات البانر (أعلى/أسفل الشاشة)</small>
              </div>
            </div>
            
            <div className="ad-type-option">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.interstitial_enabled}
                  onChange={(e) => updateSettings('interstitial_enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
              <div className="ad-type-info">
                <span className="ad-type-name">📱 Interstitial Ads</span>
                <small>إعلانات ملء الشاشة</small>
              </div>
            </div>
            
            <div className="ad-type-option">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.rewarded_enabled}
                  onChange={(e) => updateSettings('rewarded_enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
              <div className="ad-type-info">
                <span className="ad-type-name">🎁 Rewarded Ads</span>
                <small>إعلانات المكافآت</small>
              </div>
            </div>
          </div>
        </div>

        {/* Network Selection */}
        <div className="settings-card">
          <h3 className="card-title">اختيار شبكة الإعلانات</h3>
          <div className="network-selector">
            <label className="network-option">
              <input
                type="radio"
                name="network"
                value="admob"
                checked={settings.selected_network === 'admob'}
                onChange={(e) => updateSettings('selected_network', e.target.value)}
              />
              <div className="network-card">
                <Smartphone size={24} />
                <span>AdMob</span>
                <small>Google</small>
              </div>
            </label>
            
            <label className="network-option">
              <input
                type="radio"
                name="network"
                value="meta"
                checked={settings.selected_network === 'meta'}
                onChange={(e) => updateSettings('selected_network', e.target.value)}
              />
              <div className="network-card">
                <Play size={24} />
                <span>Meta</span>
                <small>Facebook</small>
              </div>
            </label>
            
            <label className="network-option">
              <input
                type="radio"
                name="network"
                value="startapp"
                checked={settings.selected_network === 'startapp'}
                onChange={(e) => updateSettings('selected_network', e.target.value)}
              />
              <div className="network-card">
                <Gift size={24} />
                <span>StartApp</span>
                <small>StartApp</small>
              </div>
            </label>
            
            <label className="network-option">
              <input
                type="radio"
                name="network"
                value="unity"
                checked={settings.selected_network === 'unity'}
                onChange={(e) => updateSettings('selected_network', e.target.value)}
              />
              <div className="network-card">
                <Play size={24} />
                <span>Unity Ads</span>
                <small>Unity</small>
              </div>
            </label>
            
            <label className="network-option">
              <input
                type="radio"
                name="network"
                value="startio"
                checked={settings.selected_network === 'startio'}
                onChange={(e) => updateSettings('selected_network', e.target.value)}
              />
              <div className="network-card">
                <Smartphone size={24} />
                <span>Start.io</span>
                <small>Start.io</small>
              </div>
            </label>
          </div>
        </div>

        {/* AdMob Settings */}
        {settings.selected_network === 'admob' && (
          <div className="settings-card network-settings">
            <div className="network-header">
              <Smartphone size={24} />
              <h3>إعدادات AdMob</h3>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.admob_enabled}
                  onChange={(e) => updateSettings('admob_enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            {settings.admob_enabled && (
              <div className="network-inputs">
                <div className="input-group">
                  <label>App ID (Required)</label>
                  <input
                    type="text"
                    value={settings.admob_app_id}
                    onChange={(e) => updateSettings('admob_app_id', e.target.value)}
                    placeholder="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
                  />
                  <small>App ID ends with ~ (tilde)</small>
                </div>
                
                {settings.banner_enabled && (
                  <div className="input-group">
                    <label>Banner ID</label>
                    <input
                      type="text"
                      value={settings.admob_banner_id}
                      onChange={(e) => updateSettings('admob_banner_id', e.target.value)}
                      placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
                    />
                    <small>Banner ad unit ID</small>
                  </div>
                )}
                
                {settings.interstitial_enabled && (
                  <div className="input-group">
                    <label>Interstitial ID</label>
                    <input
                      type="text"
                      value={settings.admob_interstitial_id}
                      onChange={(e) => updateSettings('admob_interstitial_id', e.target.value)}
                      placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
                    />
                    <small>Interstitial ad unit ID</small>
                  </div>
                )}
                
                {settings.rewarded_enabled && (
                  <div className="input-group">
                    <label>Rewarded ID</label>
                    <input
                      type="text"
                      value={settings.admob_rewarded_id}
                      onChange={(e) => updateSettings('admob_rewarded_id', e.target.value)}
                      placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
                    />
                    <small>Rewarded ad unit ID</small>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Meta Settings */}
        {settings.selected_network === 'meta' && (
          <div className="settings-card network-settings">
            <div className="network-header">
              <Play size={24} />
              <h3>إعدادات Meta (Facebook)</h3>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.meta_enabled}
                  onChange={(e) => updateSettings('meta_enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            {settings.meta_enabled && (
              <div className="network-inputs">
                <div className="input-group">
                  <label>App ID</label>
                  <input
                    type="text"
                    value={settings.meta_app_id}
                    onChange={(e) => updateSettings('meta_app_id', e.target.value)}
                    placeholder="XXXXXXXXXXXXXXXX"
                  />
                </div>
                <div className="input-group">
                  <label>Banner Placement ID</label>
                  <input
                    type="text"
                    value={settings.meta_banner_id}
                    onChange={(e) => updateSettings('meta_banner_id', e.target.value)}
                    placeholder="XXXXXXXXXXXXXXXX_XXXXXXXXXX"
                  />
                </div>
                <div className="input-group">
                  <label>Interstitial Placement ID</label>
                  <input
                    type="text"
                    value={settings.meta_interstitial_id}
                    onChange={(e) => updateSettings('meta_interstitial_id', e.target.value)}
                    placeholder="XXXXXXXXXXXXXXXX_XXXXXXXXXX"
                  />
                </div>
                <div className="input-group">
                  <label>Rewarded Placement ID</label>
                  <input
                    type="text"
                    value={settings.meta_rewarded_id}
                    onChange={(e) => updateSettings('meta_rewarded_id', e.target.value)}
                    placeholder="XXXXXXXXXXXXXXXX_XXXXXXXXXX"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* StartApp Settings */}
        {settings.selected_network === 'startapp' && (
          <div className="settings-card network-settings">
            <div className="network-header">
              <Gift size={24} />
              <h3>إعدادات StartApp</h3>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.startapp_enabled}
                  onChange={(e) => updateSettings('startapp_enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            {settings.startapp_enabled && (
              <div className="network-inputs">
                <div className="input-group">
                  <label>App ID</label>
                  <input
                    type="text"
                    value={settings.startapp_app_id}
                    onChange={(e) => updateSettings('startapp_app_id', e.target.value)}
                    placeholder="XXXXXXXXX"
                  />
                </div>
                <div className="input-group">
                  <label>Banner ID</label>
                  <input
                    type="text"
                    value={settings.startapp_banner_id}
                    onChange={(e) => updateSettings('startapp_banner_id', e.target.value)}
                    placeholder="XXXXXXXXX"
                  />
                </div>
                <div className="input-group">
                  <label>Interstitial ID</label>
                  <input
                    type="text"
                    value={settings.startapp_interstitial_id}
                    onChange={(e) => updateSettings('startapp_interstitial_id', e.target.value)}
                    placeholder="XXXXXXXXX"
                  />
                </div>
                <div className="input-group">
                  <label>Rewarded ID</label>
                  <input
                    type="text"
                    value={settings.startapp_rewarded_id}
                    onChange={(e) => updateSettings('startapp_rewarded_id', e.target.value)}
                    placeholder="XXXXXXXXX"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Unity Ads Settings */}
        {settings.selected_network === 'unity' && (
          <div className="settings-card network-settings">
            <div className="network-header">
              <Play size={24} />
              <h3>إعدادات Unity Ads</h3>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.unity_enabled}
                  onChange={(e) => updateSettings('unity_enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            {settings.unity_enabled && (
              <div className="network-inputs">
                <div className="input-group">
                  <label>Game ID</label>
                  <input
                    type="text"
                    value={settings.unity_game_id}
                    onChange={(e) => updateSettings('unity_game_id', e.target.value)}
                    placeholder="1234567"
                  />
                  <small>Unity Game ID (numeric)</small>
                </div>
                
                {settings.banner_enabled && (
                  <div className="input-group">
                    <label>Banner Placement ID</label>
                    <input
                      type="text"
                      value={settings.unity_banner_id}
                      onChange={(e) => updateSettings('unity_banner_id', e.target.value)}
                      placeholder="banner"
                    />
                    <small>Banner placement name</small>
                  </div>
                )}
                
                {settings.interstitial_enabled && (
                  <div className="input-group">
                    <label>Interstitial Placement ID</label>
                    <input
                      type="text"
                      value={settings.unity_interstitial_id}
                      onChange={(e) => updateSettings('unity_interstitial_id', e.target.value)}
                      placeholder="interstitial"
                    />
                    <small>Interstitial placement name</small>
                  </div>
                )}
                
                {settings.rewarded_enabled && (
                  <div className="input-group">
                    <label>Rewarded Placement ID</label>
                    <input
                      type="text"
                      value={settings.unity_rewarded_id}
                      onChange={(e) => updateSettings('unity_rewarded_id', e.target.value)}
                      placeholder="rewardedVideo"
                    />
                    <small>Rewarded placement name</small>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Start.io Settings */}
        {settings.selected_network === 'startio' && (
          <div className="settings-card network-settings">
            <div className="network-header">
              <Smartphone size={24} />
              <h3>إعدادات Start.io</h3>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.startio_enabled}
                  onChange={(e) => updateSettings('startio_enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            {settings.startio_enabled && (
              <div className="network-inputs">
                <div className="input-group">
                  <label>App ID</label>
                  <input
                    type="text"
                    value={settings.startio_app_id}
                    onChange={(e) => updateSettings('startio_app_id', e.target.value)}
                    placeholder="123456789"
                  />
                  <small>Start.io App ID</small>
                </div>
                
                {settings.banner_enabled && (
                  <div className="input-group">
                    <label>Banner Ad ID</label>
                    <input
                      type="text"
                      value={settings.startio_banner_id}
                      onChange={(e) => updateSettings('startio_banner_id', e.target.value)}
                      placeholder="banner320x50"
                    />
                    <small>Banner ad unit name</small>
                  </div>
                )}
                
                {settings.interstitial_enabled && (
                  <div className="input-group">
                    <label>Interstitial Ad ID</label>
                    <input
                      type="text"
                      value={settings.startio_interstitial_id}
                      onChange={(e) => updateSettings('startio_interstitial_id', e.target.value)}
                      placeholder="interstitial"
                    />
                    <small>Interstitial ad unit name</small>
                  </div>
                )}
                
                {settings.rewarded_enabled && (
                  <div className="input-group">
                    <label>Rewarded Ad ID</label>
                    <input
                      type="text"
                      value={settings.startio_rewarded_id}
                      onChange={(e) => updateSettings('startio_rewarded_id', e.target.value)}
                      placeholder="rewarded"
                    />
                    <small>Rewarded ad unit name</small>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Help Card */}
        <div className="settings-card help-card">
          <h3 className="card-title">📚 كيفية الحصول على معرفات الإعلانات</h3>
          <div className="help-content">
            <div className="help-section">
              <h4>AdMob (Google):</h4>
              <ol>
                <li>انتقل إلى <a href="https://admob.google.com" target="_blank" rel="noopener noreferrer">AdMob Console</a></li>
                <li>أضف تطبيقك أو اختر تطبيق موجود</li>
                <li>انتقل إلى "Ad units" وأنشئ وحدات إعلانية</li>
                <li>انسخ معرفات الوحدات الإعلانية</li>
              </ol>
            </div>
            
            <div className="help-section">
              <h4>Meta (Facebook):</h4>
              <ol>
                <li>انتقل إلى <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer">Facebook Developers</a></li>
                <li>أنشئ تطبيقاً جديداً أو اختر موجود</li>
                <li>أضف منتج "Audience Network"</li>
                <li>أنشئ Placement IDs للإعلانات</li>
              </ol>
            </div>
            
            <div className="help-section">
              <h4>StartApp:</h4>
              <ol>
                <li>انتقل إلى <a href="https://portal.start.io" target="_blank" rel="noopener noreferrer">StartApp Portal</a></li>
                <li>أنشئ حساباً جديداً</li>
                <li>أضف تطبيقك واحصل على App ID</li>
                <li>أنشئ Ad Units للأنواع المختلفة</li>
              </ol>
            </div>
            
            <div className="help-section">
              <h4>Unity Ads:</h4>
              <ol>
                <li>انتقل إلى <a href="https://dashboard.unity3d.com" target="_blank" rel="noopener noreferrer">Unity Dashboard</a></li>
                <li>أنشئ مشروعاً جديداً أو اختر موجود</li>
                <li>فعّل Unity Ads في الإعدادات</li>
                <li>احصل على Game ID وأنشئ Placement IDs</li>
              </ol>
            </div>
            
            <div className="help-section">
              <h4>Start.io:</h4>
              <ol>
                <li>انتقل إلى <a href="https://www.start.io" target="_blank" rel="noopener noreferrer">Start.io</a></li>
                <li>سجّل كناشر (Publisher)</li>
                <li>أضف تطبيقك واحصل على App ID</li>
                <li>أنشئ وحدات إعلانية مختلفة</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}