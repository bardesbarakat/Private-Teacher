import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Clock, Users, PlayCircle, FileText, ChevronDown, CheckCircle, ShieldCheck } from 'lucide-react';
import { coursesApi } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useLanguage } from '../i18n/LanguageContext';

const CourseDetail = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      coursesApi.getById(id).then((res: any) => {
        setCourse(res.data);
        if (res.data.chapters?.length > 0) {
          setActiveChapter(res.data.chapters[0].id);
        }
        setLoading(false);
      });
    }
  }, [id]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error(t('course', 'loginToEnroll') || 'يرجى تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }
    
    try {
      toast.loading('جاري التسجيل...', { id: 'enroll' });
      await coursesApi.enroll(id!);
      toast.success('تم التسجيل بنجاح! مرحباً بك', { id: 'enroll' });
      navigate('/dashboard');
    } catch (error) {
      toast.error('حدث خطأ أثناء التسجيل', { id: 'enroll' });
    }
  };

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>جاري التحميل...</div>;
  if (!course) return <div style={{ textAlign: 'center', marginTop: '100px' }}>الكورس غير موجود</div>;

  return (
    <div style={{ paddingTop: '80px', paddingBottom: '100px' }}>
      
      {/* Hero */}
      <div style={{ background: 'var(--bg-0)', borderBottom: '1px solid var(--line)', padding: '64px 0' }}>
        <div className="container">
          <div style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', gap: '8px', color: 'var(--mint)', fontSize: '14px', marginBottom: '24px' }}>
              <span>{t('course', 'breadHome')}</span> &gt; <span>{t('course', 'breadCatalog')}</span> &gt; <span>{course.title}</span>
            </div>
            
            <h1 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '24px' }}>{course.title}</h1>
            <p style={{ fontSize: '20px', color: 'var(--text-soft)', marginBottom: '32px', lineHeight: '1.6' }}>{course.description}</p>
            
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-2)', padding: '8px 16px', borderRadius: 'var(--r-pill)' }}>
                <Clock size={18} color="var(--mint)" /> <span>{course.lessonsCount} {t('course', 'lessons')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-2)', padding: '8px 16px', borderRadius: 'var(--r-pill)' }}>
                <Users size={18} color="var(--mint)" /> <span>{course.enrollmentsCount} {t('course', 'students')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-2)', padding: '8px 16px', borderRadius: 'var(--r-pill)' }}>
                <ShieldCheck size={18} color="var(--mint)" /> <span>المستوى: {course.level}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ marginTop: '48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '48px', alignItems: 'start' }} className="course-grid">
          
          {/* Main Column */}
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>{t('course', 'learnTitle')}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '48px', background: 'var(--bg-0)', padding: '24px', borderRadius: 'var(--r-lg)', border: '1px solid var(--line)' }}>
              {course.features.map((f: string, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                  <CheckCircle size={20} color="var(--mint)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>{t('course', 'currTitle')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
              {course.chapters.map((chapter: any) => (
                <div key={chapter.id} className="card" style={{ overflow: 'hidden' }}>
                  <button 
                    onClick={() => setActiveChapter(activeChapter === chapter.id ? null : chapter.id)}
                    style={{ width: '100%', padding: '20px', background: 'var(--bg-0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text)', borderBottom: activeChapter === chapter.id ? '1px solid var(--line)' : 'none' }}
                  >
                    <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{chapter.title}</span>
                    <ChevronDown size={20} style={{ transform: activeChapter === chapter.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                  </button>
                  
                  {activeChapter === chapter.id && (
                    <div style={{ padding: '20px', background: 'var(--bg-1)' }}>
                      {chapter.lessons.map((lesson: any, idx: number) => (
                        <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', borderBottom: idx !== chapter.lessons.length - 1 ? '1px solid var(--line)' : 'none' }}>
                          <PlayCircle size={18} color="var(--text-soft)" />
                          <span>{lesson.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>{t('course', 'instructorTitle')}</h2>
            <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
              <img src={course.instructor.image} alt={course.instructor.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>{course.instructor.name}</h3>
                <p style={{ color: 'var(--text-soft)' }}>{course.instructor.title}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div className="card" style={{ padding: '32px' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>
                {course.isFree ? <span style={{ color: 'var(--mint)' }}>{t('course', 'free')}</span> : <span>{course.price} <small style={{ fontSize: '18px', color: 'var(--text-soft)' }}>ج.م</small></span>}
              </div>
              
              <button className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '18px', marginBottom: '24px' }} onClick={handleEnroll}>
                {t('course', 'enroll')}
              </button>

              <div style={{ fontSize: '14px', color: 'var(--text-soft)', marginBottom: '16px' }}>{t('course', 'includesTitle')}</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><PlayCircle size={18} /> {course.lessonsCount} {t('course', 'lessons')}</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><FileText size={18} /> {course.downloads || 'ملفات وملحقات'}</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle size={18} /> {t('course', 'certificate')}</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .course-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default CourseDetail;
