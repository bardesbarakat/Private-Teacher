import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, GraduationCap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authApi } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useLanguage } from '../i18n/LanguageContext';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    firstName: '', lastName: '', email: '', phone: '', grade: '', city: '', password: '', confirmPassword: '' 
  });

  const getPasswordStrength = () => {
    const pw = formData.password;
    if (pw.length === 0) return 0;
    let strength = 0;
    if (pw.length > 5) strength += 1;
    if (pw.length > 8) strength += 1;
    if (/[A-Z]/.test(pw)) strength += 1;
    if (/[0-9]/.test(pw)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pw)) strength += 1;
    return Math.min(4, strength);
  };

  const strength = getPasswordStrength();
  const strengthColors = ['#ef4444', '#f59e0b', '#14b8a6', '#22c55e'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }
    
    setLoading(true);
    try {
      const res: any = await authApi.register(formData);
      login(res.data.token, res.data.user);
      toast.success('تم إنشاء الحساب بنجاح');
      navigate('/dashboard');
    } catch (error) {
      toast.error('حدث خطأ أثناء التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-1)', position: 'relative', overflow: 'hidden', padding: '40px 20px' }}>
      
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60vw', height: '60vw', background: 'radial-gradient(circle, var(--mint-soft) 0%, transparent 70%)', opacity: 0.5, zIndex: 0 }}></div>

      <div className="card" style={{ width: '100%', maxWidth: '700px', padding: '48px', position: 'relative', zIndex: 1 }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>{t('auth', 'registerTitle')}</h1>
          <p style={{ color: 'var(--text-soft)' }}>{t('auth', 'registerSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label>{t('auth', 'firstName')}</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }} />
                <input required type="text" className="input-control" style={{ width: '100%', paddingRight: '44px' }} value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              </div>
            </div>
            <div className="input-group">
              <label>{t('auth', 'lastName')}</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }} />
                <input required type="text" className="input-control" style={{ width: '100%', paddingRight: '44px' }} value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label>{t('auth', 'email')}</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }} />
                <input required type="email" className="input-control" style={{ width: '100%', paddingRight: '44px' }} dir="ltr" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <div className="input-group">
              <label>{t('auth', 'phone')}</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }} />
                <input required type="tel" className="input-control" style={{ width: '100%', paddingRight: '44px' }} dir="ltr" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label>{t('auth', 'grade')}</label>
              <div style={{ position: 'relative' }}>
                <GraduationCap size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }} />
                <select required className="input-control" style={{ width: '100%', paddingRight: '44px', appearance: 'none' }} value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
                  <option value="">{t('auth', 'gradeSelect')}</option>
                  <option value="first">{t('auth', 'bac1')}</option>
                  <option value="second">{t('auth', 'bac2')}</option>
                  <option value="univ">{t('auth', 'online')}</option>
                </select>
              </div>
            </div>
            <div className="input-group">
              <label>{t('auth', 'city')}</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }} />
                <select required className="input-control" style={{ width: '100%', paddingRight: '44px', appearance: 'none' }} value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                  <option value="">{t('auth', 'citySelect')}</option>
                  <option value="cairo">{t('auth', 'cairo')}</option>
                  <option value="alex">{t('auth', 'alex')}</option>
                  <option value="other">{t('auth', 'online')}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>{t('auth', 'password')}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }} />
              <input required type={showPassword ? 'text' : 'password'} className="input-control" style={{ width: '100%', paddingRight: '44px', paddingLeft: '44px' }} dir="ltr" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', color: 'var(--text-soft)' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Strength Meter */}
            <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
              {[1, 2, 3, 4].map(level => (
                <div key={level} style={{ height: '4px', flex: 1, borderRadius: '2px', background: strength >= level ? strengthColors[strength - 1] : 'var(--bg-2)', transition: 'background 0.3s' }}></div>
              ))}
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '24px' }}>
            <label>{t('auth', 'confirmPassword')}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }} />
              <input required type={showPassword ? 'text' : 'password'} className="input-control" style={{ width: '100%', paddingRight: '44px' }} dir="ltr" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '32px', fontSize: '14px', color: 'var(--text-soft)' }}>
            <input required type="checkbox" style={{ accentColor: 'var(--mint)' }} />
            <span>{t('auth', 'terms')}</span>
          </label>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '18px' }} disabled={loading}>
            {loading ? t('auth', 'loading') : t('auth', 'registerBtn')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '32px', color: 'var(--text-soft)', fontSize: '15px' }}>
          {t('auth', 'hasAccount')} <Link to="/login" style={{ color: 'var(--mint)', fontWeight: 'bold' }}>{t('auth', 'loginLink')}</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
