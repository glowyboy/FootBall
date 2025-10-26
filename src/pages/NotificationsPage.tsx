import { useState, useEffect } from 'react';
import { Send, Users, Bell } from 'lucide-react';
import { adminNotificationService } from '../services/notificationService';

export default function NotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, recentNotifications: [] });
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    image_url: '',
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const notificationStats = await adminNotificationService.getNotificationStats();
      setStats(notificationStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await adminNotificationService.sendCustomNotification(
        formData.title,
        formData.message
      );

      if (result.success) {
        setFormData({ title: '', message: '', image_url: '' });
        await loadStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      alert('فشل في إرسال الإشعار');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">إرسال إشعارات</h1>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users />
          </div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>إجمالي المستخدمين</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Bell />
          </div>
          <div className="stat-content">
            <h3>{stats.recentNotifications.length}</h3>
            <p>الإشعارات الأخيرة</p>
          </div>
        </div>
      </div>



      <div className="notification-card">
        <form onSubmit={handleSubmit} className="notification-form">
          <div className="form-group">
            <label>عنوان الإشعار</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="أدخل عنوان الإشعار"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>نص الإشعار</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              placeholder="أدخل نص الإشعار"
              rows={6}
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label>رابط الصورة (اختياري)</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="form-input"
            />
          </div>

          {formData.image_url && (
            <div className="notification-preview">
              <h3>معاينة الإشعار</h3>
              <div className="preview-card">
                <img src={formData.image_url} alt="Preview" />
                <div className="preview-content">
                  <h4>{formData.title || 'عنوان الإشعار'}</h4>
                  <p>{formData.message || 'نص الإشعار'}</p>
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-submit large">
            <Send className="btn-icon" />
            {loading ? 'جاري الإرسال...' : 'إرسال الإشعار'}
          </button>
        </form>
      </div>
    </div>
  );
}