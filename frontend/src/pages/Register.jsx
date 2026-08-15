import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة', 
  'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية', 
  'الوادي الجديد', 'السويس', 'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد', 
  'دمياط', 'الشرقية', 'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر', 
  'قنا', 'شمال سيناء', 'سوهاج', 'أخرى'
];
const ACADEMIC_YEARS = [
  'أولى ثانوي','ثانية ثانوي','أولى بكالوريا','تانية بكالوريا','خارج المدرسة'
];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState('Student');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [strength, setStrength] = useState(0);

  const [form, setForm] = useState({
    fullNameAr: '', fullNameEn: '', username: '', email: '',
    phoneNumber: '', password: '', confirmPassword: '',
    governorate: '', academicYear: ''
  });

 const change = (e) => {
  const { name, value } = e.target;
  
  let finalValue = value;

  // 1. تقييد الاسم بالإنجليزي (حروف إنجليزية ومسافات فقط)
  if (name === 'fullNameEn') {
    finalValue = value.replace(/[^a-zA-Z\s]/g, '');
  }
  
  // 2. تقييد الاسم بالعربي (حروف عربية ومسافات فقط)
  if (name === 'fullNameAr') {
    // استخدمنا النطاق \u0600-\u06FF وهو الخاص بالحروف العربية
    finalValue = value.replace(/[^\u0600-\u06FF\s]/g, '');
  }

  // حفظ القيمة النهائية
  setForm({ ...form, [name]: finalValue });

  // 3. حساب قوة كلمة المرور
  if (name === 'password') {
    let s = 0;
    if (finalValue.length >= 8) s++;
    if (/[0-9]/.test(finalValue)) s++;
    if (/[A-Z]/.test(finalValue)) s++;
    if (/[^a-zA-Z0-9]/.test(finalValue)) s++;
    setStrength(s);
  }
};
  const validate = () => {
    if (!form.fullNameAr) return 'الاسم الكامل بالعربية مطلوب';
    if (!form.fullNameEn) return 'الاسم الكامل بالإنجليزية مطلوب';
    if (!form.username || form.username.length < 3) return 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'البريد الإلكتروني غير صالح';
    if (!form.phoneNumber) return 'رقم الهاتف مطلوب';
    if (form.password.length < 8) return 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    if (form.password !== form.confirmPassword) return 'كلمتا المرور غير متطابقتين';
    if (!form.governorate) return 'يرجى اختيار المحافظة';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      const res = await registerUser({ ...form, role });
      const { token, ...userData } = res.data.data;
      login(token, userData);
      toast.success('تم إنشاء حسابك بنجاح! أهلاً بك 🎉');
      const path = role === 'Teacher' ? '/teacher' : role === 'Parent' ? '/parent' : '/student';
      navigate(path);
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ. حاول مجدداً.');
    } finally {
      setLoading(false);
    }
  };

  const strengthLabels = ['', 'ضعيفة', 'متوسطة', 'جيدة', 'قوية جداً'];
  const strengthColors = ['', '#ef4444', '#f59e0b', '#3b82f6', 'var(--mint)'];

  return (
    <div className="auth-page">
      <div className="dot-grid" />
      <div className="auth-glow" />

      <header className="auth-header">
        <Link to="/" className="auth-brand">
          <img src="/logo.jpg" alt="BEdU" />
          <div>
            <div className="bedu">BEdU</div>
            <div className="tagline">Barakat education platform</div>
          </div>
        </Link>
        <Link to="/login" className="btn-ghost" style={{fontSize:'13px'}}>لديّ حساب</Link>
      </header>

      <main className="auth-main" style={{padding:'16px 16px 40px'}}>
        <div className="auth-card auth-card--wide">
          <span className="auth-eyebrow">انضم إلى Barakat education platform</span>
          <h1 className="auth-title">إنشاء حساب جديد</h1>
          <p className="auth-subtitle">سجّل بياناتك وابدأ رحلتك التعليمية اليوم</p>

          {/* Role Selector */}
          <div style={{marginBottom:'20px'}}>
            <p className="form-label" style={{marginBottom:'10px'}}>نوع الحساب</p>
            <div className="role-selector">
              {[
                { value:'Student', icon:'👨‍🎓', label:'طالب' },
                { value:'Parent',  icon:'👨‍👧', label:'ولي أمر' },
                { value:'Teacher', icon:'👩‍🏫', label:'مدرّس' },
              ].map(r => (
                <label className="role-option" key={r.value}>
                  <input type="radio" name="role" value={r.value} checked={role === r.value} onChange={() => setRole(r.value)} />
                  <div className="role-option__label">
                    <span className="role-icon">{r.icon}</span>
                    {r.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div style={{background:'rgba(220,38,38,.1)', border:'1px solid var(--danger-line)', borderRadius:'var(--r-sm)', padding:'12px 14px', color:'var(--danger)', fontSize:'13.5px', marginBottom:'4px'}}>
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">الاسم الكامل (عربي) *</label>
                <input name="fullNameAr" className="auth-input" placeholder="محمد أحمد..."
                  value={form.fullNameAr} onChange={change} required />
              </div>
              <div className="form-group">
                <label className="form-label">Full Name (English) *</label>
                <input name="fullNameEn" className="auth-input" placeholder="Mohamed Ahmed..."
                  value={form.fullNameEn} onChange={change} required dir="ltr" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">اسم المستخدم *</label>
                <input name="username" className="auth-input" placeholder="username123"
                  value={form.username} onChange={change} required dir="ltr" />
              </div>
              <div className="form-group">
                <label className="form-label">البريد الإلكتروني *</label>
                <input name="email" type="email" className="auth-input" placeholder="email@example.com"
                  value={form.email} onChange={change} required dir="ltr" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">رقم الهاتف *</label>
                <input name="phoneNumber" type="tel" className="auth-input" placeholder="05xxxxxxxx"
                  value={form.phoneNumber} onChange={change} required dir="ltr" />
              </div>
              <div className="form-group">
                <label className="form-label">  المحافظة *</label>
                <select name="governorate" className="auth-input form-select"
                  value={form.governorate} onChange={change} required>
                  <option value="">اختر المحافظة...</option>
                  {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {(role === 'Student') && (
              <div className="form-group">
                <label className="form-label">السنة الدراسية</label>
                <select name="academicYear" className="auth-input form-select"
                  value={form.academicYear} onChange={change}>
                  <option value="">اختر السنة الدراسية...</option>
                  {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">كلمة المرور *</label>
              <div className="auth-input-wrap">
                <input name="password" type={showPwd ? 'text' : 'password'}
                  className="auth-input" placeholder="8 أحرف على الأقل"
                  value={form.password} onChange={change} required />
                <button type="button" className="eye-btn" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {form.password && (
                <>
                  <div className="strength-bar">
                    {[1,2,3,4].map(n => (
                      <div key={n} className={`strength-seg ${strength >= n ? (strength===1?'weak':strength===2?'fair':strength===3?'good':'strong') : ''}`} />
                    ))}
                  </div>
                  <div className="strength-text" style={{color: strengthColors[strength]}}>
                    {strengthLabels[strength]}
                  </div>
                </>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">تأكيد كلمة المرور *</label>
              <input name="confirmPassword" type="password" className="auth-input" placeholder="أعد كتابة كلمة المرور"
                value={form.confirmPassword} onChange={change} required />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <div className="form-error">كلمتا المرور غير متطابقتين</div>
              )}
            </div>

            <button type="submit" className="auth-btn auth-btn--mint" disabled={loading}>
              {loading
                ? <><div className="spinner" style={{width:'18px',height:'18px',borderWidth:'2px'}}/> جارٍ إنشاء الحساب...</>
                : `إنشاء حساب ${role === 'Teacher' ? 'مدرّس' : role === 'Parent' ? 'ولي أمر' : 'طالب'} →`
              }
            </button>
          </form>

          <p className="auth-footer-text" style={{marginTop:'18px'}}>
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="auth-link">سجّل الدخول</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
