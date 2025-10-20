import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Upload, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { supabase, Match, Category, Channel } from '../lib/supabase';

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
        .upload(filePath, file);

      if (uploadError) throw uploadError;

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
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="btn-icon" />
          إضافة مباراة جديدة
        </button>
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
                    onChange={(date) => setFormData({ ...formData, match_time: date ? date.toISOString() : '' })}
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
                <label>رابط البث المباشر</label>
                <input
                  type="url"
                  value={formData.live_url}
                  onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                  required
                  className="form-input"
                />
              </div>

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
