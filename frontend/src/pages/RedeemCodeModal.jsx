import { useState } from 'react';
import toast from 'react-hot-toast';
import { redeemLessonCode } from '../services/api';

export default function RedeemCodeModal({ onClose, onSuccess }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    try {
      await redeemLessonCode(code.trim().toUpperCase());
      toast.success('تم فتح الدرس بنجاح! 🎉');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'كود غير صالح أو مستخدم من قبل.');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '400px', width: '90%', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--violet)' }}>إدخال كود التفعيل</h3>
        <p style={{ color: 'var(--text-soft)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          للوصول إلى هذا الدرس، يرجى إدخال كود التفعيل الخاص بك (8 حروف/أرقام).
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <input 
              type="text" 
              className="form-input" 
              style={{ textAlign: 'center', letterSpacing: '3px', fontSize: '1.2rem', textTransform: 'uppercase' }}
              placeholder="ABCD1234" 
              value={code} 
              onChange={e => setCode(e.target.value)}
              maxLength={8}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading}>
            {loading ? 'جاري التحقق...' : 'فتح الدرس 🔓'}
          </button>
          
          <button type="button" className="btn btn-ghost" style={{ width: '100%' }} onClick={onClose} disabled={loading}>
            إلغاء
          </button>
        </form>
      </div>
    </div>
  );
}
