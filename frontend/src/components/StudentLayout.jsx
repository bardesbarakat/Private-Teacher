import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from './Navbar';
import '../pages/StudentDashboard.css';

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <Navbar />
      <div className={`student-dash-layout ${lang === 'ar' ? 'rtl-mode' : ''}`} style={{ paddingTop: '70px' }}>
        {/* LEFT SIDEBAR */}
        <aside className="dash-sidebar">
          <nav className="sidebar-nav">
            <a href="#" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
              🏠 {lang === 'ar' ? 'الرئيسية' : 'Home'}
            </a>
            <a href="#" className={`nav-item ${isActive('/sessions') ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('/sessions'); }}>
              📅 {lang === 'ar' ? 'الجلسات' : 'Sessions'}
            </a>
            <a href="#" className={`nav-item ${isActive('/course-materials') ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('/course-materials'); }}>
              📚 {lang === 'ar' ? 'المادة العلمية' : 'Course Materials'}
            </a>
            <a href="#" className={`nav-item ${isActive('/exams') ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('/exams'); }}>
              📝 {lang === 'ar' ? 'الاختبارات' : 'Exams'}
            </a>
            <a href="#" className={`nav-item ${isActive('/projects') ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('/projects'); }}>
              🚀 {lang === 'ar' ? 'المشاريع' : 'Projects'}
            </a>
            <a href="#" className={`nav-item ${isActive('/resources') ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('/resources'); }}>
              📂 {lang === 'ar' ? 'المصادر' : 'Resources'}
            </a>
            <a href="#" className={`nav-item ${isActive('/faqs') ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('/faqs'); }}>
              ❓ {lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQS'}
            </a>
            <a href="#" className={`nav-item ${isActive('/profile') ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('/profile'); }}>
              👤 {lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
            </a>
          </nav>
          <div className="sidebar-footer">
            <button className="nav-item text-danger" onClick={handleLogout}>
              🚪 {lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="dash-main">
          {/* Dynamic Page Content */}
          <div className="dash-content-wrapper">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
