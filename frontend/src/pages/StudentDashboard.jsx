import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEnrolled, getCourseCurriculum } from '../services/api';
import RedeemCodeModal from './RedeemCodeModal';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const { user } = useAuth();
  
  // Track preference: 'Arabic' | 'Languages' or null for not selected yet
  const [activeTrackTab, setActiveTrackTab] = useState(() => {
    return localStorage.getItem('bedu_curriculum_pref') || null;
  });
  
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState([]);
  const [openChapters, setOpenChapters] = useState({});
  const [redeemingLesson, setRedeemingLesson] = useState(null);

  useEffect(() => {
    if (activeTrackTab) {
      localStorage.setItem('bedu_curriculum_pref', activeTrackTab);
      // Try to open the first chapter of the newly selected track
      const currentTracks = tracks.filter(t => t.type === activeTrackTab);
      if (currentTracks.length > 0 && currentTracks[0].chapters?.length > 0) {
         setOpenChapters({ [currentTracks[0].chapters[0].id]: true });
      }
    }
  }, [activeTrackTab, tracks]);

  useEffect(() => {
    loadStudentCurriculum();
  }, []);

  const loadStudentCurriculum = async () => {
    try {
      setLoading(true);
      const enrolledRes = await getEnrolled();
      const enrolledCourses = enrolledRes.data;
      
      if (enrolledCourses.length > 0) {
        const courseId = enrolledCourses[0].courseId;
        const currRes = await getCourseCurriculum(courseId, false);
        setTracks(currRes.data);
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
  const currentTracks = activeTrackTab ? tracks.filter(t => t.type === activeTrackTab) : [];
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

  const getLessonMaterials = (lesson) => {
    const materials = [];
    if (lesson.videoUrlAr || lesson.videoUrlEn) {
      materials.push({
        id: `vid-${lesson.id}`,
        type: 'video',
        titleAr: 'فيديو الدرس الرئيسي',
        titleEn: 'Main Lesson Video',
        urlAr: lesson.videoUrlAr,
        urlEn: lesson.videoUrlEn
      });
    }
    if (lesson.pdfUrlAr || lesson.pdfUrlEn) {
      materials.push({
        id: `pdf-${lesson.id}`,
        type: 'pdf',
        titleAr: 'ملف الدرس (PDF)',
        titleEn: 'Lesson PDF',
        urlAr: lesson.pdfUrlAr,
        urlEn: lesson.pdfUrlEn
      });
    }
    if (lesson.resources && lesson.resources.length > 0) {
      materials.push(...lesson.resources);
    }
    return materials;
  };

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>جاري تحميل المادة العلمية...</div>;
  }

  if (!activeTrackTab) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center', direction: 'rtl', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--violet)' }}>اختر لغة الدراسة المفضلة لديك</h2>
        <p style={{ color: 'var(--text-soft)', marginBottom: '3rem', fontSize: '1.1rem' }}>Choose your preferred study language</p>
        
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary" 
            style={{ padding: '2rem 4rem', fontSize: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}
            onClick={() => setActiveTrackTab('Arabic')}
          >
            <span style={{ fontSize: '3rem' }}>🇸🇦</span>
            <span>المنهج العربي</span>
          </button>
          
          <button 
            className="btn btn-primary" 
            style={{ padding: '2rem 4rem', fontSize: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', background: 'var(--bg-muted)', color: 'var(--text)', border: '2px solid var(--violet-line)' }}
            onClick={() => setActiveTrackTab('Languages')}
          >
            <span style={{ fontSize: '3rem' }}>🇬🇧</span>
            <span>Languages Curriculum</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ direction: isArabic ? 'rtl' : 'ltr' }}>
      {/* PAGE HEADER */}
      <div className="page-header" style={{ paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>{isArabic ? 'المادة العلمية' : 'Course Materials'}</h1>
          <p>{isArabic ? 'استعرض الدروس، والملاحظات، والملحقات الخاصة بمنهجك الدراسي.' : 'Access lessons, study guides, and materials for your curriculum.'}</p>
        </div>
        
        <button 
          className="btn btn-ghost" 
          onClick={() => setActiveTrackTab(null)}
          style={{ border: '1px solid var(--line)', borderRadius: '8px', fontSize: '0.9rem' }}
        >
          {isArabic ? '🔄 تغيير لغة الدراسة' : '🔄 Change Study Language'}
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
                  {chapter.lessons?.map(lesson => {
                    const allMaterials = getLessonMaterials(lesson);
                    return (
                    <div key={lesson.id} style={{ marginBottom: '2rem', padding: '1rem', background: lesson.isUnlocked ? 'transparent' : 'rgba(139, 92, 246, 0.05)', borderRadius: '12px', border: lesson.isUnlocked ? 'none' : '1px solid var(--violet-line)' }}>
                      <h4 style={{ color: 'var(--text)', marginBottom: '1rem', borderBottom: '1px dashed var(--line)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {!lesson.isUnlocked && <span>🔒</span>}
                        {isArabic ? lesson.titleAr : lesson.titleEn}
                      </h4>
                      
                      {lesson.isUnlocked ? (
                        allMaterials.length > 0 ? (
                          <div className="materials-list">
                            {allMaterials.map(mat => (
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
                  )})}
                  
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
