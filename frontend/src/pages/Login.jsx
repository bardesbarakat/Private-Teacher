import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ emailOrUsername: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.emailOrUsername || !form.password) {
      setError('يرجى ملء جميع الحقول');
      return;
    }
    setLoading(true);
    try {
      const res = await loginUser(form);
      const { token, ...userData } = res.data.data;
      login(token, userData);
      toast.success('أهلاً بك! تم تسجيل الدخول بنجاح 🎉');
      const path = userData.role === 'Teacher' ? '/teacher' : userData.role === 'Parent' ? '/parent' : '/student';
      navigate(path);
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="dot-grid" />
      <div className="auth-glow" />

      <header className="auth-header">
        <Link to="/" className="auth-brand">
          <img src="/logo.jpg" alt="BEdU" />
          <div>
            <div className="bedu">BEdU</div>
            <div className="tagline">EduBarakat Platform</div>
          </div>
        </Link>
        <Link to="/" className="btn-ghost" style={{fontSize:'13px'}}>العودة للرئيسية</Link>
      </header>

      <main className="auth-main">
        <div className="auth-card">
          <span className="auth-eyebrow">مرحبًا بعودتك</span>
          <h1 className="auth-title">تسجيل الدخول</h1>
          <p className="auth-subtitle">أدخل بياناتك للوصول لمنصة EduBarakat</p>

          {error && (
            <div style={{background:'rgba(220,38,38,.1)', border:'1px solid var(--danger-line)', borderRadius:'var(--r-sm)', padding:'12px 14px', color:'var(--danger)', fontSize:'13.5px', marginBottom:'4px'}}>
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="emailOrUsername">البريد الإلكتروني أو اسم المستخدم</label>
              <input id="emailOrUsername" name="emailOrUsername" type="text" className="auth-input"
                placeholder="email@example.com أو username"
                value={form.emailOrUsername} onChange={change} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">كلمة المرور</label>
              <div className="auth-input-wrap">
                <input id="password" name="password" type={showPwd ? 'text' : 'password'}
                  className="auth-input" placeholder="••••••••"
                  value={form.password} onChange={change} required />
                <button type="button" className="eye-btn" onClick={() => setShowPwd(!showPwd)} aria-label="إظهار/إخفاء كلمة المرور">
                  {showPwd
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <button type="submit" className="auth-btn auth-btn--mint" disabled={loading}>
              {loading ? <><div className="spinner" style={{width:'18px',height:'18px',borderWidth:'2px'}}/> جارٍ الدخول...</> : 'تسجيل الدخول →'}
            </button>
          </form>

          <p className="auth-footer-text" style={{marginTop:'20px'}}>
            ليس لديك حساب؟{' '}
            <Link to="/register" className="auth-link">سجّل الآن مجاناً</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
