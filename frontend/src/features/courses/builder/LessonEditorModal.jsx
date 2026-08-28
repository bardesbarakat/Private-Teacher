import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { updateLesson, uploadFile } from '../../../services/api';

export default function LessonEditorModal({ lesson, onClose, onSave }) {
  const [formData, setFormData] = useState({ ...lesson });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({ ...lesson });
  }, [lesson]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const [uploadingField, setUploadingField] = useState(null);

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingField(fieldName);
    try {
      const res = await uploadFile(file);
      setFormData(prev => ({ ...prev, [fieldName]: res.data.url }));
      toast.success('تم رفع الملف بنجاح!');
    } catch (err) {
      toast.error('فشل رفع الملف. تأكد من حجم الملف والاتصال بالشبكة.');
    }
    setUploadingField(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateLesson(lesson.id, formData);
      toast.success('تم حفظ تعديلات الدرس');
      onSave();
    } catch (err) {
      toast.error('حدث خطأ أثناء حفظ الدرس');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '800px', width: '90%' }}>
        <h3>تعديل الدرس: {lesson.titleAr}</h3>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '8px' }}>
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
            <div style={{ flex: 1, padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-body)' }}>
              <h4 style={{ color: 'var(--primary)', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>النسخة العربية 🇸🇦</h4>
              
              <div className="form-group">
                <label className="form-label">عنوان الدرس (عربي) *</label>
                <input className="form-input" name="titleAr" value={formData.titleAr || ''} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">رابط الفيديو (عربي)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="form-input" style={{flex:1}} type="url" dir="ltr" name="videoUrlAr" value={formData.videoUrlAr || ''} onChange={handleChange} placeholder="https://..." />
                  <label className="btn btn-ghost" style={{cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center'}}>
                    {uploadingField === 'videoUrlAr' ? 'يتم الرفع...' : 'رفع 📁'}
                    <input type="file" accept="video/mp4,video/x-m4v,video/*" style={{display:'none'}} onChange={e => handleFileUpload(e, 'videoUrlAr')} disabled={uploadingField === 'videoUrlAr'} />
                  </label>
                </div>
                <small style={{ color: 'var(--text-dim)' }}>أدخل رابط خارجي أو قم برفع ملف من جهازك</small>
              </div>

              <div className="form-group">
                <label className="form-label">رابط الـ PDF (عربي)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="form-input" style={{flex:1}} type="url" dir="ltr" name="pdfUrlAr" value={formData.pdfUrlAr || ''} onChange={handleChange} placeholder="https://..." />
                  <label className="btn btn-ghost" style={{cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center'}}>
                    {uploadingField === 'pdfUrlAr' ? 'يتم الرفع...' : 'رفع 📁'}
                    <input type="file" accept="application/pdf" style={{display:'none'}} onChange={e => handleFileUpload(e, 'pdfUrlAr')} disabled={uploadingField === 'pdfUrlAr'} />
                  </label>
                </div>
              </div>
            </div>

            <div style={{ flex: 1, padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-body)' }}>
              <h4 style={{ color: '#3b82f6', borderBottom: '2px solid #3b82f6', paddingBottom: '0.5rem', marginBottom: '1rem' }}>النسخة الإنجليزية 🇬🇧</h4>
              
              <div className="form-group">
                <label className="form-label">عنوان الدرس (إنجليزي) *</label>
                <input className="form-input" name="titleEn" value={formData.titleEn || ''} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">رابط الفيديو (إنجليزي)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="form-input" style={{flex:1}} type="url" dir="ltr" name="videoUrlEn" value={formData.videoUrlEn || ''} onChange={handleChange} placeholder="https://..." />
                  <label className="btn btn-ghost" style={{cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center'}}>
                    {uploadingField === 'videoUrlEn' ? 'يتم الرفع...' : 'رفع 📁'}
                    <input type="file" accept="video/mp4,video/x-m4v,video/*" style={{display:'none'}} onChange={e => handleFileUpload(e, 'videoUrlEn')} disabled={uploadingField === 'videoUrlEn'} />
                  </label>
                </div>
                <small style={{ color: 'var(--text-dim)' }}>أدخل رابط خارجي أو قم برفع ملف من جهازك</small>
              </div>

              <div className="form-group">
                <label className="form-label">رابط الـ PDF (إنجليزي)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="form-input" style={{flex:1}} type="url" dir="ltr" name="pdfUrlEn" value={formData.pdfUrlEn || ''} onChange={handleChange} placeholder="https://..." />
                  <label className="btn btn-ghost" style={{cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center'}}>
                    {uploadingField === 'pdfUrlEn' ? 'يتم الرفع...' : 'رفع 📁'}
                    <input type="file" accept="application/pdf" style={{display:'none'}} onChange={e => handleFileUpload(e, 'pdfUrlEn')} disabled={uploadingField === 'pdfUrlEn'} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
            </button>
            <button type="button" className="btn-ghost" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}
