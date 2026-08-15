import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminGetPendingTeachers, adminApproveTeacher, adminRejectTeacher } from '../services/api';

export default function PendingTeachersManagement() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminGetPendingTeachers();
      setTeachers(r.data);
    } catch {
      toast.error('فشل تحميل طلبات المعلمين');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من قبول المعلم "${name}"؟`)) return;
    try {
      await adminApproveTeacher(id);
      toast.success(`تم قبول المعلم ${name} بنجاح`);
      setTeachers(prev => prev.filter(t => t.id !== id));
    } catch {
      toast.error('حدث خطأ أثناء القبول');
    }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من رفض طلب المعلم "${name}"؟`)) return;
    try {
      await adminRejectTeacher(id);
      toast.success(`تم رفض طلب المعلم ${name}`);
      setTeachers(prev => prev.filter(t => t.id !== id));
    } catch {
      toast.error('حدث خطأ أثناء الرفض');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: 'var(--text)' }}>طلبات الانضمام (المعلمين)</h2>
        <p style={{ fontSize: 13.5, color: 'var(--text-dim)' }}>
          طلبات المعلمين بانتظار موافقة الإدارة: <strong style={{ color: 'var(--amber)' }}>{teachers.length}</strong> طلب
        </p>
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--line-soft)',
        borderRadius: 18, overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-dim)' }}>جارٍ تحميل الطلبات...</p>
          </div>
        ) : teachers.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>لا توجد طلبات معلقة</h3>
            <p style={{ fontSize: 14, color: 'var(--text-dim)' }}>تم مراجعة جميع طلبات انضمام المعلمين.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr style={{ background: 'var(--bg-field)', borderBottom: '1px solid var(--line-soft)' }}>
                  <th style={{ padding: '12px 14px', textAlign: 'right', fontSize: 12.5, color: 'var(--text-dim)' }}>#</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right', fontSize: 12.5, color: 'var(--text-dim)' }}>الاسم</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right', fontSize: 12.5, color: 'var(--text-dim)' }}>الإيميل</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right', fontSize: 12.5, color: 'var(--text-dim)' }}>الهاتف</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right', fontSize: 12.5, color: 'var(--text-dim)' }}>تاريخ الطلب</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right', fontSize: 12.5, color: 'var(--text-dim)' }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t, idx) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,.035)' }}>
                    <td style={{ padding: '13px 14px', fontSize: 12.5, color: 'var(--text-dim)' }}>{idx + 1}</td>
                    <td style={{ padding: '13px 14px', fontWeight: 600 }}>{t.fullNameAr}</td>
                    <td style={{ padding: '13px 14px', fontSize: 13, color: 'var(--text-soft)' }}>{t.email}</td>
                    <td style={{ padding: '13px 14px', fontSize: 13, color: 'var(--text-soft)' }}>{t.phoneNumber}</td>
                    <td style={{ padding: '13px 14px', fontSize: 12.5, color: 'var(--text-dim)' }}>
                      {new Date(t.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleApprove(t.id, t.fullNameAr)} style={{
                          padding: '6px 12px', borderRadius: 8, border: '1px solid var(--mint-line)',
                          background: 'var(--mint-soft)', color: 'var(--mint-text)', fontWeight: 600, cursor: 'pointer'
                        }}>✔️ قبول</button>
                        <button onClick={() => handleReject(t.id, t.fullNameAr)} style={{
                          padding: '6px 12px', borderRadius: 8, border: '1px solid var(--danger-line)',
                          background: 'var(--danger-soft)', color: 'var(--danger)', fontWeight: 600, cursor: 'pointer'
                        }}>❌ رفض</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
