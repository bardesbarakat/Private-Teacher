import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Star, Users, Code, Zap, BookOpen, Award, Clock, ChevronRight, Play, Shield, TrendingUp } from 'lucide-react';
import { coursesApi } from '../api/client';
import CourseCard from '../components/CourseCard';
import { useLanguage } from '../i18n/LanguageContext';

// ── Inline SVG helpers ──────────────────────────────────────────
const GradientIcon = ({ icon: Icon, color1 = '#3B6EF8', color2 = '#6366F1' }: any) => (
  <div style={{
    width: 56, height: 56, borderRadius: 16,
    background: `linear-gradient(135deg, ${color1}18, ${color2}18)`,
    border: `1px solid ${color1}30`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  }}>
    <Icon size={26} style={{ color: color1 }} />
  </div>
);

const StatBadge = ({ n, label, icon: Icon }: { n: string; label: string; icon: any }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 14,
    background: 'rgba(13,13,30,.85)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(59,110,248,.22)',
    borderRadius: 16, padding: '14px 20px',
    boxShadow: '0 8px 32px rgba(0,0,0,.5)',
    animation: 'float 4s ease-in-out infinite',
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 12,
      background: 'linear-gradient(135deg, #3B6EF8, #6366F1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 14px rgba(59,110,248,.35)',
    }}>
      <Icon size={20} color="#fff" />
    </div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.1 }} className="latin">{n}</div>
      <div style={{ fontSize: 12, color: '#A0AAD0', marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

const Home = () => {
  const { t, isRTL } = useLanguage();
  const [courses, setCourses] = useState<any[]>([]);
  const revealRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    coursesApi.getAll().then((res: any) => setCourses(res.data.slice(0, 3)));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('reveal-in'); });
    }, { threshold: 0.08 });
    revealRefs.current.forEach(r => r && observer.observe(r));
    return () => observer.disconnect();
  }, []);

  const addRef = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  // ── Feature data ──────────────────────────────────────────────
  const features = [
    { icon: Code,       color1: '#3B6EF8', color2: '#6366F1', titleKey: 'why1Title', descKey: 'why1Desc' },
    { icon: Users,      color1: '#06B6D4', color2: '#3B6EF8', titleKey: 'why2Title', descKey: 'why2Desc' },
    { icon: Star,       color1: '#F59E0B', color2: '#EF4444', titleKey: 'why3Title', descKey: 'why3Desc' },
    { icon: Award,      color1: '#10B981', color2: '#06B6D4', titleKey: 'why4Title', descKey: 'why4Desc' },
    { icon: Zap,        color1: '#8B5CF6', color2: '#6366F1', titleKey: 'why5Title', descKey: 'why5Desc' },
    { icon: TrendingUp, color1: '#EF4444', color2: '#F59E0B', titleKey: 'why6Title', descKey: 'why6Desc' },
  ];

  // ── Steps data ────────────────────────────────────────────────
  const steps = [
    { n: '01', icon: BookOpen,    title: isRTL ? 'سجّل مجاناً' : 'Sign Up Free',       desc: isRTL ? 'أنشئ حسابك في ثوانٍ بدون أي تكلفة' : 'Create your account in seconds at no cost' },
    { n: '02', icon: Play,        title: isRTL ? 'اختر كورسك'  : 'Choose a Course',    desc: isRTL ? 'تصفّح الكورسات واختر المناسب لمستواك' : 'Browse courses and pick one for your level' },
    { n: '03', icon: Award,       title: isRTL ? 'تعلّم واحصل على شهادتك' : 'Learn & Get Certified', desc: isRTL ? 'أتمّ الكورس واحصل على شهادة معتمدة' : 'Complete the course and earn your certificate' },
  ];

  return (
    <div style={{ paddingTop: 'var(--nav-h)' }}>

      {/* ═══════════════════════════════════════════════════════
          SECTION 1 — HERO
      ═══════════════════════════════════════════════════════ */}
      <section className="hero-aurora" style={{ minHeight: 'calc(100vh - var(--nav-h))', display: 'flex', alignItems: 'center', position: 'relative' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: 60, paddingBottom: 80 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

            {/* LEFT — Text */}
            <div style={{ animation: 'fadeUp .7s var(--ease) both' }}>
              <span className="label">
                {isRTL ? '✦ منصة تعليمية متخصصة' : '✦ Specialized Educational Platform'}
              </span>

              <h1 className="heading-1" style={{ marginBottom: 24 }}>
                {isRTL
                  ? <><span className="gradient-text">تعلّم بذكاء</span><br />نتائج قوية</>
                  : <><span className="gradient-text">Smart Learning.</span><br />Powerful Results.</>
                }
              </h1>

              <p className="body-lg" style={{ maxWidth: 500, marginBottom: 40 }}>
                {t('home', 'heroSubtitle')}
              </p>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <Link to="/register" className="btn btn-primary btn-lg">
                  {isRTL ? 'ابدأ مجاناً الآن' : 'Start Free Now'} <ArrowLeft size={18} />
                </Link>
                <Link to="/catalog" className="btn btn-outline btn-lg">
                  <Play size={16} /> {isRTL ? 'شوف الكورسات' : 'Browse Courses'}
                </Link>
              </div>

              {/* Trust badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 48, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex' }}>
                    {['#3B6EF8','#6366F1','#06B6D4'].map((c,i) => (
                      <div key={i} style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${c}, ${c}88)`,
                        border: '2px solid var(--bg-base)',
                        marginRight: -8, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700,
                      }}>{['م','أ','ي'][i]}</div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8FF' }}>
                      {isRTL ? '+500 طالب مُسجَّل' : '+500 Students Enrolled'}
                    </div>
                    <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                      {Array.from({length:5}).map((_,i) => <Star key={i} size={11} fill="#F59E0B" color="#F59E0B" />)}
                      <span style={{ fontSize: 11, color: '#A0AAD0', marginRight: 4 }}>4.9</span>
                    </div>
                  </div>
                </div>
                <div style={{ width: 1, height: 36, background: 'var(--border)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Shield size={20} color="#10B981" />
                  <span style={{ fontSize: 13, color: '#A0AAD0', fontWeight: 600 }}>
                    {isRTL ? 'شهادات معتمدة' : 'Certified Certificates'}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT — Floating cards */}
            <div style={{ position: 'relative', height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              className="hide-mobile">
              {/* Main card */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                background: 'rgba(13,13,30,.9)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(59,110,248,.30)',
                borderRadius: 24, padding: '28px 32px', minWidth: 280,
                boxShadow: '0 20px 60px rgba(0,0,0,.6), var(--glow-blue)',
              }}>
                <div className="label" style={{ marginBottom: 12, fontSize: 11 }}>
                  {isRTL ? 'الكورس التأسيسي' : 'Foundation Course'}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 16 }}>
                  {isRTL ? 'أولى بكالوريا — Python' : 'Year 1 Bac — Python'}
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                  {[
                    { icon: BookOpen, v: '12', l: isRTL ? 'درس' : 'Lessons' },
                    { icon: Clock,    v: '24h', l: isRTL ? 'مدة' : 'Duration' },
                    { icon: Users,    v: '200+', l: isRTL ? 'طالب' : 'Students' },
                  ].map((s,i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <s.icon size={14} color="#60A5FA" style={{ marginBottom: 4 }} />
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }} className="latin">{s.v}</div>
                      <div style={{ fontSize: 11, color: '#A0AAD0' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <div className="progress-track" style={{ marginBottom: 8 }}>
                  <div className="progress-fill" style={{ width: '72%' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#A0AAD0' }}>
                  <span>{isRTL ? 'التقدّم' : 'Progress'}</span>
                  <span className="latin">72%</span>
                </div>
              </div>

              {/* Floating stat badges */}
              <div style={{ position: 'absolute', top: 20, right: -20, animationDelay: '0s' }}>
                <StatBadge n="+8" label={isRTL ? 'سنوات خبرة' : 'Years Experience'} icon={Award} />
              </div>
              <div style={{ position: 'absolute', bottom: 30, left: -30, animationDelay: '1.5s' }}>
                <StatBadge n="98%" label={isRTL ? 'معدل النجاح' : 'Success Rate'} icon={TrendingUp} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom, transparent, var(--bg-base))', zIndex: 2 }} />
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2 — STATS BAR
      ═══════════════════════════════════════════════════════ */}
      <section style={{ padding: '32px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 0 }}>
            {[
              { n: '+8',  label: isRTL ? 'سنوات خبرة'        : 'Years of Experience', icon: Award },
              { n: '3',   label: isRTL ? 'كورسات متخصصة'      : 'Specialized Courses', icon: BookOpen },
              { n: '98%', label: isRTL ? 'معدل النجاح'        : 'Student Success Rate', icon: TrendingUp },
              { n: '24/7',label: isRTL ? 'دعم Telegram'       : 'Telegram Support',    icon: Zap },
            ].map((s, i, arr) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '24px 16px', textAlign: 'center',
                borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <s.icon size={22} color="#3B6EF8" style={{ marginBottom: 10 }} />
                <div style={{
                  fontSize: 36, fontWeight: 900, lineHeight: 1,
                  background: 'linear-gradient(135deg, #60A5FA, #818CF8)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text', marginBottom: 6,
                }} className="latin">{s.n}</div>
                <div style={{ fontSize: 13, color: '#A0AAD0', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3 — COURSES
      ═══════════════════════════════════════════════════════ */}
      <section className="section" ref={addRef as any} style={{ background: 'var(--bg-base)' }}>
        <div className="container">
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56, flexWrap: 'wrap', gap: 20 }}>
            <div>
              <span className="label">{isRTL ? '📚 الكورسات' : '📚 Courses'}</span>
              <h2 className="heading-2">{t('home', 'coursesTitle')}</h2>
              <p className="body-lg" style={{ marginTop: 12, maxWidth: 500 }}>{t('home', 'coursesSubtitle')}</p>
            </div>
            <Link to="/catalog" className="btn btn-outline btn-md">
              {t('home', 'viewAll')} <ChevronRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {courses.map(course => <CourseCard key={course.id} {...course} />)}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 4 — HOW IT WORKS
      ═══════════════════════════════════════════════════════ */}
      <section className="section" style={{ background: 'var(--bg-card)', position: 'relative', overflow: 'hidden' }} ref={addRef as any}>
        {/* Glow bg */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(59,110,248,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="label">{isRTL ? '⚡ كيف يعمل' : '⚡ How It Works'}</span>
            <h2 className="heading-2">{isRTL ? 'ثلاث خطوات للنجاح' : 'Three Steps to Success'}</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            {steps.map((step, i) => (
              <div key={i} className="reveal-init" ref={addRef as any} style={{ textAlign: 'center', padding: '40px 32px', position: 'relative', animationDelay: `${i * 0.15}s` }}>
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div style={{ position: 'absolute', top: 52, left: isRTL ? '-10%' : '90%', width: '20%', height: 1, background: 'linear-gradient(90deg, var(--border-blue), transparent)', display: 'none' }} />
                )}
                {/* Number ring */}
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  border: '2px solid rgba(59,110,248,.30)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px',
                  background: 'linear-gradient(135deg, rgba(59,110,248,.12), rgba(99,102,241,.08))',
                  position: 'relative',
                }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#3B6EF8', position: 'absolute', top: -8, background: 'var(--bg-card)', padding: '2px 6px', borderRadius: 6, border: '1px solid rgba(59,110,248,.25)' }} className="latin">{step.n}</span>
                  <step.icon size={30} color="#60A5FA" />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#E2E8FF', marginBottom: 12 }}>{step.title}</h3>
                <p style={{ color: '#A0AAD0', lineHeight: 1.7, fontSize: 15 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 5 — FEATURES
      ═══════════════════════════════════════════════════════ */}
      <section className="section" ref={addRef as any}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="label">{isRTL ? '✨ لماذا BEDU؟' : '✨ Why BEDU?'}</span>
            <h2 className="heading-2">{t('home', 'whyTitle')}</h2>
            <p className="body-lg" style={{ maxWidth: 560, margin: '16px auto 0' }}>{t('home', 'faqTitle')}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            {features.map((f, i) => (
              <div key={i} className="card reveal-init" ref={addRef as any} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', animationDelay: `${i * 0.1}s` }}>
                <GradientIcon icon={f.icon} color1={f.color1} color2={f.color2} />
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#E2E8FF', marginBottom: 8 }}>{t('home', f.titleKey)}</h3>
                  <p style={{ color: '#A0AAD0', lineHeight: 1.7, fontSize: 14 }}>{t('home', f.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 6 — CTA BANNER
      ═══════════════════════════════════════════════════════ */}
      <section className="section-sm" style={{ background: 'var(--bg-card)' }} ref={addRef as any}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(59,110,248,.18) 0%, rgba(99,102,241,.12) 50%, rgba(6,182,212,.10) 100%)',
            border: '1px solid rgba(59,110,248,.25)',
            borderRadius: 28, padding: 'clamp(40px, 6vw, 72px)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 40, position: 'relative', overflow: 'hidden',
          }}>
            {/* Decorative glow */}
            <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, background: 'radial-gradient(circle, rgba(59,110,248,.20), transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -40, left: '30%', width: 180, height: 180, background: 'radial-gradient(circle, rgba(99,102,241,.15), transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#60A5FA', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                {isRTL ? '🚀 انضم لمجتمعنا على Telegram' : '🚀 Join our Telegram Community'}
              </div>
              <h2 className="heading-3" style={{ marginBottom: 12, maxWidth: 500 }}>
                {t('home', 'telegramTitle')}
              </h2>
              <p style={{ color: '#A0AAD0', fontSize: 15, maxWidth: 480 }}>{t('home', 'telegramSub')}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start', position: 'relative' }}>
              <a href="#" className="btn btn-primary btn-lg" style={{ minWidth: 200, justifyContent: 'center' }}>
                {t('home', 'telegramBtn')} →
              </a>
              <Link to="/register" className="btn btn-outline btn-md" style={{ minWidth: 200, justifyContent: 'center' }}>
                {isRTL ? 'إنشاء حساب مجاني' : 'Create Free Account'}
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
