import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useLanguage, LangToggle } from '../i18n/LanguageContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const { t } = useLanguage();
  const navigate  = useNavigate();
  const location  = useLocation();
  const dropRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/',        label: t('nav', 'home') },
    { to: '/catalog', label: t('nav', 'courses') },
  ];

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        height: 'var(--nav-h)',
        background: isScrolled
          ? 'rgba(10,10,10,0.92)'
          : 'rgba(10,10,10,0.75)',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${isScrolled ? 'rgba(245,200,66,.15)' : 'rgba(245,200,66,.06)'}`,
        boxShadow: isScrolled ? '0 4px 24px rgba(0,0,0,.6)' : 'none',
        transition: 'all .3s var(--ease)',
      }}>
        <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* ── Logo ── */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px', height: '40px',
              background: 'linear-gradient(135deg, #F5C842, #D4A017)',
              borderRadius: '11px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0A0A0A', fontWeight: 900, fontSize: '20px',
              boxShadow: '0 4px 16px rgba(245,200,66,.35)',
              flexShrink: 0,
            }}>E</div>
            <span style={{ fontSize: '19px', fontWeight: 800, color: '#F5F0E8', letterSpacing: '-.3px' }}
              className="latin">EduPlatform</span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="desktop-nav">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} style={{
                padding: '8px 18px', borderRadius: 'var(--r-md)',
                fontSize: '15px', fontWeight: isActive(link.to) ? 700 : 500,
                color: isActive(link.to) ? '#F5C842' : '#C8BFA8',
                background: isActive(link.to) ? 'rgba(245,200,66,.10)' : 'transparent',
                border: isActive(link.to) ? '1px solid rgba(245,200,66,.20)' : '1px solid transparent',
                transition: 'all .2s var(--ease)',
              }}
                onMouseEnter={e => {
                  if (!isActive(link.to)) {
                    (e.currentTarget as HTMLElement).style.color = '#F5C842';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(245,200,66,.08)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive(link.to)) {
                    (e.currentTarget as HTMLElement).style.color = '#C8BFA8';
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }
                }}
              >{link.label}</Link>
            ))}
          </div>

          {/* ── Auth Actions ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="desktop-nav">
            <LangToggle />
            {isAuthenticated ? (
              <div style={{ position: 'relative' }} ref={dropRef}>
                <button onClick={() => setDropdownOpen(v => !v)} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(245,200,66,.08)',
                  border: '1.5px solid rgba(245,200,66,.20)',
                  padding: '7px 16px', borderRadius: 'var(--r-pill)',
                  color: '#F5C842', fontWeight: 700, fontSize: '14px',
                  cursor: 'pointer', transition: 'all .2s',
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(245,200,66,.14)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(245,200,66,.08)'}
                >
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F5C842, #D4A017)',
                    color: '#0A0A0A', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '13px', fontWeight: 900,
                  }}>{user?.firstName?.[0]}</div>
                  {user?.firstName}
                  <ChevronDown size={14} style={{ transition: 'transform .2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                {dropdownOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 10px)',
                    left: 0, minWidth: '200px',
                    background: '#111', border: '1px solid rgba(245,200,66,.15)',
                    borderRadius: 'var(--r-lg)', padding: '8px',
                    boxShadow: '0 16px 48px rgba(0,0,0,.8), 0 0 0 1px rgba(245,200,66,.06)',
                    animation: 'slideDown .18s var(--ease)',
                  }}>
                    <Link to="/dashboard" onClick={() => setDropdownOpen(false)} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 14px', borderRadius: 'var(--r-md)',
                      color: '#F5F0E8', fontSize: '14px', fontWeight: 600, transition: 'background .15s',
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(245,200,66,.08)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    ><LayoutDashboard size={16} color="#F5C842" /> {t('nav', 'dashboard')}</Link>
                    <hr style={{ border: 'none', borderTop: '1px solid rgba(245,200,66,.10)', margin: '4px 0' }} />
                    <button onClick={() => { logout(); setDropdownOpen(false); navigate('/'); }} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 14px', borderRadius: 'var(--r-md)',
                      color: '#F87171', fontSize: '14px', fontWeight: 600,
                      background: 'transparent', border: 'none', width: '100%',
                      cursor: 'pointer', textAlign: 'right', transition: 'background .15s',
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,.08)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    ><LogOut size={16} /> {t('nav', 'logout')}</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" style={{
                  padding: '9px 20px', borderRadius: 'var(--r-md)',
                  color: '#F5C842', fontWeight: 700, fontSize: '14.5px',
                  border: '1.5px solid rgba(245,200,66,.25)', background: 'transparent', transition: 'all .2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(245,200,66,.08)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,200,66,.45)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,200,66,.25)'; }}
                >{t('nav', 'login')}</Link>
                <Link to="/register" style={{
                  padding: '9px 22px', borderRadius: 'var(--r-md)',
                  background: 'linear-gradient(135deg, #F5C842, #D4A017)',
                  color: '#0A0A0A', fontWeight: 800, fontSize: '14.5px',
                  boxShadow: '0 4px 16px rgba(245,200,66,.30)', transition: 'all .2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(245,200,66,.45)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(245,200,66,.30)'; }}
                >{t('nav', 'register')} ✨</Link>
              </>
            )}
          </div>

          {/* ── Mobile Toggle ── */}
          <button onClick={() => setMobileOpen(v => !v)} className="mobile-toggle" style={{
            background: 'rgba(245,200,66,.08)',
            border: '1px solid rgba(245,200,66,.20)',
            color: '#F5C842', borderRadius: 'var(--r-md)',
            padding: '8px', display: 'none', cursor: 'pointer',
          }}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div style={{
            background: 'rgba(10,10,10,.97)',
            borderTop: '1px solid rgba(245,200,66,.12)',
            padding: '12px 16px 20px',
            display: 'flex', flexDirection: 'column', gap: '6px',
            animation: 'slideDown .2s var(--ease)',
          }}>
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} style={{
                padding: '12px 16px', borderRadius: 'var(--r-md)',
                color: isActive(link.to) ? '#F5C842' : '#C8BFA8',
                background: isActive(link.to) ? 'rgba(245,200,66,.10)' : 'transparent',
                fontWeight: 600, fontSize: '15px', transition: 'all .2s',
              }}>{link.label}</Link>
            ))}
            <hr style={{ border: 'none', borderTop: '1px solid rgba(245,200,66,.10)', margin: '6px 0' }} />
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" style={{
                  padding: '12px 16px', borderRadius: 'var(--r-md)',
                  color: '#F5C842', fontWeight: 600,
                }}>لوحة التحكم</Link>
                <button onClick={() => { logout(); navigate('/'); }} style={{
                  padding: '12px 16px', borderRadius: 'var(--r-md)',
                  color: '#F87171', fontWeight: 600,
                  background: 'transparent', border: 'none',
                  textAlign: 'right', cursor: 'pointer',
                }}>تسجيل الخروج</button>
              </>
            ) : (
              <>
                <Link to="/login" style={{
                  padding: '12px 16px', borderRadius: 'var(--r-md)',
                  color: '#F5C842', fontWeight: 700,
                  border: '1.5px solid rgba(245,200,66,.25)', textAlign: 'center',
                }}>تسجيل الدخول</Link>
                <Link to="/register" style={{
                  padding: '12px 16px', borderRadius: 'var(--r-md)',
                  background: 'linear-gradient(135deg, #F5C842, #D4A017)',
                  color: '#0A0A0A', fontWeight: 800, textAlign: 'center',
                }}>سجّل الآن</Link>
              </>
            )}
          </div>
        )}
      </nav>

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
