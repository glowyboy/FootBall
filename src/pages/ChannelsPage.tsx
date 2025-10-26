import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Upload } from 'lucide-react';
import { supabase, Channel } from '../lib/supabase';

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'YouTube',
    stream_url: '',
    logo_url: '',
    is_active: true,
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    const { data } = await supabase.from('channels').select('*').order('created_at', { ascending: false });
    if (data) setChannels(data);
  };

  const openModal = (channel?: Channel) => {
    if (channel) {
      setEditingChannel(channel);
      setFormData({
        name: channel.name,
        type: channel.type,
        stream_url: channel.stream_url || '',
        logo_url: channel.logo_url || '',
        is_active: channel.is_active,
      });
    } else {
      setEditingChannel(null);
      setFormData({
        name: '',
        type: 'YouTube',
        stream_url: '',
        logo_url: '',
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `channels/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, logo_url: publicUrl });
    } catch (error) {
      alert('فشل رفع الصورة. تأكد من إنشاء bucket باسم "images" في Supabase Storage');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingChannel) {
        await supabase
          .from('channels')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingChannel.id);
      } else {
        await supabase.from('channels').insert([formData]);
      }
      await loadChannels();
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه القناة؟')) {
      await supabase.from('channels').delete().eq('id', id);
      await loadChannels();
    }
  };

  const toggleActive = async (channel: Channel) => {
    await supabase
      .from('channels')
      .update({ is_active: !channel.is_active, updated_at: new Date().toISOString() })
      .eq('id', channel.id);
    await loadChannels();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">إدارة القنوات</h1>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="btn-icon" />
          إضافة قناة جديدة
        </button>
      </div>

      <div className="channels-grid">
        {channels.map((channel) => (
          <div key={channel.id} className="channel-card">
            <div className="channel-logo">
              {channel.logo_url ? (
                <img src={channel.logo_url} alt={channel.name} />
              ) : (
                <div className="channel-placeholder">
                  <Plus size={32} />
                </div>
              )}
            </div>

            <div className="channel-content">
              <h3 className="channel-name">{channel.name}</h3>

              <div className="channel-controls">
                <div className="channel-toggle">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={channel.is_active}
                      onChange={() => toggleActive(channel)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="toggle-label">
                    {channel.is_active ? 'نشط' : 'غير نشط'}
                  </span>
                </div>

                <div className="channel-actions">
                  <button onClick={() => openModal(channel)} className="btn-icon-action">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(channel.id)} className="btn-icon-action danger">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingChannel ? 'تعديل القناة' : 'إضافة قناة جديدة'}</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>اسم القناة</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>شعار القناة</label>
                <div className="custom-file-upload">
                  <input
                    type="file"
                    id="channel-logo-upload"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  <label 
                    htmlFor="channel-logo-upload" 
                    className={`file-upload-label ${formData.logo_url ? 'has-file' : ''} ${uploading ? 'uploading' : ''}`}
                  >
                    <Upload size={20} />
                    {uploading ? 'جاري رفع الصورة...' : formData.logo_url ? 'تم اختيار الصورة ✓' : 'اختر صورة الشعار'}
                  </label>
                </div>
              </div>

              {formData.logo_url && (
                <div className="form-preview">
                  <img src={formData.logo_url} alt="Preview" />
                </div>
              )}

              <button type="submit" disabled={loading || uploading} className="btn-submit">
                {loading ? 'جاري الحفظ...' : editingChannel ? 'تحديث القناة' : 'إضافة القناة'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
