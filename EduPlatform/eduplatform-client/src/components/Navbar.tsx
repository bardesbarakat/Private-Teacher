import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, ChevronDown, Bell } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useLanguage, LangToggle } from '../i18n/LanguageContext';
import BeduLogo from './BeduLogo';

const Navbar = () => {
  const [isScrolled, setIsScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const { t, isRTL } = useLanguage();
  const navigate   = useNavigate();
  const location   = useLocation();
  const dropRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/',        label: t('nav', 'home') },
    { to: '/catalog', label: t('nav', 'courses') },
  ];

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        height: 'var(--nav-h)',
      }}>
        {/* Glass bar */}
        <div style={{
          height: '100%',
          background: isScrolled
            ? 'rgba(7, 7, 15, 0.92)'
            : 'rgba(7, 7, 15, 0.60)',
          backdropFilter: 'blur(24px)',
          borderBottom: `1px solid ${isScrolled ? 'rgba(59,110,248,.20)' : 'rgba(59,110,248,.08)'}`,
          boxShadow: isScrolled ? '0 4px 40px rgba(0,0,0,.7)' : 'none',
          transition: 'all .3s var(--ease)',
        }}>
          <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>

            {/* ── LOGO ── */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <BeduLogo size="sm" showSlogan={false} />
            </Link>

            {/* ── CENTER NAV ── */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} style={{
                  padding: '8px 16px', borderRadius: 'var(--r-pill)',
                  fontSize: 15, fontWeight: isActive(link.to) ? 700 : 500,
                  color: isActive(link.to) ? '#60A5FA' : '#A0AAD0',
                  background: isActive(link.to) ? 'rgba(59,110,248,.12)' : 'transparent',
                  border: isActive(link.to) ? '1px solid rgba(59,110,248,.25)' : '1px solid transparent',
                  transition: 'all .2s',
                }}
                  onMouseEnter={e => { if (!isActive(link.to)) { const el = e.currentTarget as HTMLElement; el.style.color = '#60A5FA'; el.style.background = 'rgba(59,110,248,.06)'; } }}
                  onMouseLeave={e => { if (!isActive(link.to)) { const el = e.currentTarget as HTMLElement; el.style.color = '#A0AAD0'; el.style.background = 'transparent'; } }}
                >{link.label}</Link>
              ))}
            </nav>

            {/* ── RIGHT ACTIONS ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="desktop-nav">
              <LangToggle />

              {isAuthenticated ? (
                <>
                  {/* Notification bell */}
                  <button style={{
                    width: 38, height: 38, borderRadius: 'var(--r-md)',
                    background: 'rgba(59,110,248,.08)', border: '1px solid rgba(59,110,248,.18)',
                    color: '#A0AAD0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all .2s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#60A5FA'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,110,248,.35)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#A0AAD0'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,110,248,.18)'; }}
                  ><Bell size={17} /></button>

                  {/* User dropdown */}
                  <div style={{ position: 'relative' }} ref={dropRef}>
                    <button onClick={() => setDropdownOpen(v => !v)} style={{
                      display: 'flex', alignItems: 'center', gap: 9,
                      background: 'rgba(59,110,248,.08)', border: '1.5px solid rgba(59,110,248,.22)',
                      padding: '7px 14px', borderRadius: 'var(--r-pill)',
                      color: '#E2E8FF', fontWeight: 700, fontSize: 14,
                      cursor: 'pointer', transition: 'all .2s',
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,110,248,.40)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,110,248,.22)'}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3B6EF8, #6366F1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0,
                      }}>{user?.firstName?.[0]}</div>
                      <span>{user?.firstName}</span>
                      <ChevronDown size={14} color="#60A5FA" style={{ transition: 'transform .2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
                    </button>

                    {dropdownOpen && (
                      <div style={{
                        position: 'absolute', top: 'calc(100% + 10px)',
                        left: isRTL ? 0 : undefined, right: isRTL ? undefined : 0,
                        minWidth: 210,
                        background: '#0D0D1E', border: '1px solid rgba(59,110,248,.22)',
                        borderRadius: 'var(--r-lg)', padding: 8,
                        boxShadow: '0 20px 60px rgba(0,0,0,.8), 0 0 40px rgba(59,110,248,.08)',
                        animation: 'slideDown .18s var(--ease)',
                      }}>
                        {/* User info */}
                        <div style={{ padding: '10px 14px 14px', borderBottom: '1px solid rgba(59,110,248,.10)', marginBottom: 6 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#E2E8FF' }}>{user?.firstName} {user?.lastName}</div>
                          <div style={{ fontSize: 12, color: '#5B6285', marginTop: 2 }}>{user?.email}</div>
                        </div>
                        <Link to="/dashboard" onClick={() => setDropdownOpen(false)} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px', borderRadius: 'var(--r-md)',
                          color: '#E2E8FF', fontSize: 14, fontWeight: 600,
                          transition: 'background .15s',
                        }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(59,110,248,.10)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                        ><LayoutDashboard size={16} color="#3B6EF8" /> {t('nav', 'dashboard')}</Link>
                        <hr style={{ border: 'none', borderTop: '1px solid rgba(59,110,248,.08)', margin: '4px 0' }} />
                        <button onClick={() => { logout(); setDropdownOpen(false); navigate('/'); }} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px', borderRadius: 'var(--r-md)',
                          color: '#FCA5A5', fontSize: 14, fontWeight: 600,
                          background: 'transparent', border: 'none', width: '100%',
                          cursor: 'pointer', textAlign: 'right',
                          transition: 'background .15s',
                        }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,.08)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                        ><LogOut size={15} /> {t('nav', 'logout')}</button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to="/login" style={{
                    padding: '9px 20px', borderRadius: 'var(--r-pill)',
                    color: '#60A5FA', fontWeight: 700, fontSize: 14,
                    border: '1.5px solid rgba(59,110,248,.28)',
                    transition: 'all .2s',
                  }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(59,110,248,.10)'; el.style.borderColor = 'rgba(59,110,248,.50)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.borderColor = 'rgba(59,110,248,.28)'; }}
                  >{t('nav', 'login')}</Link>

                  <Link to="/register" style={{
                    padding: '9px 22px', borderRadius: 'var(--r-pill)',
                    background: 'linear-gradient(135deg, #3B6EF8, #6366F1)',
                    color: '#fff', fontWeight: 700, fontSize: 14,
                    boxShadow: '0 4px 16px rgba(59,110,248,.35)',
                    transition: 'all .2s',
                  }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-1px)'; el.style.boxShadow = '0 8px 28px rgba(59,110,248,.5)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'none'; el.style.boxShadow = '0 4px 16px rgba(59,110,248,.35)'; }}
                  >{t('nav', 'register')}</Link>
                </div>
              )}
            </div>

            {/* ── MOBILE TOGGLE ── */}
            <button onClick={() => setMobileOpen(v => !v)} className="mobile-toggle" style={{
              width: 40, height: 40, borderRadius: 'var(--r-md)',
              background: 'rgba(59,110,248,.10)', border: '1px solid rgba(59,110,248,.22)',
              color: '#60A5FA', display: 'none', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer',
            }}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* ── MOBILE MENU ── */}
        {mobileOpen && (
          <div style={{
            background: 'rgba(7,7,15,.97)', backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(59,110,248,.15)',
            padding: '12px 16px 20px',
            display: 'flex', flexDirection: 'column', gap: 6,
            animation: 'slideDown .2s var(--ease)',
          }}>
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} style={{
                padding: '12px 16px', borderRadius: 'var(--r-md)',
                color: isActive(link.to) ? '#60A5FA' : '#A0AAD0',
                background: isActive(link.to) ? 'rgba(59,110,248,.10)' : 'transparent',
                fontWeight: 600, fontSize: 15, transition: 'all .15s',
              }}>{link.label}</Link>
            ))}
            <div style={{ height: 1, background: 'rgba(59,110,248,.10)', margin: '6px 0' }} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <LangToggle />
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="btn btn-ghost btn-sm">{t('nav', 'dashboard')}</Link>
                  <button onClick={() => { logout(); navigate('/'); }} className="btn btn-sm" style={{ background: 'rgba(239,68,68,.10)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,.18)' }}>
                    {t('nav', 'logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline btn-sm">{t('nav', 'login')}</Link>
                  <Link to="/register" className="btn btn-primary btn-sm">{t('nav', 'register')}</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

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
