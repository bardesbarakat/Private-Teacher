import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getAllCourses, getEnrolled } from '../services/api';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const [enrolled, setEnrolled] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [all, enr] = await Promise.all([getAllCourses(), getEnrolled()]);
      setAllCourses(all.data);
      setEnrolled(enr.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-header">
        <h1>{lang === 'ar' ? 'المادة العلمية' : 'Course Materials'}</h1>
        <p>{lang === 'ar' ? 'استعرض الدروس والملاحظات والمواد التعليمية المضافة بواسطة المعلم وفقاً لمستواك الحالي.' : 'Access lessons, study guides, and materials added by your instructor according to your current level.'}</p>
      </div>

      {/* MATERIALS GRID */}
      {loading ? (
        <div className="loading-state">Loading materials...</div>
      ) : (
        <div className="materials-grid">
          
          {/* ENROLLED / UNLOCKED CARDS */}
          {enrolled.map((enr, idx) => (
            <div key={`enr-${idx}`} className="material-card unlocked-card" onClick={() => navigate(`/learn/${enr.courseId}`)}>
              <div className="card-banner">
                 <div className="level-tag">
                   {lang === 'ar' ? `المستوى ${idx + 1} - الفصل 1` : `Level ${idx + 1} - Chapter 1`}
                 </div>
                 <div className="lesson-badge">★ {lang === 'ar' ? 'كورس' : 'Course'}</div>
              </div>
              <div className="card-body">
                 <span className="chapter-tag">{lang === 'ar' ? `الشهر 1 - الأسبوع ${idx + 1}` : `Month 1 - Week ${idx + 1}`}</span>
                 <h3>{lang === 'ar' ? (enr.course?.titleAr || enr.course?.title) : (enr.course?.titleEn || enr.course?.title || 'Course Title')}</h3>
                 <p className="card-desc">{lang === 'ar' ? (enr.course?.descriptionAr || enr.course?.description) : (enr.course?.descriptionEn || enr.course?.description || 'Learn the foundational concepts required to advance to the next level in your learning journey.')}</p>
              </div>
              <div className="card-footer">
                 <div className="progress-info">
                   <span className="prog-text">{lang === 'ar' ? 'نسبة الإنجاز 100%' : 'Progress 100%'}</span>
                   <div className="prog-bar-bg"><div className="prog-bar-fill" style={{width: '100%'}}></div></div>
                 </div>
              </div>
            </div>
          ))}

          {/* ALL OTHER COURSES / LOCKED CARDS (Mocked for UI) */}
          {allCourses.filter(c => !enrolled.find(e => e.courseId === c.id)).map((course, idx) => (
            <div key={`lock-${idx}`} className="material-card locked-card">
              <div className="locked-overlay">
                 <div className="lock-icon">🔒</div>
                 <p className="lock-msg">
                   {lang === 'ar' 
                     ? 'ستفتح هذه المادة العلمية تلقائيًا عند وصولك لهذا المستوى أو إكمال المتطلبات المحددة من قبل المعلم.' 
                     : 'This material will unlock automatically once you reach this level or complete the prerequisites set by your instructor.'}
                 </p>
              </div>
              
              <div className="card-banner blur-effect">
                 <div className="level-tag">
                   {lang === 'ar' ? `المستوى ${enrolled.length + idx + 1} - الفصل 2` : `Level ${enrolled.length + idx + 1} - Chapter 2`}
                 </div>
              </div>
              <div className="card-body blur-effect">
                 <span className="chapter-tag">{lang === 'ar' ? 'الشهر 2 - الأسبوع 1' : 'Month 2 - Week 1'}</span>
                 <h3>{lang === 'ar' ? (course.titleAr || course.title) : (course.titleEn || course.title)}</h3>
                 <p className="card-desc">{lang === 'ar' ? (course.descriptionAr || course.description) : (course.descriptionEn || course.description || 'Advanced topics reserved for next level.')}</p>
              </div>
              <div className="card-footer blur-effect">
                 <div className="progress-info disabled-prog">
                   <span className="prog-text">{lang === 'ar' ? 'نسبة الإنجاز 0%' : 'Progress 0%'}</span>
                   <div className="prog-bar-bg"><div className="prog-bar-fill" style={{width: '0%'}}></div></div>
                 </div>
                 <div className="meta-info">
                   {lang === 'ar' ? '98 دقيقة | 10 مواضيع' : '98 min | 10 Topics'}
                 </div>
              </div>
            </div>
          ))}
          
        </div>
      )}
    </>
  );
}
