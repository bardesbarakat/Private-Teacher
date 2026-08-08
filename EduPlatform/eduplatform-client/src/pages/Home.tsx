import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, PlayCircle, Star, Users, Code, Zap } from 'lucide-react';
import { coursesApi } from '../api/client';
import CourseCard from '../components/CourseCard';
import { useLanguage } from '../i18n/LanguageContext';

const Home = () => {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<any[]>([]);
  const revealRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    coursesApi.getAll().then((res: any) => {
      setCourses(res.data.slice(0, 3));
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-in');
        }
      });
    }, { threshold: 0.1 });

    revealRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        position: 'relative',
        paddingTop: '80px',
        overflow: 'hidden'
      }}>
        {/* Background Network SVG */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1, opacity: 0.4 }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--line)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <circle cx="20%" cy="30%" r="4" fill="var(--mint)" style={{ animation: 'pulseGlow 2s infinite' }} />
            <circle cx="80%" cy="60%" r="4" fill="var(--violet)" style={{ animation: 'pulseGlow 2s infinite 1s' }} />
            <circle cx="50%" cy="80%" r="4" fill="var(--amber)" style={{ animation: 'pulseGlow 2s infinite 0.5s' }} />
            <path d="M 20% 30% L 80% 60% L 50% 80% Z" fill="none" stroke="var(--mint-line)" strokeWidth="1" strokeDasharray="5,5" />
          </svg>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, var(--bg-1), transparent)' }}></div>
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <span style={{ display: 'inline-block', padding: '8px 16px', background: 'var(--mint-soft)', color: 'var(--mint)', borderRadius: 'var(--r-pill)', fontSize: '14px', fontWeight: 'bold', marginBottom: '24px', animation: 'slideUp 0.5s ease-out' }}>
              {t('home', 'heroEyebrow')}
            </span>
            <h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: '800', lineHeight: '1.2', marginBottom: '24px', animation: 'slideUp 0.5s ease-out 0.1s both' }}>
              {t('home', 'heroTitle')}
            </h1>
            <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--text-soft)', marginBottom: '40px', lineHeight: '1.6', animation: 'slideUp 0.5s ease-out 0.2s both' }}>
              {t('home', 'heroSubtitle')}
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', animation: 'slideUp 0.5s ease-out 0.3s both' }}>
              <Link to="/register" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '18px' }}>
                {t('home', 'ctaPrimary')} <ArrowLeft size={20} />
              </Link>
              <Link to="/catalog" className="btn btn-outline" style={{ padding: '16px 32px', fontSize: '18px' }}>
                {t('home', 'ctaSecondary')}
              </Link>
            </div>
            
            <div style={{ marginTop: '64px', display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', animation: 'fadeIn 1s ease-out 0.6s both' }}>
              {[
                { n: '+10K', l: t('home', 'statsStudents') },
                { n: '+8', l: t('home', 'statsYears') },
                { n: '3', l: t('home', 'statsCourses') },
                { n: '%98', l: t('home', 'statsSuccess') }
              ].map((stat, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text)' }} className="latin">{stat.n}</div>
                  <div style={{ color: 'var(--text-soft)', fontSize: '14px' }}>{stat.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section style={{ padding: '100px 0', background: 'var(--bg-0)' }} ref={addToRefs} className="reveal-init">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
            <div>
              <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>{t('home', 'coursesTitle')}</h2>
              <p style={{ color: 'var(--text-soft)', fontSize: '18px' }}>{t('home', 'coursesSubtitle')}</p>
            </div>
            <Link to="/catalog" style={{ color: 'var(--mint)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
              {t('home', 'viewAll')} <ArrowLeft size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {courses.map(course => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section style={{ padding: '100px 0' }} ref={addToRefs} className="reveal-init">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>{t('home', 'whyTitle')}</h2>
            <p style={{ color: 'var(--text-soft)', fontSize: '18px' }}>{t('home', 'faqTitle')}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {[
              { icon: <Code size={32} />, title: t('home', 'why1Title'), desc: t('home', 'why1Desc') },
              { icon: <Users size={32} />, title: t('home', 'why2Title'), desc: t('home', 'why2Desc') },
              { icon: <Star size={32} />, title: t('home', 'why3Title'), desc: t('home', 'why3Desc') },
              { icon: <Zap size={32} />, title: t('home', 'why4Title'), desc: t('home', 'why4Desc') },
              { icon: <PlayCircle size={32} />, title: t('home', 'why5Title'), desc: t('home', 'why5Desc') },
              { icon: <CheckCircle size={32} />, title: t('home', 'why6Title'), desc: t('home', 'why6Desc') }
            ].map((f, i) => (
              <div key={i} className="card" style={{ padding: '32px', borderTop: '4px solid var(--mint)' }}>
                <div style={{ width: '64px', height: '64px', background: 'var(--mint-soft)', color: 'var(--mint)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-soft)', lineHeight: '1.6' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Telegram CTA */}
      <section style={{ padding: '80px 0', background: 'var(--mint-soft)' }} ref={addToRefs} className="reveal-init">
        <div className="container">
          <div style={{ background: 'var(--bg-0)', borderRadius: 'var(--r-lg)', padding: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '32px', border: '1px solid var(--mint-line)' }}>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>{t('home', 'telegramTitle')}</h2>
              <p style={{ color: 'var(--text-soft)', fontSize: '18px', maxWidth: '600px' }}>{t('home', 'telegramSub')}</p>
            </div>
            <a href="#" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '18px', borderRadius: 'var(--r-pill)' }}>
              {t('home', 'telegramBtn')}
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
