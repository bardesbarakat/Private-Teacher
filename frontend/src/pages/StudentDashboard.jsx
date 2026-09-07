import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEnrolled, getCourseCurriculum } from '../services/api';
import RedeemCodeModal from './RedeemCodeModal';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const { user } = useAuth();
  
  // Track preference: 'Arabic' | 'Languages'
  const [activeTrackTab, setActiveTrackTab] = useState(() => {
    return localStorage.getItem('bedu_curriculum_pref') || 'Arabic';
  });
  
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState([]);
  const [openChapters, setOpenChapters] = useState({});
  const [redeemingLesson, setRedeemingLesson] = useState(null);

  useEffect(() => {
    localStorage.setItem('bedu_curriculum_pref', activeTrackTab);
  }, [activeTrackTab]);

  useEffect(() => {
    loadStudentCurriculum();
  }, []);

  const loadStudentCurriculum = async () => {
    try {
      setLoading(true);
      // 1. Get enrolled courses
      const enrolledRes = await getEnrolled();
      const enrolledCourses = enrolledRes.data;
      
      if (enrolledCourses.length > 0) {
        // Just pick the first enrolled course for now
        const courseId = enrolledCourses[0].courseId;
        
        // 2. Get curriculum for this course
        const currRes = await getCourseCurriculum(courseId, false);
        setTracks(currRes.data);
        
        // Open the first chapter by default
        const currentTracks = currRes.data.filter(t => t.type === activeTrackTab);
        if (currentTracks.length > 0 && currentTracks[0].chapters?.length > 0) {
           setOpenChapters({ [currentTracks[0].chapters[0].id]: true });
        }
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const toggleChapter = (id) => {
    setOpenChapters(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isArabic = activeTrackTab === 'Arabic';
  const currentTracks = tracks.filter(t => t.type === activeTrackTab);
  const chapters = currentTracks.length > 0 ? currentTracks[0].chapters : [];

  const renderIcon = (type) => {
    const map = {
      'pdf': '📄',
      'pptx': '📊',
      'mindmap': '🧠',
      'infographic': '🖼️',
      'code': '💻',
      'video': '🔗'
    };
    return map[type] || '📁';
  };

  const renderActions = (item) => {
    const url = isArabic ? (item.urlAr || item.urlEn) : (item.urlEn || item.urlAr);

    if (item.type === 'pdf') {
      return (
        <>
          <a href={url} target="_blank" rel="noreferrer" className="mat-btn btn-primary">{isArabic ? 'عرض' : 'Preview'}</a>
          <a href={url} target="_blank" rel="noreferrer" download className="mat-btn btn-secondary">{isArabic ? 'تحميل' : 'Download'}</a>
        </>
      );
    }
    if (item.type === 'pptx') {
      return (
        <>
          <a href={url} target="_blank" rel="noreferrer" className="mat-btn btn-primary">{isArabic ? 'عرض الشرائح' : 'View Slides'}</a>
          <a href={url} target="_blank" rel="noreferrer" download className="mat-btn btn-secondary">{isArabic ? 'تحميل PPTX' : 'Download PPTX'}</a>
        </>
      );
    }
    if (item.type === 'mindmap') {
      return (
        <>
          <a href={url} target="_blank" rel="noreferrer" className="mat-btn btn-primary">{isArabic ? 'استكشاف الخريطة' : 'Explore Mind Map'}</a>
          <a href={url} target="_blank" rel="noreferrer" download className="mat-btn btn-secondary">{isArabic ? 'تحميل' : 'Download'}</a>
        </>
      );
    }
    if (item.type === 'infographic') {
      return (
        <>
          <a href={url} target="_blank" rel="noreferrer" className="mat-btn btn-primary">{isArabic ? 'معاينة الإنفوجرافيك' : 'Preview Image'}</a>
          <a href={url} target="_blank" rel="noreferrer" className="mat-btn btn-secondary">{isArabic ? 'تكبير' : 'Zoom'}</a>
        </>
      );
    }
    if (item.type === 'code') {
      return (
        <>
          <a href={url} target="_blank" rel="noreferrer" className="mat-btn btn-primary">{isArabic ? 'استعراض الكود' : 'View Code'}</a>
          <button className="mat-btn btn-secondary" onClick={() => navigator.clipboard.writeText(url)}>{isArabic ? 'نسخ الرابط' : 'Copy Link'}</button>
        </>
      );
    }
    if (item.type === 'video') {
      return (
        <a href={url} target="_blank" rel="noreferrer" className="mat-btn btn-primary" style={{ flex: 2 }}>{isArabic ? 'مشاهدة الفيديو' : 'Watch Video'}</a>
      );
    }
    
    // Fallback
    return <a href={url} target="_blank" rel="noreferrer" className="mat-btn btn-primary">{isArabic ? 'فتح المادة' : 'Open Material'}</a>;
  };

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>جاري تحميل المادة العلمية...</div>;
  }

  return (
    <div style={{ direction: isArabic ? 'rtl' : 'ltr' }}>
      {/* PAGE HEADER */}
      <div className="page-header" style={{ paddingBottom: '1rem' }}>
        <h1>{isArabic ? 'المادة العلمية' : 'Course Materials'}</h1>
        <p>{isArabic ? 'استعرض الدروس، والملاحظات، والملحقات الخاصة بمنهجك الدراسي.' : 'Access lessons, study guides, and materials for your curriculum.'}</p>
      </div>

      {/* TRACK SWITCHER */}
      <div className="curriculum-tabs">
        <button 
          className={`curriculum-tab ${isArabic ? 'active' : ''}`}
          onClick={() => setActiveTrackTab('Arabic')}
        >
          المنهج العربي
        </button>
        <button 
          className={`curriculum-tab ${!isArabic ? 'active' : ''}`}
          onClick={() => setActiveTrackTab('Languages')}
        >
          Languages Curriculum
        </button>
      </div>

      {/* ACCORDIONS LIST */}
      <div style={{ paddingBottom: '4rem' }}>
        {chapters.length === 0 && (
           <div className="empty-state">
             <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📚</div>
             <p>{isArabic ? 'لم يتم العثور على المنهج. تأكد من انضمامك إلى الدورة.' : 'No curriculum found. Make sure you are enrolled.'}</p>
           </div>
        )}

        {chapters.map((chapter) => {
          const isOpen = openChapters[chapter.id];
          return (
            <div key={chapter.id} className="chapter-accordion">
              {/* Header */}
              <div className="chapter-header" onClick={() => toggleChapter(chapter.id)}>
                <h3>{isArabic ? chapter.titleAr : chapter.titleEn}</h3>
                <span className={`chapter-toggle ${isOpen ? 'open' : ''}`}>▼</span>
              </div>
              
              {/* Content */}
              {isOpen && (
                <div className="chapter-content">
                  {chapter.lessons?.map(lesson => (
                    <div key={lesson.id} style={{ marginBottom: '2rem', padding: '1rem', background: lesson.isUnlocked ? 'transparent' : 'rgba(139, 92, 246, 0.05)', borderRadius: '12px', border: lesson.isUnlocked ? 'none' : '1px solid var(--violet-line)' }}>
                      <h4 style={{ color: 'var(--text)', marginBottom: '1rem', borderBottom: '1px dashed var(--line)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {!lesson.isUnlocked && <span>🔒</span>}
                        {isArabic ? lesson.titleAr : lesson.titleEn}
                      </h4>
                      
                      {lesson.isUnlocked ? (
                        lesson.resources && lesson.resources.length > 0 ? (
                          <div className="materials-list">
                            {lesson.resources.map(mat => (
                              <div key={mat.id} className="mat-card">
                                <div className="mat-header">
                                  <span className="mat-icon">{renderIcon(mat.type)}</span>
                                  <div className="mat-info">
                                    <h4>{isArabic ? mat.titleAr : mat.titleEn}</h4>
                                    <p>{mat.type.toUpperCase()}</p>
                                  </div>
                                </div>
                                <div className="mat-actions">
                                  {renderActions(mat)}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ display: 'inline-block', background: 'var(--bg-muted)', padding: '0.5rem 1rem', borderRadius: 'var(--r-sm)', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                            ⏳ {isArabic ? 'قريباً / Coming Soon' : 'Coming Soon'}
                          </div>
                        )
                      ) : (
                        <div className="locked-lesson" style={{ textAlign: 'center', padding: '1rem' }}>
                          <p style={{ color: 'var(--text-soft)', marginBottom: '1rem' }}>
                            {isArabic ? 'هذا الدرس مقفل. يرجى إدخال كود التفعيل للوصول إلى المحتوى.' : 'This lesson is locked. Please enter an activation code.'}
                          </p>
                          <button className="btn btn-primary" onClick={() => setRedeemingLesson(lesson.id)}>
                            {isArabic ? 'أدخل كود التفعيل' : 'Enter Activation Code'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {(!chapter.lessons || chapter.lessons.length === 0) && (
                     <div className="empty-state">
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📭</div>
                        <p>{isArabic ? 'لا توجد دروس أو مواد في هذا الفصل.' : 'No lessons or materials in this chapter yet.'}</p>
                     </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {redeemingLesson && (
        <RedeemCodeModal 
          onClose={() => setRedeemingLesson(null)} 
          onSuccess={() => {
            setRedeemingLesson(null);
            loadStudentCurriculum(); // Re-fetch to unlock
          }} 
        />
      )}
    </div>
  );
}
