import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { redeemLessonCode } from '../services/api';

export default function RedeemPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState('جاري التحقق من الكود...');

  const code = searchParams.get('code');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً كطالب لتفعيل الدرس');
      navigate(`/login?redirect=/redeem?code=${code}`);
      return;
    }

    if (user.role !== 'Student') {
      toast.error('حسابات الطلاب فقط يمكنها تفعيل الدروس');
      navigate('/');
      return;
    }

    if (!code) {
      setStatus('خطأ: لم يتم توفير كود.');
      return;
    }

    const redeem = async () => {
      try {
        await redeemLessonCode(code.toUpperCase());
        setStatus('تم تفعيل الدرس بنجاح! 🔓 جاري توجيهك...');
        toast.success('تم تفعيل الدرس بنجاح!');
        setTimeout(() => {
          navigate('/student'); // Redirect to dashboard to see it
        }, 2000);
      } catch (err) {
        setStatus(err.response?.data?.message || 'عذراً، هذا الكود غير صالح أو مستخدم من قبل.');
        toast.error('فشل تفعيل الكود');
      }
    };

    redeem();
  }, [user, authLoading, code, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--line)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔑</div>
        <h2 style={{ color: 'var(--violet)' }}>تفعيل الدرس</h2>
        <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}>{status}</p>
        
        {status.includes('عذراً') || status.includes('خطأ') ? (
          <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => navigate('/student')}>
            العودة للمنصة
          </button>
        ) : null}
      </div>
    </div>
  );
}
