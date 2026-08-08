import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCourses } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const FEATURES = [
  { icon:'🎓', title:'دروس تفاعلية', desc:'فيديوهات عالية الجودة وملفات PDF ومحتوى نصي منظّم لكل درس.' },
  { icon:'📝', title:'اختبارات MCQ', desc:'اختبارات متعددة الخيارات مع تصحيح فوري وعرض النتائج التفصيلية.' },
  { icon:'📊', title:'تتبع التقدم', desc:'لوحة تحكم لكل طالب وولي أمر لمتابعة الأداء والنتائج.' },
  { icon:'👩‍🏫', title:'مدرّسون متخصصون', desc:'تعلّم من أفضل المدرّسين مع خبرة في مناهج البكالوريا.' },
  { icon:'📱', title:'متوافق مع الجوال', desc:'استخدم المنصة على أي جهاز في أي وقت ومكان.' },
  { icon:'🔒', title:'نظام آمن', desc:'بيانات مشفّرة وتسجيل دخول آمن لجميع المستخدمين.' },
];

const LEVEL_LABELS = { Bac1:'أولى بكالوريا', Bac2:'تانية بكالوريا', General:'عام' };
const LEVEL_ICONS  = { Bac1:'📚', Bac2:'🎯', General:'💡' };

export default function Home() {
  const { isAuthenticated, role } = useAuth();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    getAllCourses().then(r => setCourses(r.data.slice(0,6))).catch(() => {});
  }, []);

  const dashboardPath = role === 'Teacher' ? '/teacher' : role === 'Parent' ? '/parent' : '/student';

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="dot-grid" />
        <div className="hero__glow" />
        <div className="hero__inner">

          <div className="hero__text reveal-init reveal-in">
            <div className="hero__badge">
              <span className="pulse" />
              منصة EduBarakat التعليمية
            </div>
            <h1 className="hero__title">
              تعلّم مع<br />
              <span className="brand">EduBarakat</span><br />
              وحقّق نجاحك
            </h1>
            <p className="hero__sub">
              منصة تعليمية شاملة للبكالوريا · دروس · اختبارات · نتائج فورية.
              انضم الآن وابدأ رحلتك نحو التفوّق.
            </p>
            <div className="hero__actions">
              {isAuthenticated ? (
                <Link to={dashboardPath} className="btn-primary lg">لوحة التحكم ←</Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary lg">ابدأ مجاناً ←</Link>
                  <Link to="/login" className="btn-ghost" style={{fontSize:'15px',padding:'14px 22px'}}>تسجيل الدخول</Link>
                </>
              )}
            </div>
            <div className="hero__stats">
              <div className="hero__stat">
                <div className="hero__stat-num">+500</div>
                <div className="hero__stat-label">طالب مسجّل</div>
              </div>
              <div className="hero__stat">
                <div className="hero__stat-num">{courses.length || '20'}+</div>
                <div className="hero__stat-label">كورس متاح</div>
              </div>
              <div className="hero__stat">
                <div className="hero__stat-num">98%</div>
                <div className="hero__stat-label">نسبة رضا الطلاب</div>
              </div>
            </div>
          </div>

          <div className="hero__visual">
            <div className="float-chip float-chip--1">🎉 نتائج فورية بعد الاختبار</div>
            <div className="hero__visual-card">
              <div className="hero__logo-display">
                <img src="/logo.jpg" alt="BEdU" />
                <div className="hero__logo-text">
                  <h2>BEdU</h2>
                  <p>EduBarakat Platform</p>
                </div>
              </div>
              <div className="hero__course-list">
                {[
                  { icon:'📐', title:'الرياضيات – أولى بكالوريا', sub:'24 درس · 8 اختبارات' },
                  { icon:'⚗️', title:'الفيزياء – تانية بكالوريا', sub:'18 درس · 6 اختبارات' },
                  { icon:'💻', title:'الإعلام الآلي', sub:'30 درس · 10 اختبارات' },
                ].map((c,i) => (
                  <div className="hero__course-item" key={i}>
                    <div className="hero__course-icon">{c.icon}</div>
                    <div className="hero__course-info">
                      <h4>{c.title}</h4>
                      <p>{c.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="float-chip float-chip--2">✅ تصحيح تلقائي</div>
          </div>

        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────── */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-head">
            <span className="section-eyebrow">لماذا BEdU؟</span>
            <h2>كل ما تحتاجه في مكان واحد</h2>
            <p>منصة شاملة تجمع الدروس والاختبارات ومتابعة الأداء في تجربة واحدة سلسة.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f,i) => (
              <div className="feature-card reveal-init" key={i}
                   ref={el => { if(el) setTimeout(()=>el.classList.add('reveal-in'),i*80); }}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COURSES ──────────────────────────────────────────── */}
      {courses.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <span className="section-eyebrow">الكورسات المتاحة</span>
              <h2>ابدأ رحلتك التعليمية</h2>
            </div>
            <div className="courses-grid">
              {courses.map(c => (
                <div className="course-card" key={c.id}>
                  <div className="course-card__thumb">
                    {LEVEL_ICONS[c.level] || '📖'}
                  </div>
                  <div className="course-card__body">
                    {c.level && (
                      <div className="course-card__level">
                        <span className="badge badge--mint">{LEVEL_LABELS[c.level] || c.level}</span>
                      </div>
                    )}
                    <h3 className="course-card__title">{c.title}</h3>
                    {c.description && <p className="course-card__desc">{c.description.slice(0,100)}...</p>}
                    <div className="course-card__meta">
                      <span>📚 {c.lessonCount} درس</span>
                      <span>👥 {c.enrollmentCount} طالب</span>
                    </div>
                    <p className="course-card__teacher">المدرّس: {c.teacherName}</p>
                    <Link to={isAuthenticated ? '/student' : '/register'} className="btn-primary" style={{width:'100%',justifyContent:'center'}}>
                      {isAuthenticated ? 'عرض الكورس' : 'سجّل الآن'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div style={{textAlign:'center', marginTop:'32px'}}>
              <Link to="/courses" className="btn-ghost" style={{fontSize:'15px', padding:'12px 28px'}}>
                عرض جميع الكورسات →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="cta-section">
            <div className="dot-grid" />
            <div style={{position:'relative',zIndex:1}}>
              <h2>هل أنت مستعد للنجاح؟</h2>
              <p>انضم إلى آلاف الطلاب الذين يحقّقون أهدافهم مع EduBarakat.</p>
              {!isAuthenticated ? (
                <div style={{display:'flex',gap:'14px',justifyContent:'center',flexWrap:'wrap'}}>
                  <Link to="/register" className="btn-primary lg">سجّل كطالب</Link>
                  <Link to="/register" className="btn-ghost" style={{fontSize:'16px',padding:'14px 28px'}}>سجّل كمدرّس</Link>
                </div>
              ) : (
                <Link to={dashboardPath} className="btn-primary lg">انتقل للوحة التحكم</Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer__grid">
          <div className="footer__brand">
            <img src="/logo.jpg" className="nav__logo" alt="BEdU" />
            <div className="bedu-name">BEdU · EduBarakat</div>
            <p>منصة تعليمية شاملة لطلاب البكالوريا. دروس · اختبارات · نتائج.</p>
          </div>
          <div className="footer__col">
            <h4>المنصة</h4>
            <Link to="/">الرئيسية</Link>
            <Link to="/courses">الكورسات</Link>
            <Link to="/register">التسجيل</Link>
          </div>
          <div className="footer__col">
            <h4>الحساب</h4>
            <Link to="/login">تسجيل الدخول</Link>
            <Link to="/register">حساب جديد</Link>
          </div>
          <div className="footer__col">
            <h4>الأدوار</h4>
            <span style={{fontSize:'13.5px',color:'var(--text-soft)',display:'block',marginBottom:'8px'}}>طالب</span>
            <span style={{fontSize:'13.5px',color:'var(--text-soft)',display:'block',marginBottom:'8px'}}>ولي أمر</span>
            <span style={{fontSize:'13.5px',color:'var(--text-soft)',display:'block'}}>مدرّس</span>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© 2026 BEdU · EduBarakat. جميع الحقوق محفوظة.</span>
          <span style={{fontFamily:'var(--font-latin)', fontSize:'12px'}}>Barakat Education Platform</span>
        </div>
      </footer>
    </>
  );
}
