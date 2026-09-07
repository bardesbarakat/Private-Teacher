import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { updateLesson, uploadFile, addResource, deleteResource } from '../../../services/api';
import LessonCodeManager from './LessonCodeManager';

export default function LessonEditorModal({ lesson, onClose, onSave }) {
  const [formData, setFormData] = useState({ 
    titleAr: lesson.titleAr, 
    titleEn: lesson.titleEn, 
    isPublished: lesson.isPublished 
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Resources state
  const [resources, setResources] = useState(lesson.resources || []);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    type: 'pdf',
    titleAr: '',
    titleEn: '',
    urlAr: '',
    urlEn: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleResourceChange = (e) => {
    const { name, value } = e.target;
    setResourceForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e, lang) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadFile(file);
      setResourceForm(prev => ({ ...prev, [lang === 'ar' ? 'urlAr' : 'urlEn']: res.data.url }));
      toast.success('تم رفع الملف بنجاح!');
    } catch (err) {
      toast.error('فشل رفع الملف. تأكد من حجم الملف والاتصال بالشبكة.');
    }
    setUploading(false);
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateLesson(lesson.id, { ...lesson, ...formData });
      toast.success('تم حفظ تعديلات الدرس');
      onSave(); // Refresh curriculum
    } catch (err) {
      toast.error('حدث خطأ أثناء حفظ الدرس');
    }
    setLoading(false);
  };

  const handleAddResource = async () => {
    if (!resourceForm.titleAr || (!resourceForm.urlAr && !resourceForm.urlEn)) {
      toast.error('يرجى إدخال عنوان المادة ورابط واحد على الأقل');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        lessonId: lesson.id,
        type: resourceForm.type,
        titleAr: resourceForm.titleAr,
        titleEn: resourceForm.titleEn || resourceForm.titleAr,
        urlAr: resourceForm.urlAr,
        urlEn: resourceForm.urlEn
      };
      await addResource(payload);
      toast.success('تمت إضافة المادة بنجاح');
      setShowResourceForm(false);
      setResourceForm({ type: 'pdf', titleAr: '', titleEn: '', urlAr: '', urlEn: '' });
      onSave(); // Refresh parent to get updated resources
    } catch (err) {
      toast.error('حدث خطأ أثناء إضافة المادة');
    }
    setLoading(false);
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المادة؟')) return;
    try {
      await deleteResource(id);
      toast.success('تم حذف المادة');
      onSave();
    } catch (err) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const renderIcon = (type) => {
    const map = {
      'pdf': '📄',
      'pptx': '📊',
      'mindmap': '🧠',
      'infographic': '🖼️',
      'code': '💻',
      'video': '🔗'
    };
    return map[type] || '📁';
  };

  const typeOptions = [
    { value: 'pdf', label: 'ملف PDF (PDF Document)' },
    { value: 'pptx', label: 'عرض تقديمي (PowerPoint / PPTX)' },
    { value: 'mindmap', label: 'خريطة ذهنية (Mind Map)' },
    { value: 'infographic', label: 'إنفوجرافيك (Infographic)' },
    { value: 'code', label: 'كود تفاعلي / مشروع برمجية (Code)' },
    { value: 'video', label: 'رابط خارجي / فيديو (Video/Link)' }
  ];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '800px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3>تعديل الدرس: {lesson.titleAr}</h3>
        
        <form onSubmit={handleSaveLesson} className="auth-form" style={{ marginBottom: '2rem' }}>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '8px' }}>
            <input 
              type="checkbox" 
              id="isPublished" 
              name="isPublished" 
              checked={formData.isPublished} 
              onChange={handleChange}
              style={{ width: '1.2rem', height: '1.2rem', accentColor: '#f59e0b' }}
            />
            <label htmlFor="isPublished" style={{ margin: 0, fontWeight: 600, color: '#b45309' }}>
              نشر الدرس (إلغاء التحديد سيجعله مسودة ولن يظهر للطلاب)
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">عنوان الدرس (عربي) *</label>
              <input className="form-input" name="titleAr" value={formData.titleAr} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">عنوان الدرس (إنجليزي) *</label>
              <input className="form-input" name="titleEn" value={formData.titleEn} onChange={handleChange} required />
            </div>
          </div>

          <div className="modal-actions" style={{ justifyContent: 'flex-start' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              حفظ التعديلات الأساسية
            </button>
          </div>
        </form>

        <hr style={{ borderTop: '1px solid var(--line)', margin: '2rem 0' }} />

        {/* MATERIALS MANAGEMENT SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: 'var(--mint)' }}>المواد التعليمية (Materials)</h3>
          {!showResourceForm && (
            <button className="btn btn--primary" onClick={() => setShowResourceForm(true)}>+ إضافة مادة / Add Material</button>
          )}
        </div>

        {/* RESOURCES LIST */}
        {!showResourceForm && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {lesson.resources && lesson.resources.length > 0 ? (
              lesson.resources.map(res => (
                <div key={res.id} style={{ display: 'flex', alignItems: 'center', padding: '1rem', border: '1px solid var(--line)', borderRadius: '8px', background: 'var(--bg-1)' }}>
                  <span style={{ fontSize: '2rem', marginLeft: '1rem' }}>{renderIcon(res.type)}</span>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.25rem 0' }}>{res.titleAr} <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>({res.type})</span></h4>
                    {res.urlAr && <a href={res.urlAr} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#3b82f6', display: 'block' }}>رابط النسخة العربية</a>}
                    {res.urlEn && <a href={res.urlEn} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#3b82f6', display: 'block' }}>رابط النسخة الإنجليزية</a>}
                  </div>
                  <button className="btn-ghost" style={{ color: 'var(--danger-solid)' }} onClick={() => handleDeleteResource(res.id)}>حذف 🗑️</button>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem', border: '1px dashed var(--line)', borderRadius: '8px' }}>
                لا توجد مواد تعليمية. انقر على "إضافة مادة" للبدء.
              </p>
            )}
          </div>
        )}

        {/* ADD RESOURCE FORM */}
        {showResourceForm && (
          <div style={{ padding: '1.5rem', border: '1px solid var(--mint-line)', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.05)' }}>
            <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>إضافة مادة جديدة</h4>
            
            <div className="form-group">
              <label className="form-label">نوع المادة (Material Type) *</label>
              <select className="form-input" name="type" value={resourceForm.type} onChange={handleResourceChange}>
                {typeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">عنوان المادة (عربي) *</label>
                <input className="form-input" name="titleAr" placeholder="مثال: مذكرة الدرس الأول" value={resourceForm.titleAr} onChange={handleResourceChange} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">عنوان المادة (إنجليزي)</label>
                <input className="form-input" name="titleEn" placeholder="e.g., Lesson 1 Notes" value={resourceForm.titleEn} onChange={handleResourceChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">ملف / رابط (النسخة العربية)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input className="form-input" style={{flex:1}} type="text" dir="ltr" name="urlAr" value={resourceForm.urlAr} onChange={handleResourceChange} placeholder="https://... أو ارفع ملفاً" />
                <label className="btn btn-ghost" style={{cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center'}}>
                  {uploading ? 'يتم الرفع...' : 'رفع 📁'}
                  <input type="file" style={{display:'none'}} onChange={e => handleFileUpload(e, 'ar')} disabled={uploading} />
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">ملف / رابط (النسخة الإنجليزية)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input className="form-input" style={{flex:1}} type="text" dir="ltr" name="urlEn" value={resourceForm.urlEn} onChange={handleResourceChange} placeholder="https://... أو ارفع ملفاً" />
                <label className="btn btn-ghost" style={{cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center'}}>
                  {uploading ? 'يتم الرفع...' : 'رفع 📁'}
                  <input type="file" style={{display:'none'}} onChange={e => handleFileUpload(e, 'en')} disabled={uploading} />
                </label>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '1.5rem', justifyContent: 'flex-start' }}>
              <button type="button" className="btn-primary" onClick={handleAddResource} disabled={loading || uploading}>
                {loading ? 'جاري الحفظ...' : 'حفظ المادة'}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setShowResourceForm(false)}>إلغاء</button>
            </div>
          </div>
        )}

        <hr style={{ borderTop: '1px solid var(--line)', margin: '2rem 0' }} />
        
        {/* ACCESS CODES MANAGER */}
        <LessonCodeManager lessonId={lesson.id} />

      </div>
    </div>
  );
}
