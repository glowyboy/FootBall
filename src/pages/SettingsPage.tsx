import { useState, useEffect } from 'react';
import { supabase, AppSettings } from '../lib/supabase';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    app_name: '',
    app_version: '',
    support_email: '',
    logo_url: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase.from('app_settings').select('*').maybeSingle();
    if (data) {
      setSettings(data);
      setFormData({
        app_name: data.app_name,
        app_version: data.app_version,
        support_email: data.support_email || '',
        logo_url: data.logo_url || '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (settings) {
        await supabase
          .from('app_settings')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', settings.id);
      } else {
        await supabase.from('app_settings').insert([formData]);
      }
      await loadSettings();
      alert('تم حفظ الإعدادات بنجاح!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">إعدادات التطبيق</h1>
      </div>

      <div className="settings-container">
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="settings-card">
            <h2 className="card-title">المعلومات الأساسية</h2>

            <div className="form-group">
              <label>اسم التطبيق</label>
              <input
                type="text"
                value={formData.app_name}
                onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>إصدار التطبيق</label>
              <input
                type="text"
                value={formData.app_version}
                onChange={(e) => setFormData({ ...formData, app_version: e.target.value })}
                required
                placeholder="1.0.0"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>البريد الإلكتروني للدعم</label>
              <input
                type="email"
                value={formData.support_email}
                onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                placeholder="support@example.com"
                className="form-input"
              />
            </div>
          </div>

          <div className="settings-card">
            <h2 className="card-title">الشعار</h2>

            <div className="form-group">
              <label>رابط شعار التطبيق</label>
              <input
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="form-input"
              />
            </div>

            {formData.logo_url && (
              <div className="logo-preview">
                <img src={formData.logo_url} alt="App Logo" />
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-submit large">
            {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </form>
      </div>
    </div>
  );
}
