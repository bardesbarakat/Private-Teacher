import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './StudentDashboard.css';

export default function StudentHome() {
  const { user } = useAuth();
  const { lang } = useLanguage();

  return (
    <>
      <div className="page-header">
        <h1>{lang === 'ar' ? `مرحباً بك، ${user?.name || 'طالب'}` : `Welcome back, ${user?.name || 'Student'}`}</h1>
        <p>{lang === 'ar' ? 'إليك نظرة عامة على تقدمك وجلساتك القادمة.' : 'Here is an overview of your progress and upcoming sessions.'}</p>
      </div>

      <div className="materials-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="profile-card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: 'var(--mint)', margin: '0' }}>24</h3>
          <p style={{ color: 'var(--text-soft)', margin: '0.5rem 0 0 0' }}>{lang === 'ar' ? 'مواضيع مكتملة' : 'Topics Done'}</p>
        </div>
        <div className="profile-card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: 'var(--mint-2)', margin: '0' }}>12</h3>
          <p style={{ color: 'var(--text-soft)', margin: '0.5rem 0 0 0' }}>{lang === 'ar' ? 'دروس مكتملة' : 'Lessons Done'}</p>
        </div>
        <div className="profile-card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: 'var(--amber)', margin: '0' }}>5</h3>
          <p style={{ color: 'var(--text-soft)', margin: '0.5rem 0 0 0' }}>{lang === 'ar' ? 'جلسات قادمة' : 'Upcoming Sessions'}</p>
        </div>
        <div className="profile-card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: 'var(--violet)', margin: '0' }}>48</h3>
          <p style={{ color: 'var(--text-soft)', margin: '0.5rem 0 0 0' }}>{lang === 'ar' ? 'إجمالي الجلسات' : 'Total Sessions'}</p>
        </div>
      </div>

      <div className="profile-container" style={{ paddingTop: '0', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Progress & Overview */}
        <div className="profile-card">
          <h3 className="card-title">{lang === 'ar' ? 'نظرة عامة على التقدم' : 'Progress Overview'}</h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-1)', borderRadius: 'var(--r-sm)', border: '1px dashed var(--line)' }}>
            <span style={{ color: 'var(--text-soft)' }}>{lang === 'ar' ? '[مخطط بياني للتقدم]' : '[Progress Chart Placeholder]'}</span>
          </div>
          <h3 className="card-title" style={{ marginTop: '2rem' }}>{lang === 'ar' ? 'المستوى الحالي' : 'Level Timeline'}</h3>
          <div className="progress-info">
             <span className="prog-text" style={{ color: 'var(--mint)' }}>{lang === 'ar' ? 'المستوى 2 - تم إنجاز 40%' : 'Level 2 - 40% Completed'}</span>
             <div className="prog-bar-bg" style={{ height: '12px', borderRadius: '6px' }}><div className="prog-bar-fill" style={{width: '40%', background: 'var(--mint)'}}></div></div>
          </div>
        </div>

        {/* Live Session / Next Up */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="profile-card" style={{ background: 'linear-gradient(135deg, var(--mint-3) 0%, var(--mint-2) 100%)', color: 'white', border: 'none' }}>
            <div style={{ display: 'inline-block', background: 'var(--danger-solid)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: 'var(--r-pill)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              {lang === 'ar' ? 'التالي' : 'NEXT UP'}
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>{lang === 'ar' ? 'جلسة البرمجة المباشرة' : 'Live Programming Session'}</h3>
            <p style={{ margin: '0 0 1.5rem 0', opacity: 0.9 }}>{lang === 'ar' ? 'تبدأ خلال:' : 'Starts in:'}</p>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>00:45:12</div>
            <button style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--r-sm)', border: 'none', background: 'white', color: 'var(--mint-3)', fontWeight: 'bold', cursor: 'pointer' }}>
              {lang === 'ar' ? 'انضمام للجلسة' : 'Join Session'}
            </button>
          </div>

          <div className="profile-card">
            <h3 className="card-title" style={{ fontSize: '1.1rem' }}>{lang === 'ar' ? 'الجلسات القادمة' : 'Upcoming Sessions'}</h3>
            <div className="groups-list">
              <div className="group-card" style={{ borderLeft: '4px solid var(--mint)' }}>
                <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text)' }}>{lang === 'ar' ? 'مراجعة خوارزميات' : 'Algorithms Review'}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-soft)' }}>{lang === 'ar' ? 'غداً، 18:00' : 'Tomorrow, 18:00'}</p>
              </div>
              <div className="group-card" style={{ borderLeft: '4px solid var(--amber)' }}>
                <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text)' }}>{lang === 'ar' ? 'جلسة توجيه' : 'Mentoring Session'}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-soft)' }}>{lang === 'ar' ? 'الخميس، 16:30' : 'Thursday, 16:30'}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
