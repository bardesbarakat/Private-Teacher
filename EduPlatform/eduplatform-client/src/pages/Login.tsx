import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authApi } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useLanguage } from '../i18n/LanguageContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('يرجى تعبئة جميع الحقول');
      return;
    }

    setLoading(true);
    try {
      const res: any = await authApi.login(formData);
      login(res.data.token, res.data.user);
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/dashboard');
    } catch (error) {
      toast.error('بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-1)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60vw', height: '60vw', background: 'radial-gradient(circle, var(--mint-soft) 0%, transparent 70%)', opacity: 0.5, zIndex: 0 }}></div>

      <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '48px', position: 'relative', zIndex: 1, margin: '24px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', background: 'var(--mint)', borderRadius: '50%', color: 'var(--bg-1)', fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>
            E
          </Link>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>{t('auth', 'loginTitle')}</h1>
          <p style={{ color: 'var(--text-soft)' }}>{t('auth', 'loginSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>{t('auth', 'email')}</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }} />
              <input 
                type="email" 
                className="input-control" 
                style={{ width: '100%', paddingRight: '44px' }} 
                placeholder={t('auth', 'emailPlaceholder')}
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                dir="ltr"
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '24px' }}>
            <label>{t('auth', 'password')}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="input-control" 
                style={{ width: '100%', paddingRight: '44px', paddingLeft: '44px' }} 
                placeholder={t('auth', 'passwordPlaceholder')}
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                dir="ltr"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', color: 'var(--text-soft)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', fontSize: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: 'var(--mint)' }} />
              <span>{t('auth', 'rememberMe')}</span>
            </label>
            <a href="#" style={{ color: 'var(--mint)' }}>{t('auth', 'forgotPassword')}</a>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '18px' }} disabled={loading}>
            {loading ? t('auth', 'loading') : t('auth', 'loginBtn')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '32px', color: 'var(--text-soft)', fontSize: '15px' }}>
          {t('auth', 'noAccount')} <Link to="/register" style={{ color: 'var(--mint)', fontWeight: 'bold' }}>{t('auth', 'registerLink')}</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
