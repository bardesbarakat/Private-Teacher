import { Link } from 'react-router-dom';

const TELEGRAM_SVG = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand column — original HTML converted */}
          <div className="footer__brand">
            <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}>
              <div className="nav__mark">
                <img src="/logo.jpg" alt="Barakat Education Platform logo" />
              </div>
              <h3 style={{margin:0}}>Barakat Education Platform</h3>
            </div>
            <p>المنصة التعليمية المتخصصة في تعليم البرمجة والذكاء الاصطناعي لطلاب البكالوريا — بخبرة حقيقية ونتائج مُثبَتة.</p>
            <div className="social-links" style={{marginTop:'20px'}}>
              <a href="#" className="social-link" aria-label="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Telegram">
                {TELEGRAM_SVG}
              </a>
              <a href="#" className="social-link" aria-label="YouTube">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>
              </a>
            </div>
          </div>

          <div className="footer__col">
            <h4>الكورسات</h4>
            <div className="footer__links">
              <Link to="/courses">أولى بكالوريا</Link>
              <Link to="/courses">تانية بكالوريا</Link>
              <Link to="/courses">المراجعة المكثّفة</Link>
              <Link to="/courses">تصفّح الكل</Link>
            </div>
          </div>

          <div className="footer__col">
            <h4>المنصة</h4>
            <div className="footer__links">
              <Link to="/">الرئيسية</Link>
              <a href="/#about">عن المنصة</a>
              <a href="/#faq">الأسئلة الشائعة</a>
              <a href="/#contact">تواصل معنا</a>
            </div>
          </div>

          <div className="footer__col">
            <h4>الحساب</h4>
            <div className="footer__links">
              <Link to="/login">تسجيل الدخول</Link>
              <Link to="/register">إنشاء حساب</Link>
              <Link to="/register">سجّل الآن</Link>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© 2026 Barakat Education Platform. جميع الحقوق محفوظة.</span>
          <div style={{display:'flex',gap:'16px'}}>
            <a href="#" style={{color:'var(--text-dim)',fontSize:'13px',transition:'color .2s'}}>الخصوصية</a>
            <a href="#" style={{color:'var(--text-dim)',fontSize:'13px',transition:'color .2s'}}>الشروط والأحكام</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
