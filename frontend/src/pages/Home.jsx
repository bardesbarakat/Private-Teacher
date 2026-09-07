import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAllCourses } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

/* ── Reveal on scroll hook ── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('reveal-in'); obs.unobserve(el); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ── FAQ Item ── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? ' open' : ''}`}>
      <button className="faq-q" onClick={() => setOpen(o => !o)}>
        <span>{q}</span>
        <span className="faq-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </span>
      </button>
      {open && <div className="faq-a">{a}</div>}
    </div>
  );
}

/* ── Revealed card wrapper ── */
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => el.classList.add('reveal-in'), delay);
          obs.unobserve(el);
        }
      },
      { threshold: 0.10 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return <div ref={ref} className={`reveal-init${className ? ' ' + className : ''}`}>{children}</div>;
}

const TELEGRAM_SVG = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const PHONE_SVG = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.32-1.32a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const FAQ_DATA = [
  { q: 'ليه أتعلّم هنا تحديدًا؟', a: 'لأن المدرّسين عندنا مش مجرد أكاديميين — هم مهندسون بيبنوا أنظمة حقيقية وبيعلّموا من خبرة سوق فعلية. الشرح عملي ومبسّط وموصّل.' },
  { q: 'الدروس أونلاين ولا حضورية؟', a: 'الاثنان معاً. تقدر تحضر في سنترنا أو تتابع أونلاين بنفس جودة الشرح تمامًا. اختار اللي يناسبك عند التسجيل.' },
  { q: 'هل أحتاج خلفية سابقة في البرمجة؟', a: 'لا تحتاج أي خبرة سابقة. الدروس بتبدأ من الصفر تمامًا وتتدرّج خطوة بخطوة مع تدريبات وأسئلة على نمط الامتحان.' },
  { q: 'إيه اللي بيميّز الشرح عن أي حصة تانية؟', a: 'الحصة مش محاضرة تحفظها. المفاهيم الصعبة بنحوّلها لمشاريع تبنيها بإيدك، وفيه تطبيق عملي في كل حصة. وكمان معاك متابعة ومراجعات دورية وملخصات وشهادة إتمام معتمدة.' },
  { q: 'هل تشمل الدورة المراجعة والاستعداد للامتحان؟', a: 'نعم. بتتضمن كل دورة مراجعات دورية ونماذج إجابات وتدريبات على نمط الامتحان عشان تكون مستعد وواثق يوم الامتحان.' },
  { q: 'ده للامتحان بس ولا هيفيدني بعد البكالوريا؟', a: 'الاثنين. الشرح مبني على المنهج الرسمي ودرجاتك أولوية. لكن اللي بتتعلمه — Python والخوارزميات وOOP وتطبيقات AI — هو نفس أساس اللي مهندسين البرمجيات بيشتغلوا بيه.' },
];

export default function Home() {
  const { isAuthenticated, role } = useAuth();
  const [courses, setCourses] = useState([]);
  const [regForm, setRegForm] = useState({ firstName: '', lastName: '', phone: '', grade: '' });
  const [regDone, setRegDone] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  const dashPath = role === 'Teacher' ? '/teacher' : role === 'Parent' ? '/parent' : '/student';

  useEffect(() => {
    getAllCourses().then(r => setCourses(r.data.slice(0, 3))).catch(() => {});
  }, []);

  const handleQuickReg = (e) => {
    e.preventDefault();
    setRegLoading(true);
    setTimeout(() => { setRegLoading(false); setRegDone(true); }, 1500);
  };

  return (
    <>
      {/* ▸ HERO ─────────────────────────────────────────────── */}
      <section id="hero">
        <div className="dot-grid" />
        <div className="hero-glow" />

        {/* AI network SVG decoration — original */}
        <svg viewBox="0 0 600 500" style={{position:'absolute',left:'20px',top:'180px',width:'min(600px,46vw)',opacity:.4,pointerEvents:'none'}} fill="none" aria-hidden="true">
          <g stroke="var(--mint-glow)" strokeWidth="1">
            <line x1="80" y1="80" x2="220" y2="140"/><line x1="220" y1="140" x2="160" y2="280"/>
            <line x1="220" y1="140" x2="360" y2="100"/><line x1="360" y1="100" x2="420" y2="240"/>
            <line x1="160" y1="280" x2="300" y2="340"/><line x1="300" y1="340" x2="420" y2="240"/>
            <line x1="300" y1="340" x2="240" y2="440"/><line x1="420" y1="240" x2="500" y2="360"/>
          </g>
          <g fill="var(--mint)">
            <circle cx="80"  cy="80"  r="3" style={{animation:'pulseNode 3s ease-in-out infinite'}}/>
            <circle cx="220" cy="140" r="3" style={{animation:'pulseNode 3s ease-in-out .5s infinite'}}/>
            <circle cx="360" cy="100" r="3" style={{animation:'pulseNode 3s ease-in-out 1s infinite'}}/>
            <circle cx="160" cy="280" r="3" style={{animation:'pulseNode 3s ease-in-out 1.4s infinite'}}/>
            <circle cx="300" cy="340" r="3" style={{animation:'pulseNode 3s ease-in-out .8s infinite'}}/>
            <circle cx="420" cy="240" r="3" style={{animation:'pulseNode 3s ease-in-out 1.8s infinite'}}/>
            <circle cx="500" cy="360" r="3" style={{animation:'pulseNode 3s ease-in-out 2.2s infinite'}}/>
            <circle cx="240" cy="440" r="3" style={{animation:'pulseNode 3s ease-in-out 1.2s infinite'}}/>
          </g>
        </svg>

        <div className="hero-inner">
          {/* Left text */}
          <div className="hero-text">
            <div className="hero-badge">
              <span className="pulse" />
              <span>البرمجة والذكاء الاصطناعي · البكالوريا</span>
            </div>
            <h1 className="hero-h1">أتقن <span>البرمجة</span><br />والذكاء الاصطناعي</h1>
            <p className="hero-sub">
              اتعلّم على يد نخبة من المدرّسين المتخصصين — دروس عملية ومُركّزة على الامتحان لأولى وتانية بكالوريا، في السناتر وأونلاين.
            </p>
            <div className="hero-actions">
              {isAuthenticated
                ? <Link to={dashPath} className="btn-primary large">لوحة التحكم ←</Link>
                : <Link to="/register" className="btn-primary large">سجّل الآن ←</Link>
              }
              <Link to="/courses" className="btn-outline">شاهد الكورسات</Link>
            </div>
            <div className="hero-trust">
              <div className="hero-trust-item">
                <span style={{color:'var(--mint)',fontSize:'18px'}}>✦</span>
                <span>مدرّسون معتمدون</span>
              </div>
              <div className="sep" />
              <div className="hero-trust-item">
                <b style={{color:'var(--text)',fontFamily:'var(--font-latin)'}}>+10,000</b>
                <span>طالب</span>
              </div>
              <div className="sep" />
              <div className="hero-trust-item">
                <span>منذ</span>
                <b style={{color:'var(--text)',fontFamily:'var(--font-latin)'}}>2018</b>
              </div>
            </div>
          </div>

          {/* Right visual — Abstract IDE & Student Badges */}
          <div className="hero-portrait" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: 'min(500px, 60vh)', perspective: '1000px' }}>
            <style>
              {`
                @keyframes floatUp {
                  0% { transform: translateY(40px) scale(0.95); opacity: 0; }
                  100% { transform: translateY(0) scale(1); opacity: 1; }
                }
                @keyframes pulseGlowHero {
                  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
                  50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.7; }
                  100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
                }
                @keyframes floatBadge {
                  0% { transform: translateY(0px); }
                  50% { transform: translateY(-12px); }
                  100% { transform: translateY(0px); }
                }
                .hero-image-container {
                  animation: floatUp 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                  transition: transform 0.5s ease;
                }
                .hero-image-container:hover {
                  transform: scale(1.02) rotateY(-5deg) rotateX(5deg);
                  box-shadow: 0 30px 60px rgba(52, 211, 153, 0.2);
                }
                .badge-delay-1 { animation: floatBadge 4s ease-in-out infinite, floatUp 1s ease-out 0.4s both; }
                .badge-delay-2 { animation: floatBadge 5s ease-in-out infinite reverse, floatUp 1s ease-out 0.6s both; }
              `}
            </style>

            <div className="portrait-glow" style={{ position: 'absolute', width: '150%', height: '150%', background: 'radial-gradient(circle, var(--mint-soft) 0%, transparent 60%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', animation: 'pulseGlowHero 6s infinite ease-in-out' }} />
            
            {/* Hero Image Illustration */}
            <div className="hero-image-container" style={{ position: 'relative', width: '100%', maxWidth: '480px', borderRadius: '20px', border: '1px solid var(--line-soft)', background: 'var(--bg-card)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)', zIndex: 2, display: 'flex', overflow: 'hidden' }}>
               <img src="/hero_illustration.jpg" alt="Student learning programming and AI" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
            </div>

            {/* Student & Learning Badges */}
            <div className="badge-delay-1" style={{ position: 'absolute', top: '10%', right: '-15%', background: 'var(--bg-1)', border: '1px solid var(--mint)', color: 'var(--mint)', padding: '12px 18px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', zIndex: 3, backdropFilter: 'blur(10px)' }}>
               <div style={{ fontSize: '26px' }}>🎓</div>
               <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 'bold', color: 'var(--text)' }}>مستقبل واعد</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-soft)', marginTop: '2px' }}>لطلاب البكالوريا</div>
               </div>
            </div>
            
            <div className="badge-delay-2" style={{ position: 'absolute', bottom: '15%', left: '-15%', background: 'var(--bg-1)', border: '1px solid var(--violet)', color: 'var(--violet)', padding: '12px 18px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', zIndex: 3, backdropFilter: 'blur(10px)' }}>
               <div style={{ fontSize: '26px' }}>💡</div>
               <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 'bold', color: 'var(--text)' }}>تطبيق عملي</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-soft)', marginTop: '2px' }}>مشاريع برمجة حقيقية</div>
               </div>
            </div>
            
            {/* Spinning background elements */}
            <div className="portrait-ring" style={{ position: 'absolute', width: '450px', height: '450px', borderRadius: '50%', border: '1px dashed var(--mint)', opacity: 0.3, animation: 'spin 30s linear infinite', pointerEvents: 'none', zIndex: 1 }} />
            <div className="portrait-ring" style={{ position: 'absolute', width: '350px', height: '350px', borderRadius: '50%', border: '1px solid var(--violet)', opacity: 0.15, animation: 'spin 20s linear infinite reverse', pointerEvents: 'none', zIndex: 1 }} />
          </div>
        </div>
      </section>



      {/* ▸ TRUST SECTION (Barakat Platform Advanced Courses) ───────────────────────── */}
      <section className="section" style={{ padding: '20px 0 60px' }}>
        <div className="container">
          <div style={{ background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--line)', padding: '40px', display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, var(--mint-soft) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
            
            {/* Content Left (RTL) */}
            <div style={{ flex: '1 1 500px', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-block', background: 'var(--mint-soft)', color: 'var(--mint-text)', padding: '8px 16px', borderRadius: 'var(--r-pill)', fontSize: '13px', fontWeight: 'bold' }}>كورسـات متقدمة بعد التأسيس</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ background: 'var(--bg-0)', padding: '4px 12px', borderRadius: '16px', border: '1px solid var(--line)', fontSize: '12px', fontWeight: 'bold', color: 'var(--text)' }}>TOFAS</span>
                  <span style={{ background: 'var(--bg-0)', padding: '4px 12px', borderRadius: '16px', border: '1px solid var(--line)', fontSize: '12px', fontWeight: 'bold', color: 'var(--text)' }}>Sprix</span>
                </div>
              </div>
              
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: '900', marginBottom: '18px', lineHeight: 1.3, color: 'var(--text)' }}>
                منصة بركات تقدم الكورسات المتقدمة لطلاب البكالوريا على TOFAS
              </h2>
              
              <div style={{ color: 'var(--text-soft)', fontSize: '16px', lineHeight: 1.8, marginBottom: '28px' }}>
                <p style={{ marginBottom: '12px' }}>منصة بركات لا تكتفي بشرح Programming & AI بطريقة تقليدية، بل تقدم الكورسات المتقدمة المعتمدة الموجودة على منصة TOFAS العالمية من خلال مؤسسة Sprix.</p>
                <p>هذا يعني أن الطالب لا يتعلم المنهج فقط، بل يخطو خطوة أكبر في طريق البرمجة ويكتسب مهارات حقيقية تساعده بعد البكالوريا.</p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-1)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--line)', marginBottom: '32px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--mint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
                <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '600', lineHeight: 1.6 }}>الكورسات المتقدمة التي تظهر على TOFAS مصممة ومقدمة عبر منصة بركات بالتعاون مع Sprix.</span>
              </div>

              {/* Path / Journey */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '36px' }}>
                <span style={{ padding: '8px 16px', background: 'var(--bg-0)', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', border: '1px dashed var(--line)', color: 'var(--text-soft)' }}>أساس البكالوريا</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2"><path d="m15 19-7-7 7-7"></path></svg>
                <span style={{ padding: '8px 16px', background: 'var(--bg-0)', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', border: '1px dashed var(--line)', color: 'var(--mint)' }}>Programming & AI</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2"><path d="m15 19-7-7 7-7"></path></svg>
                <span style={{ padding: '8px 16px', background: 'var(--mint-soft)', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', color: 'var(--mint-text)' }}>كورسات TOFAS المتقدمة</span>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link to={isAuthenticated ? '/student' : '/register'} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                  ابدأ رحلتك مع بركات
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
                </Link>
                <Link to="/courses" className="btn-outline" style={{ padding: '12px 24px' }}>اكتشف مساراتنا</Link>
              </div>
            </div>

            {/* Visual Right (Abstract Dashboard/Ecosystem) */}
            <div style={{ flex: '1 1 350px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
              <div style={{ width: '100%', maxWidth: '420px', height: 'auto', minHeight: '380px', background: 'linear-gradient(145deg, var(--bg-1), var(--bg-0))', borderRadius: '24px', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                {/* Abstract Window Header */}
                <div style={{ padding: '16px', background: 'var(--bg-card)', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }} />
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }} />
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-dim)', fontFamily: 'monospace' }}>Barakat_Ecosystem.exe</span>
                </div>
                {/* Grid Elements */}
                <div style={{ padding: '24px', flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignContent: 'center' }}>
                  <div style={{ background: 'var(--bg-card)', padding: '24px 16px', borderRadius: '16px', border: '1px solid var(--line)', textAlign: 'center', transition: 'transform 0.3s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.transform='translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform='translateY(0)'}>
                    <div style={{ fontSize: '38px', marginBottom: '16px' }}>🧠</div>
                    <div style={{ fontSize: '14.5px', fontWeight: 'bold', color: 'var(--text)' }}>الذكاء الاصطناعي</div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', padding: '24px 16px', borderRadius: '16px', border: '1px solid var(--line)', textAlign: 'center', transition: 'transform 0.3s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.transform='translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform='translateY(0)'}>
                    <div style={{ fontSize: '38px', marginBottom: '16px' }}>💻</div>
                    <div style={{ fontSize: '14.5px', fontWeight: 'bold', color: 'var(--text)' }}>برمجة بايثون</div>
                  </div>
                  <div style={{ background: 'var(--mint-soft)', padding: '24px', borderRadius: '16px', border: '1px solid var(--mint-line)', gridColumn: 'span 2', textAlign: 'center', color: 'var(--mint-text)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '22px', fontWeight: '900', marginBottom: '6px' }}>100%</div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>جاهزية تامة لاختبارات البكالوريا</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ▸ COURSES ──────────────────────────────────────────── */}
      <section id="courses" className="section">
        <div className="container">
          <div className="section-head">
            <span className="section-eyebrow">الكورسات</span>
            <h2>البرمجة والذكاء الاصطناعي<br />لأولى وتانية بكالوريا</h2>
            <p>مساران مُنظّمان ينقلانك من الأساسيات تمامًا حتى بناء تطبيقات ذكاء اصطناعي حقيقية.</p>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'24px'}}>

            {/* Course 1 */}
            <Reveal delay={0}>
              <div className="course-card">
                <div className="course-card__glow" />
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span className="course-badge">المستوى التأسيسي</span>
                  <span className="course-num">01</span>
                </div>
                <h3>أولى بكالوريا</h3>
                <p>تأسيس قوي في البرمجة واكتشاف عالم الذكاء الاصطناعي من البداية.</p>
                <div className="course-features">
                  <div className="course-feature"><span>✓</span><span>التفكير الحسابي وحل المشكلات</span></div>
                  <div className="course-feature"><span>✓</span><span>أساسيات البرمجة بلغة Python</span></div>
                  <div className="course-feature"><span>✓</span><span>الخوارزميات وهياكل البيانات البسيطة</span></div>
                  <div className="course-feature"><span>✓</span><span>مقدمة في الذكاء الاصطناعي ومجالاته</span></div>
                </div>
                <Link to={isAuthenticated ? '/student' : '/register'} className="course-cta">سجّل في الكورس ←</Link>
              </div>
            </Reveal>

            {/* Course 2 */}
            <Reveal delay={80}>
              <div className="course-card" style={{borderColor:'rgba(167,139,250,.22)',background:'linear-gradient(170deg,rgba(50,30,80,.4),rgba(255,255,255,.02))'}}>
                <div className="course-card__glow" style={{background:'radial-gradient(circle,rgba(167,139,250,.15),transparent 70%)'}} />
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span className="course-badge" style={{color:'#c4b5fd',background:'rgba(167,139,250,.10)',borderColor:'rgba(167,139,250,.25)'}}>المستوى المتقدم</span>
                  <span className="course-num" style={{color:'rgba(167,139,250,.35)'}}>02</span>
                </div>
                <h3>تانية بكالوريا</h3>
                <p>انتقل لمستوى أعلى في البرمجة وابنِ تطبيقات ذكاء اصطناعي عملية.</p>
                <div className="course-features">
                  <div className="course-feature"><span style={{color:'var(--violet)'}}>✓</span><span>البرمجة كائنية التوجه (OOP)</span></div>
                  <div className="course-feature"><span style={{color:'var(--violet)'}}>✓</span><span>هياكل بيانات وخوارزميات متقدمة</span></div>
                  <div className="course-feature"><span style={{color:'var(--violet)'}}>✓</span><span>بناء تطبيقات ذكاء اصطناعي عملية</span></div>
                  <div className="course-feature"><span style={{color:'var(--violet)'}}>✓</span><span>أساسيات تحليل البيانات</span></div>
                </div>
                <Link to={isAuthenticated ? '/student' : '/register'} className="course-cta" style={{background:'linear-gradient(135deg,#A78BFA,#7C3AED)'}}>سجّل في الكورس ←</Link>
              </div>
            </Reveal>

            {/* Course 3 */}
            <Reveal delay={160}>
              <div className="course-card" style={{borderColor:'rgba(251,191,36,.22)',background:'linear-gradient(170deg,rgba(70,50,10,.4),rgba(255,255,255,.02))'}}>
                <div className="course-card__glow" style={{background:'radial-gradient(circle,rgba(251,191,36,.12),transparent 70%)'}} />
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span className="course-badge" style={{color:'#fde68a',background:'rgba(251,191,36,.10)',borderColor:'rgba(251,191,36,.25)'}}>تحضير للامتحانات</span>
                  <span className="course-num" style={{color:'rgba(251,191,36,.35)'}}>03</span>
                </div>
                <h3>مراجعة مكثفة</h3>
                <p>مراجعة شاملة ونماذج امتحانات متكررة لضمان أعلى الدرجات.</p>
                <div className="course-features">
                  <div className="course-feature"><span style={{color:'var(--amber)'}}>✓</span><span>نماذج امتحانات السنوات السابقة</span></div>
                  <div className="course-feature"><span style={{color:'var(--amber)'}}>✓</span><span>تدريبات على نمط الامتحان الرسمي</span></div>
                  <div className="course-feature"><span style={{color:'var(--amber)'}}>✓</span><span>مراجعة سريعة للمفاهيم الأساسية</span></div>
                  <div className="course-feature"><span style={{color:'var(--amber)'}}>✓</span><span>جلسات أسئلة وأجوبة مباشرة</span></div>
                </div>
                <Link to="/courses" className="course-cta" style={{background:'linear-gradient(135deg,#FBBF24,#D97706)'}}>سجّل في الكورس ←</Link>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ▸ WHY US ───────────────────────────────────────────── */}
      <section className="section section--alt" id="about">
        <div className="container">
          <div className="section-head">
            <span className="section-eyebrow">لماذا نحن</span>
            <h2>ليه Barakat Education Platform مختلفة؟</h2>
            <p>ما بيميّزنا مش بس المحتوى — هو الأسلوب والمتابعة والنتيجة الفعلية.</p>
          </div>
          <div className="why-grid">
            {[
              { icon:'🎯', title:'مركّز على الامتحان', desc:'كل درس مُصمَّم بعناية ليغطي المنهج الرسمي ويتدرّب الطالب على أسلوب أسئلة الامتحان تحديدًا.' },
              { icon:'💻', title:'تطبيق عملي فعلي', desc:'مش حفظ نظري — كل مفهوم بتبنيه بإيدك على الكمبيوتر. بتخرج من كل درس بكود شغّال.' },
              { icon:'📊', title:'متابعة وتقييم دوري', desc:'نظام اختبارات دوري يتابع تقدّمك خطوة بخطوة، مع تقارير واضحة لك ولأهلك.' },
              { icon:'📱', title:'أونلاين وحضوري', desc:'اختار اللي يناسبك — حضور في السنتر أو متابعة أونلاين بنفس جودة الشرح تمامًا.' },
              { icon:'🏆', title:'شهادة معتمدة', desc:'بتخرج بشهادة إتمام معتمدة تضيفها لمعرض أعمالك وتفيدك في مسيرتك الجامعية والمهنية.' },
              { icon:'💬', title:'دعم على Telegram', desc:'قناة Telegram مخصصة لكل كورس تقدر فيها تسأل وتتفاعل مع زملاءك والمدرّس على مدار اليوم.' },
            ].map((w, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="why-card">
                  <div className="why-icon">{w.icon}</div>
                  <h3>{w.title}</h3>
                  <p>{w.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

   
      {/* ▸ BENEFITS + QUICK REGISTER ─────────────────────── */}
      <section id="register" className="section section--alt">
        <div className="container">
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'32px',alignItems:'start'}}>
            <Reveal>
              <div className="benefits-card">
                <span className="section-eyebrow" style={{textAlign:'right',display:'block',marginBottom:'20px'}}>مزايا التسجيل</span>
                <h2 style={{fontSize:'clamp(24px,3vw,32px)',fontWeight:700}}>لمّا تسجّل معنا، بتحصل على كل ده</h2>
                <div className="benefit-list">
                  {[
                    ['شرح مُبسَّط عملي','— من الأساسيات لغاية الاحتراف'],
                    ['نماذج امتحانات وتدريبات','— على نمط الامتحان الرسمي'],
                    ['مراجعات ومصادر إضافية','— PDF ملخصات لكل وحدة'],
                    ['دعم على Telegram','— سؤال في أي وقت'],
                    ['مشروع تخرج كامل','— تضيفه لمعرض أعمالك'],
                    ['شهادة إتمام معتمدة','— رقمية وقابلة للتحقق'],
                  ].map(([bold, rest], i) => (
                    <div key={i} className="benefit-item">
                      <div className="benefit-check">✓</div>
                      <p className="benefit-text"><strong>{bold}</strong> {rest}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Quick register form — original */}
            <Reveal delay={80}>
              <div style={{background:'rgba(11,17,14,.6)',border:'1px solid var(--mint-line)',borderRadius:'var(--r-lg)',padding:'36px',backdropFilter:'blur(10px)'}}>
                {regDone ? (
                  <div style={{textAlign:'center',padding:'20px'}}>
                    <div style={{fontSize:'40px',marginBottom:'12px'}}>🎉</div>
                    <p style={{fontSize:'17px',fontWeight:700,color:'var(--mint-text)'}}>تم التسجيل بنجاح!</p>
                    <p style={{fontSize:'14px',color:'var(--text-soft)',marginTop:'6px'}}>سيتواصل معك فريقنا قريبًا لتأكيد المجموعة والمواعيد.</p>
                  </div>
                ) : (
                  <>
                    <h2 style={{fontSize:'26px',fontWeight:700,marginBottom:'8px'}}>سجّل الآن — مجاناً</h2>
                    <p style={{fontSize:'15px',color:'var(--text-soft)',marginBottom:'24px'}}>ابدأ رحلتك التعليمية وفريقنا سيتواصل معك لتحديد الموعد والمجموعة.</p>
                    <form style={{display:'flex',flexDirection:'column',gap:'14px'}} onSubmit={handleQuickReg}>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                        <div className="auth-field">
                          <label className="auth-label">الاسم الأول</label>
                          <input type="text" className="auth-input" placeholder="محمود" required
                            value={regForm.firstName} onChange={e => setRegForm({...regForm, firstName: e.target.value})} />
                        </div>
                        <div className="auth-field">
                          <label className="auth-label">الاسم الأخير</label>
                          <input type="text" className="auth-input" placeholder="شرف" required
                            value={regForm.lastName} onChange={e => setRegForm({...regForm, lastName: e.target.value})} />
                        </div>
                      </div>
                      <div className="auth-field">
                        <label className="auth-label">رقم الهاتف</label>
                        <input type="tel" className="auth-input" placeholder="01XXXXXXXXX" required
                          value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} dir="ltr" />
                      </div>
                      <div className="auth-field">
                        <label className="auth-label">الصف الدراسي</label>
                        <select className="auth-input" required
                          value={regForm.grade} onChange={e => setRegForm({...regForm, grade: e.target.value})}>
                          <option value="">اختر صفّك</option>
                          <option value="bac1">أولى بكالوريا</option>
                          <option value="bac2">تانية بكالوريا</option>
                        </select>
                      </div>
                      <button type="submit" className="auth-btn" disabled={regLoading}>
                        {regLoading ? 'جارٍ التسجيل...' : 'سجّل الآن ←'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ▸ FAQ ───────────────────────────────────────────────── */}
      <section id="faq" className="section">
        <div className="container" style={{maxWidth:'820px'}}>
          <div className="section-head">
            <span className="section-eyebrow">الأسئلة الشائعة</span>
            <h2>أي سؤال في دماغك؟</h2>
            <p>إجابات على أكثر الأسئلة اللي بيسألنا فيها الطلاب وأهاليهم.</p>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            {FAQ_DATA.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>



      <Footer />
    </>
  );
}
