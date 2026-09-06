import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getStudentStats } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import './StudentDashboard.css';

export default function StudentHome() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  
  const [stats, setStats] = useState({
    totalSessions: 0,
    upcomingSessions: 0,
    topicsDone: 0,
    lessonsDone: 0,
    nextSession: null,
    chartData: []
  });
  
  const [timeLeft, setTimeLeft] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await getStudentStats();
      setStats(res.data);
    } catch (e) {
      console.error('Failed to load stats', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    let timer;
    if (stats.nextSession) {
      const target = new Date(stats.nextSession.scheduledAt).getTime();
      
      const updateTimer = () => {
        const now = new Date().getTime();
        const diff = target - now;
        
        if (diff <= 0) {
          setTimeLeft(lang === 'ar' ? 'جارية الآن!' : 'Happening Now!');
          clearInterval(timer);
        } else {
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      };
      
      updateTimer();
      timer = setInterval(updateTimer, 1000);
    }
    
    return () => clearInterval(timer);
  }, [stats.nextSession, lang]);

  return (
    <>
      <div className="page-header">
        <h1>{lang === 'ar' ? `مرحباً بك، ${user?.name || 'طالب'}` : `Welcome back, ${user?.name || 'Student'}`}</h1>
        <p>{lang === 'ar' ? 'إليك نظرة عامة على تقدمك وجلساتك القادمة.' : 'Here is an overview of your progress and upcoming sessions.'}</p>
      </div>

      <div className="materials-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="profile-card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: 'var(--mint)', margin: '0' }}>{stats.topicsDone}</h3>
          <p style={{ color: 'var(--text-soft)', margin: '0.5rem 0 0 0' }}>{lang === 'ar' ? 'مواضيع مكتملة' : 'Topics Done'}</p>
        </div>
        <div className="profile-card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: 'var(--mint-2)', margin: '0' }}>{stats.lessonsDone}</h3>
          <p style={{ color: 'var(--text-soft)', margin: '0.5rem 0 0 0' }}>{lang === 'ar' ? 'دروس مكتملة' : 'Lessons Done'}</p>
        </div>
        <div className="profile-card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: 'var(--amber)', margin: '0' }}>{stats.upcomingSessions}</h3>
          <p style={{ color: 'var(--text-soft)', margin: '0.5rem 0 0 0' }}>{lang === 'ar' ? 'جلسات قادمة' : 'Upcoming Sessions'}</p>
        </div>
        <div className="profile-card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: 'var(--violet)', margin: '0' }}>{stats.totalSessions}</h3>
          <p style={{ color: 'var(--text-soft)', margin: '0.5rem 0 0 0' }}>{lang === 'ar' ? 'إجمالي الجلسات' : 'Total Sessions'}</p>
        </div>
      </div>

      <div className="profile-container" style={{ paddingTop: '0', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Progress & Overview */}
        <div className="profile-card">
          <h3 className="card-title">{lang === 'ar' ? 'معدل الحضور والتقدم (شهرياً)' : 'Progress & Attendance'}</h3>
          <div style={{ height: '250px', background: 'var(--bg-0)', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', padding: '16px' }}>
             {stats.chartData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={stats.chartData}>
                   <defs>
                     <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="var(--mint)" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="var(--mint)" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="var(--violet)" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="var(--violet)" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                   <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                   <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--line)', borderRadius: '8px', color: 'var(--text)' }} itemStyle={{ color: 'var(--text)' }} />
                   <Area type="monotone" dataKey="lessons" name={lang === 'ar' ? 'الدروس' : 'Lessons'} stroke="var(--mint)" fillOpacity={1} fill="url(#colorLessons)" strokeWidth={3} />
                   <Area type="monotone" dataKey="sessions" name={lang === 'ar' ? 'الجلسات' : 'Sessions'} stroke="var(--violet)" fillOpacity={1} fill="url(#colorSessions)" strokeWidth={3} />
                 </AreaChart>
               </ResponsiveContainer>
             ) : (
               <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
                 {loading ? 'جاري التحميل...' : 'لا توجد بيانات كافية للرسم البياني.'}
               </div>
             )}
          </div>
        </div>

        {/* Live Session / Next Up */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="profile-card" style={{ background: 'linear-gradient(135deg, var(--mint-3) 0%, var(--mint-2) 100%)', color: 'white', border: 'none' }}>
            <div style={{ display: 'inline-block', background: 'var(--danger-solid)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: 'var(--r-pill)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              {lang === 'ar' ? 'التالي' : 'NEXT UP'}
            </div>
            
            {stats.nextSession ? (
              <>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>{stats.nextSession.title}</h3>
                <p style={{ margin: '0 0 1.5rem 0', opacity: 0.9 }}>{lang === 'ar' ? 'تبدأ خلال:' : 'Starts in:'}</p>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>{timeLeft}</div>
                
                {timeLeft === (lang === 'ar' ? 'جارية الآن!' : 'Happening Now!') ? (
                  <a href={stats.nextSession.joinUrl || '#'} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', width: '100%', padding: '0.75rem', borderRadius: 'var(--r-sm)', background: 'white', color: 'var(--mint-3)', fontWeight: 'bold' }}>
                    {lang === 'ar' ? 'انضمام للجلسة المباشرة' : 'Join Live Session'}
                  </a>
                ) : (
                  <button disabled style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--r-sm)', border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold', cursor: 'not-allowed' }}>
                    {lang === 'ar' ? 'الرابط سيُفتح قريباً' : 'Link will unlock soon'}
                  </button>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>{lang === 'ar' ? 'عمل رائع!' : 'Great Job!'}</h3>
                <p style={{ margin: 0, opacity: 0.9 }}>
                  {lang === 'ar' 
                    ? 'لا توجد جلسات مجدولة حالياً. لقد حضرت جميع الجلسات المطلوبة.' 
                    : 'There are no upcoming sessions right now. You are all caught up.'}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
