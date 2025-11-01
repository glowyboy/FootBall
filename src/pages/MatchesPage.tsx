import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Upload, Calendar, RefreshCw } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { supabase, Match, Category, Channel } from '../lib/supabase';
import { adminNotificationService } from '../services/notificationService';

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    channel_id: '',
    opponent1_name: '',
    opponent1_image: '',
    opponent2_name: '',
    opponent2_image: '',
    match_time: '',
    video_type: 'YouTube',
    live_url: '',
    live_url_low: '',
    live_url_high: '',
    status: 'لم تبدأ بعد',
    thumbnail_url: '',
  });

  const [uploading, setUploading] = useState({
    opponent1: false,
    opponent2: false,
  });

  useEffect(() => {
    loadMatches();
    loadCategories();
    loadChannels();
    
    // Start notification scheduler
    adminNotificationService.startNotificationScheduler();
  }, []);

  const loadMatches = async () => {
    const { data } = await supabase
      .from('matches')
      .select('*')
      .order('match_time', { ascending: false });
    if (data) setMatches(data);
  };

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').eq('is_active', true);
    if (data) setCategories(data);
  };

  const loadChannels = async () => {
    const { data } = await supabase.from('channels').select('*').eq('is_active', true);
    if (data) setChannels(data);
  };

  const openModal = (match?: Match) => {
    if (match) {
      setEditingMatch(match);
      setFormData({
        title: match.title,
        category_id: match.category_id || '',
        channel_id: match.channel_id || '',
        opponent1_name: match.opponent1_name,
        opponent1_image: match.opponent1_image || '',
        opponent2_name: match.opponent2_name,
        opponent2_image: match.opponent2_image || '',
        match_time: match.match_time.slice(0, 16),
        video_type: match.video_type,
        live_url: match.live_url,
        live_url_low: match.live_url_low || '',
        live_url_high: match.live_url_high || '',
        status: match.status,
        thumbnail_url: match.thumbnail_url || '',
      });
    } else {
      setEditingMatch(null);
      setFormData({
        title: '',
        category_id: '',
        channel_id: '',
        opponent1_name: '',
        opponent1_image: '',
        opponent2_name: '',
        opponent2_image: '',
        match_time: '',
        video_type: 'YouTube',
        live_url: '',
        live_url_low: '',
        live_url_high: '',
        status: 'لم تبدأ بعد',
        thumbnail_url: '',
      });
    }
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'opponent1' | 'opponent2') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading({ ...uploading, [type]: true });
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `matches/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          upsert: true // This allows overwriting existing files
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      if (type === 'opponent1') {
        setFormData({ ...formData, opponent1_image: publicUrl });
      } else {
        setFormData({ ...formData, opponent2_image: publicUrl });
      }
    } catch (error) {
      alert('فشل رفع الصورة. تأكد من إنشاء bucket باسم "images" في Supabase Storage');
      console.error('Upload error:', error);
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingMatch) {
        await supabase
          .from('matches')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingMatch.id);
        
        // If match was changed to live, send immediate notification
        if (formData.status === 'جارية الآن' && editingMatch.status !== 'جارية الآن') {
          console.log('Match went live, sending notification...');
          
          // Use the same method as Notifications tab (which works!)
          const { adminNotificationService } = await import('../services/notificationService');
          await adminNotificationService.sendCustomNotification(
            `${editingMatch.title || 'المباراة بدأت'} ⚽`,
            `${editingMatch.opponent1_name} VS ${editingMatch.opponent2_name} - مباشر الآن`
          );
          
          // Mark as sent
          await supabase
            .from('matches')
            .update({ live_notification_sent: true })
            .eq('id', editingMatch.id);
        }
      } else {
        await supabase.from('matches').insert([formData]);
      }
      await loadMatches();
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المباراة؟')) {
      await supabase.from('matches').delete().eq('id', id);
      await loadMatches();
    }
  };

  // Call Edge Function for auto-update + notifications
  const callEdgeFunction = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      const result = await response.json();
      console.log('Edge Function Result:', result);
      return result;
    } catch (error) {
      console.error('Edge Function Error:', error);
      return null;
    }
  };

  const updateMatchStatuses = async () => {
    setLoading(true);
    try {
      // Trigger immediate notification via Edge Function
      await callEdgeFunction();
      // Reload matches
      await loadMatches();
      
      alert('تم تحديث قائمة المباريات');
    } catch (error) {
      console.error('Error:', error);
      alert('خطأ في تحديث حالات المباريات');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    if (status === 'جارية الآن') return 'status-live';
    if (status === 'انتهت') return 'status-ended';
    return 'status-upcoming';
  };

  const isMatchLiveNow = (matchTime: string) => {
    const now = new Date();
    const matchDate = new Date(matchTime);
    const diffMinutes = (now.getTime() - matchDate.getTime()) / (1000 * 60);
    return diffMinutes >= 0 && diffMinutes <= 120; // Live if within 2 hours of start time
  };

  const groupMatchesByDate = () => {
    const grouped: { [key: string]: Match[] } = {};
    matches.forEach((match) => {
      const date = new Date(match.match_time).toLocaleDateString('en-GB');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(match);
    });
    
    // Sort dates descending (newest first)
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      return new Date(b.split('/').reverse().join('-')).getTime() - 
             new Date(a.split('/').reverse().join('-')).getTime();
    });

    // Sort matches within each date by time
    sortedDates.forEach(date => {
      grouped[date].sort((a, b) => 
        new Date(a.match_time).getTime() - new Date(b.match_time).getTime()
      );
    });

    return { grouped, sortedDates };
  };

  const { grouped, sortedDates } = groupMatchesByDate();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">إدارة المباريات</h1>
        <div className="flex gap-3">
          <button 
            onClick={updateMatchStatuses} 
            disabled={loading}
            className="btn-secondary"
          >
            <RefreshCw className={`btn-icon ${loading ? 'animate-spin' : ''}`} />
            تحديث حالات المباريات
          </button>
          <button onClick={() => openModal()} className="btn-primary">
            <Plus className="btn-icon" />
            إضافة مباراة جديدة
          </button>
        </div>
      </div>

      <div className="matches-timeline">
        {sortedDates.map((date) => (
          <div key={date} className="date-group">
            <div className="date-header">
              <h3>{date}</h3>
            </div>
            <div className="matches-list">
              {grouped[date].map((match) => (
                <div key={match.id} className="match-row">
                  {isMatchLiveNow(match.match_time) && (
                    <div className="live-indicator" title="المباراة جارية الآن!">
                      <div className="live-pulse"></div>
                    </div>
                  )}
                  
                  <div className="match-time-col">
                    <span className="time-display">
                      {new Date(match.match_time).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: false 
                      })}
                    </span>
                  </div>

                  <div className="match-teams">
                    <div className="team">
                      {match.opponent1_image && (
                        <img src={match.opponent1_image} alt={match.opponent1_name} className="team-logo" />
                      )}
                      <span className="team-name">{match.opponent1_name}</span>
                    </div>
                    <span className="vs-text">VS</span>
                    <div className="team">
                      {match.opponent2_image && (
                        <img src={match.opponent2_image} alt={match.opponent2_name} className="team-logo" />
                      )}
                      <span className="team-name">{match.opponent2_name}</span>
                    </div>
                  </div>

                  <div className="match-status-col">
                    <span className={`status-badge ${getStatusClass(match.status)}`}>
                      {match.status}
                    </span>
                    <div className="notification-indicators" style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                      {match.reminder_sent && (
                        <span title="تم إرسال تذكير" style={{ fontSize: '12px' }}>🔔</span>
                      )}
                      {match.live_notification_sent && (
                        <span title="تم إرسال إشعار البث المباشر" style={{ fontSize: '12px' }}>📺</span>
                      )}
                    </div>
                  </div>

                  <div className="match-actions-col">
                    <button onClick={() => openModal(match)} className="btn-icon-action">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(match.id)} className="btn-icon-action danger">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingMatch ? 'تعديل المباراة' : 'إضافة مباراة جديدة'}</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>عنوان المباراة</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>التصنيف</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="form-select"
                  >
                    <option value="">اختر التصنيف</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>القناة</label>
                  <select
                    value={formData.channel_id}
                    onChange={(e) => setFormData({ ...formData, channel_id: e.target.value })}
                    className="form-select"
                  >
                    <option value="">اختر القناة</option>
                    {channels.map((channel) => (
                      <option key={channel.id} value={channel.id}>
                        {channel.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>الفريق الأول</label>
                  <input
                    type="text"
                    value={formData.opponent1_name}
                    onChange={(e) => setFormData({ ...formData, opponent1_name: e.target.value })}
                    required
                    placeholder="اسم الفريق الأول"
                    className="form-input"
                  />
                  <label style={{ marginTop: '10px', display: 'block' }}>صورة الفريق الأول</label>
                  <div className="custom-file-upload">
                    <input
                      type="file"
                      id="opponent1-upload"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'opponent1')}
                      disabled={uploading.opponent1}
                    />
                    <label 
                      htmlFor="opponent1-upload" 
                      className={`file-upload-label ${formData.opponent1_image ? 'has-file' : ''} ${uploading.opponent1 ? 'uploading' : ''}`}
                    >
                      <Upload size={20} />
                      {uploading.opponent1 ? 'جاري رفع الصورة...' : formData.opponent1_image ? 'تم اختيار الصورة ✓' : 'اختر صورة الفريق'}
                    </label>
                  </div>
                  {formData.opponent1_image && (
                    <div className="image-preview-small">
                      <img src={formData.opponent1_image} alt="Preview" />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>الفريق الثاني</label>
                  <input
                    type="text"
                    value={formData.opponent2_name}
                    onChange={(e) => setFormData({ ...formData, opponent2_name: e.target.value })}
                    required
                    placeholder="اسم الفريق الثاني"
                    className="form-input"
                  />
                  <label style={{ marginTop: '10px', display: 'block' }}>صورة الفريق الثاني</label>
                  <div className="custom-file-upload">
                    <input
                      type="file"
                      id="opponent2-upload"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'opponent2')}
                      disabled={uploading.opponent2}
                    />
                    <label 
                      htmlFor="opponent2-upload" 
                      className={`file-upload-label ${formData.opponent2_image ? 'has-file' : ''} ${uploading.opponent2 ? 'uploading' : ''}`}
                    >
                      <Upload size={20} />
                      {uploading.opponent2 ? 'جاري رفع الصورة...' : formData.opponent2_image ? 'تم اختيار الصورة ✓' : 'اختر صورة الفريق'}
                    </label>
                  </div>
                  {formData.opponent2_image && (
                    <div className="image-preview-small">
                      <img src={formData.opponent2_image} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>وقت المباراة</label>
                <div className="custom-datepicker-wrapper">
                  <Calendar className="datepicker-icon" size={20} />
                  <DatePicker
                    selected={formData.match_time ? new Date(formData.match_time) : null}
                    onChange={(date) => {
                      if (date) {
                        // Format as local datetime string (YYYY-MM-DD HH:MM:SS)
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const hours = String(date.getHours()).padStart(2, '0');
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        const localDateTime = `${year}-${month}-${day} ${hours}:${minutes}:00`;
                        setFormData({ ...formData, match_time: localDateTime });
                      } else {
                        setFormData({ ...formData, match_time: '' });
                      }
                    }}
                    showTimeInput
                    timeInputLabel="الوقت:"
                    dateFormat="dd/MM/yyyy HH:mm"
                    placeholderText="اختر تاريخ ووقت المباراة"
                    required
                    className="custom-datepicker-input"
                    calendarClassName="custom-calendar"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    yearDropdownItemNumber={10}
                    scrollableYearDropdown
                    withPortal
                    portalId="datepicker-portal"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>رابط البث المباشر (الأصلي)</label>
                <input
                  type="url"
                  value={formData.live_url}
                  onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                  required
                  className="form-input"
                  placeholder="الرابط الأصلي للبث المباشر"
                />
              </div>

              {/* Quality URLs Section */}
              <div style={{ padding: '15px 0', margin: '10px 0' }}>
                <h3 className="form-label" style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' }}>📺 جودة البث</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>رابط SD (جودة منخفضة)</label>
                  <input
                    type="url"
                    value={formData.live_url_low}
                    onChange={(e) => setFormData({ ...formData, live_url_low: e.target.value })}
                    className="form-input"
                    placeholder="رابط البث SD (اختياري)"
                  />
                </div>

                <div className="form-group">
                  <label>رابط HD (جودة عالية)</label>
                  <input
                    type="url"
                    value={formData.live_url_high}
                    onChange={(e) => setFormData({ ...formData, live_url_high: e.target.value })}
                    className="form-input"
                    placeholder="رابط البث HD (اختياري)"
                  />
                </div>
              </div>
              </div> {/* End Quality URLs Section */}

              <div className="form-group">
                <label>حالة المباراة</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="form-select"
                >
                  <option value="لم تبدأ بعد">لم تبدأ بعد</option>
                  <option value="جارية الآن">جارية الآن</option>
                  <option value="انتهت">انتهت</option>
                </select>
              </div>

              <button type="submit" disabled={loading || uploading.opponent1 || uploading.opponent2} className="btn-submit">
                {loading ? 'جاري الحفظ...' : editingMatch ? 'تحديث المباراة' : 'إضافة المباراة'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
