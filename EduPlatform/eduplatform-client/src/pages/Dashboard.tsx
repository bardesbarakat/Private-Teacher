import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, Clock, Calendar, PlayCircle, Send, CheckCircle, ArrowLeft } from 'lucide-react';
import { studentApi } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useLanguage } from '../i18n/LanguageContext';

const Dashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.dashboard().then((res: any) => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>جاري التحميل...</div>;

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--bg-1)' }}>
      <div className="container" style={{ padding: '32px 16px' }}>
        
        {/* Welcome Banner */}
        <div className="card" style={{ padding: '32px', background: 'linear-gradient(135deg, var(--bg-0) 0%, var(--mint-soft) 100%)', border: '1px solid var(--mint-line)', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>{t('dashboard', 'welcome')} {user?.firstName} 👋</h1>
            <p style={{ color: 'var(--text-soft)', fontSize: '16px' }}>{t('dashboard', 'subtitle')}</p>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-soft)' }}>تاريخ اليوم</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--mint-soft)', color: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={24} /></div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }} className="latin">{data.stats.enrolledCourses}</div>
              <div style={{ color: 'var(--text-soft)', fontSize: '14px' }}>{t('dashboard', 'statCourses')}</div>
            </div>
          </div>
          <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(167, 139, 250, 0.1)', color: 'var(--violet)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Award size={24} /></div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }} className="latin">{data.stats.lastExamScore}%</div>
              <div style={{ color: 'var(--text-soft)', fontSize: '14px' }}>{t('dashboard', 'statScore')}</div>
            </div>
          </div>
          <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(251, 191, 36, 0.1)', color: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={24} /></div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }} className="latin">{data.stats.studyHours}h</div>
              <div style={{ color: 'var(--text-soft)', fontSize: '14px' }}>{t('dashboard', 'statHours')}</div>
            </div>
          </div>
          <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={24} /></div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }} className="latin">{data.stats.upcomingTasks}</div>
              <div style={{ color: 'var(--text-soft)', fontSize: '14px' }}>{t('dashboard', 'statExams')}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }} className="dashboard-grid">
          
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* My Courses */}
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} color="var(--mint)" /> {t('dashboard', 'myCourses')}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {data.enrolledCourses.map((course: any) => (
                  <div key={course.id} style={{ padding: '16px', background: 'var(--bg-1)', borderRadius: 'var(--r-md)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>{course.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1, height: '6px', background: 'var(--bg-2)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${course.progress}%`, height: '100%', background: 'var(--mint)', borderRadius: '3px' }}></div>
                        </div>
                        <span style={{ fontSize: '14px', color: 'var(--text-soft)', minWidth: '40px' }} className="latin">{course.progress}%</span>
                      </div>
                    </div>
                    <Link to={`/lessons/${course.nextLessonId}`} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '14px' }}>
                      {t('dashboard', 'continueLearning')} <PlayCircle size={16} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Exams */}
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="var(--amber)" /> {t('dashboard', 'upcomingExams')}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {data.upcomingExams.map((exam: any) => (
                  <div key={exam.id} style={{ padding: '16px', background: 'var(--bg-1)', borderRadius: 'var(--r-md)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>{exam.title}</h3>
                      <div style={{ color: 'var(--text-soft)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} /> {exam.date}
                      </div>
                    </div>
                    <Link to={`/exams/${exam.id}`} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px', background: 'var(--amber)', color: '#000' }}>
                      {t('dashboard', 'startExam')}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Telegram Mockup */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
              <div style={{ padding: '16px', background: '#0088cc', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Send size={20} />
                <span style={{ fontWeight: 'bold' }}>{t('dashboard', 'telegram')}</span>
              </div>
              <div style={{ flex: 1, padding: '16px', background: 'var(--bg-2)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'var(--bg-0)', padding: '12px', borderRadius: '12px 12px 0 12px', border: '1px solid var(--line)', width: '85%' }}>
                  <p style={{ fontSize: '14px', lineHeight: '1.5' }}>تذكير: البث المباشر لمراجعة بايثون يبدأ الليلة الساعة 9 مساءً 🚀</p>
                  <span style={{ fontSize: '11px', color: 'var(--text-soft)', display: 'block', textAlign: 'left', marginTop: '4px' }}>10:30 AM</span>
                </div>
                <div style={{ background: 'var(--bg-0)', padding: '12px', borderRadius: '12px 12px 0 12px', border: '1px solid var(--line)', width: '85%' }}>
                  <p style={{ fontSize: '14px', lineHeight: '1.5' }}>تم رفع ملخص الفصل الثاني على المنصة، يمكنكم تحميله الآن.</p>
                  <span style={{ fontSize: '11px', color: 'var(--text-soft)', display: 'block', textAlign: 'left', marginTop: '4px' }}>Yesterday</span>
                </div>
              </div>
              <div style={{ padding: '12px', borderTop: '1px solid var(--line)', textAlign: 'center' }}>
                <a href="#" style={{ color: '#0088cc', fontSize: '14px', fontWeight: 'bold' }}>{t('dashboard', 'openTelegram')}</a>
              </div>
            </div>

            {/* Activity */}
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px' }}>{t('dashboard', 'recentActivity')}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
                <div style={{ position: 'absolute', right: '11px', top: '10px', bottom: '10px', width: '2px', background: 'var(--line)', zIndex: 0 }}></div>
                
                <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-0)', border: '2px solid var(--mint)', color: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={14} /></div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>أكملت درس "المتغيرات"</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-soft)' }}>منذ ساعتين</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-0)', border: '2px solid var(--violet)', color: 'var(--violet)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Award size={14} /></div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>حصلت على شارة "مبتدئ"</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-soft)' }}>أمس</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
      <style>{`
        @media (max-width: 900px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
