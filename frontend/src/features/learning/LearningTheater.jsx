import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCourseCurriculum, getExamsByCourse, getCourseById } from '../../services/api';
import QuizPlayer from './QuizPlayer';
import Navbar from '../../components/Navbar';
import './LearningTheater.css';
import { useLanguage } from '../../context/LanguageContext';

export default function LearningTheater() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const [course, setCourse] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // New states for flattened navigation
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'reading' | 'quiz'
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(`onboarding_course_${courseId}`);
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
    loadData();
  }, [courseId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [currRes, examsRes, courseRes] = await Promise.all([
        getCourseCurriculum(courseId, false),
        getExamsByCourse(courseId),
        getCourseById(courseId)
      ]);
      setCourse(courseRes.data);
      setTracks(currRes.data);
      setExams(examsRes.data);
    } catch (e) {
      toast.error(lang === 'ar' ? 'فشل تحميل محتوى الكورس' : 'Failed to load course content');
      navigate('/course-materials');
    }
    setLoading(false);
  };

  const closeOnboarding = () => {
    localStorage.setItem(`onboarding_course_${courseId}`, 'true');
    setShowOnboarding(false);
  };

  // Flatten the curriculum so we can navigate linearly
  const flattenedCurriculum = useMemo(() => {
    const items = [];
    tracks.forEach(track => {
      track.chapters?.forEach(chapter => {
        chapter.lessons?.forEach(lesson => {
          items.push({ 
            type: 'lesson', 
            data: lesson, 
            titleAr: lesson.titleAr, 
            titleEn: lesson.titleEn,
            trackNameAr: track.type,
            trackNameEn: track.type,
            chapterNameAr: chapter.titleAr,
            chapterNameEn: chapter.titleEn,
            duration: lesson.durationMinutes || 38 // mock duration if missing
          });
          
          // Exams belonging to this lesson
          const lessonExams = exams.filter(e => e.lessonId === lesson.id);
          lessonExams.forEach(ex => {
            items.push({ 
              type: 'exam', 
              data: ex, 
              titleAr: ex.title, 
              titleEn: ex.title,
              trackNameAr: track.type,
              trackNameEn: track.type,
              chapterNameAr: chapter.titleAr,
              chapterNameEn: chapter.titleEn
            });
          });
        });
      });
    });

    // Course level exams at the end
    const courseExams = exams.filter(e => e.courseId === course?.id);
    courseExams.forEach(ex => {
      items.push({ type: 'exam', data: ex, titleAr: ex.title, titleEn: ex.title });
    });

    return items;
  }, [tracks, exams, course]);

  const activeItem = flattenedCurriculum[currentIndex];

  const handleNext = () => {
    if (currentIndex < flattenedCurriculum.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setActiveTab('video'); // reset tab
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setActiveTab('video');
    }
  };

  const getProgress = () => {
    if (flattenedCurriculum.length === 0) return 0;
    return Math.round(((currentIndex) / flattenedCurriculum.length) * 100);
  };

  if (loading) return <div className="theater-loading" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-0)', color: 'var(--text)' }}>{lang === 'ar' ? 'جاري تجهيز مسرح التعلم...' : 'Preparing Learning Theater...'}</div>;

  return (
    <div className="learning-theater" dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: 'var(--bg-0)', color: 'var(--text)', fontFamily: 'var(--font-body)' }}>
      
      {/* ONBOARDING MODAL */}
      {showOnboarding && (
        <div className="onboarding-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="onboarding-modal" style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: '2.5rem', maxWidth: '600px', width: '100%' }}>
            <div className="onboarding-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--text)', marginBottom: '0.5rem' }}>✨ {lang === 'ar' ? 'مرحباً! كيف تنهي هذا الكورس' : 'Welcome! Here\'s how to finish this course'}</h2>
              <p style={{ color: 'var(--text-soft)' }}>{lang === 'ar' ? 'خطوات سريعة لمعرفة ما يجب فعله' : 'Quick steps so you know exactly what to do'}</p>
            </div>
            <div className="onboarding-steps" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="step-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)' }}>
                <div className="step-icon" style={{ fontSize: '2rem' }}>▶️</div>
                <div className="step-text">
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text)' }}>{lang === 'ar' ? '1. شاهد الفيديو بالكامل' : '1. Watch the full video'}</h3>
                  <p style={{ margin: 0, color: 'var(--text-soft)', fontSize: '0.9rem' }}>{lang === 'ar' ? 'افتح كل درس وشاهد الفيديو للنهاية. يتم حفظ تقدمك تلقائياً.' : 'Open each lesson and watch the video all the way to the end. Your progress saves automatically.'}</p>
                </div>
              </div>
              <div className="step-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)' }}>
                <div className="step-icon" style={{ fontSize: '2rem' }}>📖</div>
                <div className="step-text">
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text)' }}>{lang === 'ar' ? '2. اقرأ المادة العلمية' : '2. Read the Reading Material'}</h3>
                  <p style={{ margin: 0, color: 'var(--text-soft)', fontSize: '0.9rem' }}>{lang === 'ar' ? 'بعد الفيديو، اقرأ التفاصيل بعناية ولا تتخطى أي جزء.' : 'After the video, open the Reading Material tab and read every part carefully — don\'t skip any section.'}</p>
                </div>
              </div>
              <div className="step-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)' }}>
                <div className="step-icon" style={{ fontSize: '2rem' }}>✅</div>
                <div className="step-text">
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text)' }}>{lang === 'ar' ? '3. اضغط إتمام القراءة' : '3. Press "Complete Reading" at the bottom'}</h3>
                  <p style={{ margin: 0, color: 'var(--text-soft)', fontSize: '0.9rem' }}>{lang === 'ar' ? 'عند الوصول للنهاية، اضغط زر الإتمام الأخضر لتسجيل قراءتك.' : 'When you reach the end of the reading material, scroll down and click the green "Complete Reading" button.'}</p>
                </div>
              </div>
            </div>
            <button style={{ width: '100%', padding: '1rem', background: 'var(--mint)', color: '#fff', border: 'none', borderRadius: 'var(--r-sm)', marginTop: '2rem', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }} onClick={closeOnboarding}>
              {lang === 'ar' ? 'حسناً، فهمت' : 'Okay, I understand'}
            </button>
          </div>
        </div>
      )}

      {/* GLOBAL NAVBAR */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
         <Navbar />
      </div>

      <div className="theater-container" style={{ paddingTop: '74px', maxWidth: '1400px', margin: '0 auto', padding: '74px 2rem 2rem 2rem' }}>
        
        {/* BREADCRUMB */}
        <div className="breadcrumb-trail" style={{ padding: '1.5rem 0', display: 'flex', gap: '0.5rem', color: 'var(--text-soft)', fontSize: '0.9rem', alignItems: 'center' }}>
          <span style={{ cursor: 'pointer', color: 'var(--mint)' }} onClick={() => navigate('/dashboard')}>
            {lang === 'ar' ? 'الرئيسية' : 'Home'}
          </span>
          <span className="separator">{lang === 'ar' ? '<' : '>'}</span>
          <span style={{ cursor: 'pointer', color: 'var(--mint)' }} onClick={() => navigate('/course-materials')}>
            {lang === 'ar' ? 'المادة العلمية' : 'Course Materials'}
          </span>
          {activeItem && (
            <>
              <span className="separator">{lang === 'ar' ? '<' : '>'}</span>
              <span>{lang === 'ar' ? activeItem.trackNameAr : activeItem.trackNameEn}</span>
              <span className="separator">{lang === 'ar' ? '<' : '>'}</span>
              <span className="current" style={{ color: 'var(--text)', fontWeight: 'bold' }}>
                {lang === 'ar' ? activeItem.titleAr : activeItem.titleEn}
              </span>
            </>
          )}
        </div>

        {/* MAIN LAYOUT: Grid 2/3 (Video) + 1/3 (Playlist) */}
        <div className="theater-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
           
           {/* LEFT COLUMN: PLAYER */}
           <div className="theater-player-col">
              {flattenedCurriculum.length === 0 ? (
                <div className="empty-state" style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)' }}>
                  {lang === 'ar' ? 'لا يوجد محتوى متاح حالياً.' : 'No content available right now.'}
                </div>
              ) : (
                <>
                  {/* CONTROLS BAR */}
                  <div className="controls-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '1rem 1.5rem', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', marginBottom: '1.5rem' }}>
                    <div className="progress-section" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                        <span className="progress-label" style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{lang === 'ar' ? 'التقدم' : 'Progress'}</span>
                        <div className="progress-bar-bg" style={{ flex: 1, height: '8px', background: 'var(--bg-field)', borderRadius: '4px', maxWidth: '200px' }}>
                          <div className="progress-bar-fill" style={{width: `${getProgress()}%`, height: '100%', background: 'var(--mint)', borderRadius: '4px', transition: 'width 0.3s ease'}}></div>
                        </div>
                        <span className="progress-text" style={{ fontSize: '0.9rem', color: 'var(--mint)', fontWeight: 'bold' }}>{getProgress()}%</span>
                    </div>
                    
                    {activeItem?.type === 'lesson' && (
                      <div className="nav-tabs-centered" style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className={`tab-btn ${activeTab === 'video' ? 'active' : ''}`} onClick={() => setActiveTab('video')} style={{ padding: '0.5rem 1rem', background: activeTab === 'video' ? 'var(--mint-soft)' : 'transparent', color: activeTab === 'video' ? 'var(--mint)' : 'var(--text-soft)', border: 'none', borderRadius: 'var(--r-pill)', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
                          ▶ {lang === 'ar' ? 'الفيديو' : 'Video'}
                        </button>
                        <button className={`tab-btn ${activeTab === 'reading' ? 'active' : ''}`} onClick={() => setActiveTab('reading')} style={{ padding: '0.5rem 1rem', background: activeTab === 'reading' ? 'var(--mint-soft)' : 'transparent', color: activeTab === 'reading' ? 'var(--mint)' : 'var(--text-soft)', border: 'none', borderRadius: 'var(--r-pill)', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
                          📖 {lang === 'ar' ? 'المادة العلمية' : 'Reading Material'}
                        </button>
                        <button className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => setActiveTab('quiz')} style={{ padding: '0.5rem 1rem', background: activeTab === 'quiz' ? 'var(--mint-soft)' : 'transparent', color: activeTab === 'quiz' ? 'var(--mint)' : 'var(--text-soft)', border: 'none', borderRadius: 'var(--r-pill)', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
                          ✅ {lang === 'ar' ? 'اختبار المعرفة' : 'Knowledge Check'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ACTIVE CONTENT VIEWER */}
                  {activeItem.type === 'exam' && (
                    <div className="content-card exam-container-modern" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)' }}>
                        <QuizPlayer examId={activeItem.data.id} />
                    </div>
                  )}

                  {activeItem.type === 'lesson' && activeTab === 'video' && (
                    <div className="video-card" style={{ background: 'var(--bg-card)', borderRadius: 'var(--r-sm)', overflow: 'hidden', border: '1px solid var(--line)' }}>
                        {((lang === 'ar' ? activeItem.data.videoUrlAr : activeItem.data.videoUrlEn) || activeItem.data.videoUrlAr) ? (
                          <div className="video-wrapper" style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
                            {(() => {
                              const vUrl = (lang === 'ar' ? activeItem.data.videoUrlAr : activeItem.data.videoUrlEn) || activeItem.data.videoUrlAr;
                              if (vUrl.includes('youtube.com') || vUrl.includes('youtu.be')) {
                                return (
                                  <iframe 
                                    src={vUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} 
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                  ></iframe>
                                );
                              } else {
                                return (
                                  <video 
                                    src={vUrl} 
                                    controls 
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                  ></video>
                                );
                              }
                            })()}
                          </div>
                        ) : (
                          <div className="no-video" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-soft)' }}>
                            {lang === 'ar' ? 'لا يوجد فيديو متاح لهذا الدرس.' : 'No video available for this lesson.'}
                          </div>
                        )}
                    </div>
                  )}

                  {activeItem.type === 'lesson' && activeTab === 'reading' && (
                    <div className="reading-card" style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', minHeight: '400px' }}>
                      <h2 style={{ marginTop: 0, color: 'var(--text)', marginBottom: '1.5rem' }}>{lang === 'ar' ? 'المحتوى المقروء' : 'Reading Material'}</h2>
                      <div className="reading-content" style={{ color: 'var(--text-soft)', lineHeight: 1.8, fontSize: '1.05rem' }} dangerouslySetInnerHTML={{ __html: (lang === 'ar' ? activeItem.data.contentAr : activeItem.data.contentEn) || `<p>${lang === 'ar' ? 'لا يوجد محتوى نصي.' : 'No reading material available.'}</p>` }}></div>
                      
                      <div style={{ textAlign: 'center', marginTop: '3rem', borderTop: '1px solid var(--line)', paddingTop: '2rem' }}>
                         <button onClick={() => {
                            toast.success(lang === 'ar' ? 'عمل رائع! لقد أتممت القراءة.' : 'Great job finishing the reading!');
                            setActiveTab('quiz');
                         }} style={{ padding: '0.75rem 2.5rem', background: 'var(--mint)', color: '#fff', border: 'none', borderRadius: 'var(--r-pill)', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 6px rgba(52,211,153,0.3)' }}>
                           ✓ {lang === 'ar' ? 'إتمام القراءة' : 'Complete Reading'}
                         </button>
                      </div>
                    </div>
                  )}

                  {activeItem.type === 'lesson' && activeTab === 'quiz' && (
                    <div className="quiz-card" style={{ background: 'var(--bg-card)', padding: '4rem 2rem', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', textAlign: 'center' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                      <h2 style={{ margin: '0 0 1rem 0', color: 'var(--text)' }}>{lang === 'ar' ? 'اختبار المعرفة' : 'Knowledge Check'}</h2>
                      <p style={{ color: 'var(--text-soft)', marginBottom: '2rem' }}>
                        {lang === 'ar' ? 'لقد أتممت مشاهدة الفيديو وقراءة المحتوى.' : 'You have completed the video and reading material.'}
                      </p>
                      <button onClick={handleNext} disabled={currentIndex === flattenedCurriculum.length - 1} style={{ padding: '0.75rem 2rem', background: 'var(--mint)', border: 'none', color: '#fff', borderRadius: 'var(--r-pill)', cursor: currentIndex === flattenedCurriculum.length - 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                        {lang === 'ar' ? 'الانتقال للدرس التالي' : 'Continue to Next Lesson'}
                      </button>
                    </div>
                  )}

                  {/* METADATA BOTTOM CARD */}
                  {activeItem.type === 'lesson' && (
                    <div className="lesson-details-card" style={{ marginTop: '1.5rem', background: 'var(--bg-card)', padding: '1.5rem 2rem', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--text)', fontSize: '1.3rem' }}>{lang === 'ar' ? activeItem.titleAr : activeItem.titleEn}</h2>
                        <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-soft)', fontSize: '0.9rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>⏱ {activeItem.duration} {lang === 'ar' ? 'دقيقة' : 'min'}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>👨‍🏫 {lang === 'ar' ? 'المعلم' : 'Instructor'}: أ. بركات</span>
                        </div>
                      </div>
                      <div>
                         <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--mint-soft)', color: 'var(--mint)', padding: '0.5rem 1.25rem', borderRadius: 'var(--r-pill)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                           ✓ {lang === 'ar' ? 'مكتمل' : 'Completed'}
                         </span>
                      </div>
                    </div>
                  )}

                  <div className="action-buttons-bottom" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                    <button onClick={handlePrev} disabled={currentIndex === 0} style={{ padding: '0.75rem 1.5rem', background: 'var(--bg-1)', border: '1px solid var(--line)', color: currentIndex === 0 ? 'var(--text-dim)' : 'var(--text)', borderRadius: 'var(--r-pill)', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                      {lang === 'ar' ? 'السابق' : 'Previous'}
                    </button>
                    <button onClick={handleNext} disabled={currentIndex === flattenedCurriculum.length - 1} style={{ padding: '0.75rem 2rem', background: 'var(--mint)', border: 'none', color: '#fff', borderRadius: 'var(--r-pill)', cursor: currentIndex === flattenedCurriculum.length - 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                      {lang === 'ar' ? 'التالي' : 'Next'}
                    </button>
                  </div>
                </>
              )}
           </div>

           {/* RIGHT COLUMN: PLAYLIST SIDEBAR */}
           <div className="theater-sidebar-col" style={{ background: 'var(--bg-card)', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'sticky', top: '100px' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--line)', background: 'var(--bg-1)' }}>
                <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '1.1rem' }}>{lang === 'ar' ? 'محتويات الفصل' : 'Chapter Contents'}</h3>
                <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-soft)', fontSize: '0.85rem' }}>
                   {flattenedCurriculum.length} {lang === 'ar' ? 'دروس / اختبارات' : 'Lessons / Exams'}
                </p>
              </div>
              <div className="playlist-items" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                 {flattenedCurriculum.map((item, idx) => (
                   <div 
                     key={idx} 
                     onClick={() => { setCurrentIndex(idx); setActiveTab('video'); }}
                     style={{ 
                       padding: '1rem 1.5rem', 
                       borderBottom: '1px solid var(--line)', 
                       cursor: 'pointer', 
                       background: idx === currentIndex ? 'var(--mint-soft)' : 'transparent',
                       borderLeft: lang === 'ar' ? 'none' : (idx === currentIndex ? '4px solid var(--mint)' : '4px solid transparent'),
                       borderRight: lang === 'ar' ? (idx === currentIndex ? '4px solid var(--mint)' : '4px solid transparent') : 'none',
                       display: 'flex', gap: '1rem', alignItems: 'center',
                       transition: 'background 0.2s'
                     }}
                   >
                     <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: idx === currentIndex ? 'var(--mint)' : 'var(--bg-field)', color: idx === currentIndex ? '#fff' : 'var(--text-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.85rem', fontWeight: 'bold' }}>
                       {idx + 1}
                     </div>
                     <div>
                       <h4 style={{ margin: 0, color: idx === currentIndex ? 'var(--mint)' : 'var(--text)', fontSize: '0.95rem', lineHeight: 1.4 }}>{lang === 'ar' ? item.titleAr : item.titleEn}</h4>
                       <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-soft)', fontSize: '0.8rem' }}>
                         {item.type === 'lesson' ? '▶ ' + (item.duration || 38) + (lang === 'ar' ? ' دقيقة' : ' min') : '📝 ' + (lang === 'ar' ? 'اختبار' : 'Exam')}
                       </p>
                     </div>
                   </div>
                 ))}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
