import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout, role } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };
  const dashPath = role === 'Teacher' ? '/teacher' : role === 'Parent' ? '/parent' : '/student';

  return (
    <>
      {/* ── Main Nav ── (faithfully from original index.html nav) */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`} id="mainNav">
        <Link to="/" className="nav__brand">
          <div className="nav__mark">
            <img src="/logo.jpg" alt="Barakat Education Platform logo" />
          </div>
          <div className="nav__name-wrap">
            <span className="nav__name">Barakat Education Platform</span>
            <span className="nav__tagline">منصة البرمجة والذكاء الاصطناعي</span>
          </div>
        </Link>

        <div className="nav__links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>الرئيسية</NavLink>
          <NavLink to="/courses" className={({ isActive }) => isActive ? 'active' : ''}>الكورسات</NavLink>
          <a href="/#about">عن المنصة</a>
          <a href="/#faq">الأسئلة الشائعة</a>
      
          {isAuthenticated && <NavLink to={dashPath} className={({ isActive }) => isActive ? 'active' : ''}>لوحة التحكم</NavLink>}
        </div>

        <div className="nav__actions">
          {isAuthenticated ? (
            <>
              <span style={{fontSize:'13.5px',color:'var(--text-soft)',padding:'8px 0'}}>{user?.fullNameAr?.split(' ')[0]}</span>
              <button className="btn-ghost" onClick={handleLogout}>خروج</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">تسجيل الدخول</Link>
              <Link to="/register" className="btn-primary" style={{padding:'10px 18px',fontSize:'14px'}}>سجّل الآن</Link>
            </>
          )}
          <button
            className="nav__burger" id="burgerBtn" type="button"
            aria-label="القائمة" onClick={() => setMenuOpen(o => !o)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`} id="mobileMenu">
        <NavLink to="/" end onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>الرئيسية</NavLink>
        <NavLink to="/courses" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>الكورسات</NavLink>
        <a href="/#about" onClick={() => setMenuOpen(false)}>عن المنصة</a>
        <a href="/#faq" onClick={() => setMenuOpen(false)}>الأسئلة الشائعة</a>
        <a href="/#contact" onClick={() => setMenuOpen(false)}>تواصل معنا</a>
        {isAuthenticated ? (
          <>
            <NavLink to={dashPath} onClick={() => setMenuOpen(false)}>لوحة التحكم</NavLink>
            <button onClick={handleLogout} style={{color:'var(--danger)',background:'none',border:'none',fontSize:'16px',padding:'13px 6px',borderBottom:'1px solid var(--line-soft)',textAlign:'right',cursor:'pointer'}}>تسجيل الخروج</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setMenuOpen(false)}>تسجيل الدخول</Link>
            <Link to="/register" onClick={() => setMenuOpen(false)} style={{color:'var(--mint)',fontWeight:700}}>سجّل الآن</Link>
          </>
        )}
      </div>
    </>
  );
}
