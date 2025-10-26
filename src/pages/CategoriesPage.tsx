import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Upload } from 'lucide-react';
import { supabase, Category } from '../lib/supabase';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    is_active: true,
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
    if (data) setCategories(data);
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        image_url: category.image_url || '',
        is_active: category.is_active,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        image_url: '',
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
      const filePath = `categories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
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
      if (editingCategory) {
        await supabase
          .from('categories')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingCategory.id);
      } else {
        await supabase.from('categories').insert([formData]);
      }
      await loadCategories();
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
      await supabase.from('categories').delete().eq('id', id);
      await loadCategories();
    }
  };

  const toggleActive = async (category: Category) => {
    await supabase
      .from('categories')
      .update({ is_active: !category.is_active, updated_at: new Date().toISOString() })
      .eq('id', category.id);
    await loadCategories();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">إدارة التصنيفات</h1>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="btn-icon" />
          إضافة تصنيف جديد
        </button>
      </div>

      <div className="categories-grid">
        {categories.map((category) => (
          <div key={category.id} className="category-card">
            <div className="category-image">
              {category.image_url ? (
                <img src={category.image_url} alt={category.name} />
              ) : (
                <div className="category-placeholder">
                  <Plus size={48} />
                </div>
              )}
            </div>

            <div className="category-content">
              <h3 className="category-name">{category.name}</h3>

              <div className="category-controls">
                <div className="category-toggle">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={category.is_active}
                      onChange={() => toggleActive(category)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="toggle-label">
                    {category.is_active ? 'نشط' : 'غير نشط'}
                  </span>
                </div>

                <div className="category-actions">
                  <button onClick={() => openModal(category)} className="btn-icon-action">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(category.id)} className="btn-icon-action danger">
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
              <h2>{editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>اسم التصنيف</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>صورة التصنيف</label>
                <div className="custom-file-upload">
                  <input
                    type="file"
                    id="category-image-upload"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  <label 
                    htmlFor="category-image-upload" 
                    className={`file-upload-label ${formData.image_url ? 'has-file' : ''} ${uploading ? 'uploading' : ''}`}
                  >
                    <Upload size={20} />
                    {uploading ? 'جاري رفع الصورة...' : formData.image_url ? 'تم اختيار الصورة ✓' : 'اختر صورة التصنيف'}
                  </label>
                </div>
              </div>

              {formData.image_url && (
                <div className="form-preview">
                  <img src={formData.image_url} alt="Preview" />
                </div>
              )}

              <button type="submit" disabled={loading || uploading} className="btn-submit">
                {loading ? 'جاري الحفظ...' : editingCategory ? 'تحديث التصنيف' : 'إضافة التصنيف'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
