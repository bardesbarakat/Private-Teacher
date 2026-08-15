import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function PendingApproval() {
  const { user, approvalStatus, logout } = useAuth();

  if (approvalStatus === 'Approved') {
    return <Navigate to="/teacher" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)' }}>
      <div style={{ maxWidth: '500px', width: '90%', background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          {approvalStatus === 'Rejected' ? '❌' : '⏳'}
        </div>
        
        <h2 style={{ color: 'var(--text-color)', marginBottom: '1rem', fontSize: '1.5rem' }}>
          {approvalStatus === 'Rejected' ? 'تم رفض طلب الانضمام' : 'حسابك قيد المراجعة الإدارية'}
        </h2>
        
        <p style={{ color: 'var(--text-dim)', marginBottom: '2rem', lineHeight: '1.6' }}>
          مرحباً {user?.fullNameAr}،<br/>
          {approvalStatus === 'Rejected' 
            ? 'نأسف لإبلاغك بأنه قد تم رفض طلب انضمامك كمعلم في المنصة. يرجى التواصل مع الإدارة لمزيد من التفاصيل.' 
            : 'شكراً لتسجيلك كمعلم في منصة بركات التعليمية. طلبك الآن قيد المراجعة من قبل الإدارة للتأكد من البيانات. سيتم تفعيل حسابك قريباً.'}
        </p>

        <button className="btn btn--primary" onClick={logout} style={{ width: '100%', justifyContent: 'center' }}>
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}
