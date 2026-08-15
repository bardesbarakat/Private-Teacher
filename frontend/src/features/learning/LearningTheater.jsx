import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCourseCurriculum, getExamsByCourse, getCourseDetails } from '../../services/api';
import QuizPlayer from './QuizPlayer';
import './LearningTheater.css';

export default function LearningTheater() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for Accordion
  const [expandedTracks, setExpandedTracks] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});

  // Active Content
  const [activeItem, setActiveItem] = useState({ type: null, id: null, data: null }); // type: 'lesson' | 'exam'
  const [lang, setLang] = useState('ar'); // 'ar' or 'en'

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, currRes, examsRes] = await Promise.all([
        getCourseDetails(courseId),
        getCourseCurriculum(courseId),
        getExamsByCourse(courseId)
      ]);
      setCourse(cRes.data);
      setTracks(currRes.data);
      setExams(examsRes.data);

      // Auto-expand first track and chapter
      if (currRes.data.length > 0) {
        setExpandedTracks({ [currRes.data[0].id]: true });
        if (currRes.data[0].chapters?.length > 0) {
          setExpandedChapters({ [currRes.data[0].chapters[0].id]: true });
          // Auto-select first lesson
          if (currRes.data[0].chapters[0].lessons?.length > 0) {
            setActiveItem({ type: 'lesson', id: currRes.data[0].chapters[0].lessons[0].id, data: currRes.data[0].chapters[0].lessons[0] });
          }
        }
      }
    } catch (e) {
      toast.error('فشل تحميل محتوى الكورس');
      navigate('/student-dashboard');
    }
    setLoading(false);
  };

  const toggleTrack = (id) => setExpandedTracks(p => ({ ...p, [id]: !p[id] }));
  const toggleChapter = (id) => setExpandedChapters(p => ({ ...p, [id]: !p[id] }));

  const selectLesson = (lesson) => setActiveItem({ type: 'lesson', id: lesson.id, data: lesson });
  const selectExam = (exam) => setActiveItem({ type: 'exam', id: exam.id, data: exam });

  if (loading) return <div className="theater-loading">جاري تجهيز مسرح التعلم...</div>;

  return (
    <div className="learning-theater" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* HEADER */}
      <header className="theater-header">
        <div className="header-right">
          <button className="btn-back" onClick={() => navigate('/student-dashboard')}>← العودة</button>
          <h1 className="course-title">{course?.title}</h1>
        </div>
        <div className="header-left">
          <button 
            className={`lang-toggle ${lang === 'ar' ? 'active' : ''}`} 
            onClick={() => setLang('ar')}>العربية</button>
          <button 
            className={`lang-toggle ${lang === 'en' ? 'active' : ''}`} 
            onClick={() => setLang('en')}>English</button>
        </div>
      </header>

      <div className="theater-body">
        {/* SIDEBAR - CURRICULUM */}
        <aside className="theater-sidebar">
          <h3 className="sidebar-title">{lang === 'ar' ? 'محتوى الكورس' : 'Course Content'}</h3>
          <div className="accordion">
            {tracks.map(track => (
              <div key={track.id} className="acc-track">
                <div className="acc-track-head" onClick={() => toggleTrack(track.id)}>
                  <span>{track.type}</span>
                  <span>{expandedTracks[track.id] ? '▲' : '▼'}</span>
                </div>
                {expandedTracks[track.id] && (
                  <div className="acc-track-body">
                    {track.chapters?.map(chapter => (
                      <div key={chapter.id} className="acc-chapter">
                        <div className="acc-chapter-head" onClick={() => toggleChapter(chapter.id)}>
                          <span>{lang === 'ar' ? chapter.titleAr : (chapter.titleEn || chapter.titleAr)}</span>
                          <span>{expandedChapters[chapter.id] ? '−' : '+'}</span>
                        </div>
                        {expandedChapters[chapter.id] && (
                          <div className="acc-chapter-body">
                            {/* LESSONS */}
                            {chapter.lessons?.map(lesson => (
                              <div key={`l-${lesson.id}`}>
                                <div 
                                  className={`acc-lesson ${activeItem.type === 'lesson' && activeItem.id === lesson.id ? 'active' : ''}`}
                                  onClick={() => selectLesson(lesson)}
                                >
                                  <span className="icon">▶️</span>
                                  <span className="title">{lang === 'ar' ? lesson.titleAr : (lesson.titleEn || lesson.titleAr)}</span>
                                </div>
                                {/* EXAMS FOR THIS LESSON */}
                                {exams.filter(e => e.lessonId === lesson.id).map(ex => (
                                  <div 
                                    key={`e-${ex.id}`} 
                                    className={`acc-exam ${activeItem.type === 'exam' && activeItem.id === ex.id ? 'active' : ''}`}
                                    onClick={() => selectExam(ex)}
                                  >
                                    <span className="icon">📝</span>
                                    <span className="title">{ex.title}</span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* COURSE LEVEL EXAMS */}
            {exams.filter(e => e.courseId === course.id).length > 0 && (
              <div className="acc-track mt-4">
                <div className="acc-track-head" style={{ background: 'var(--amber-soft)', color: 'var(--amber-text)' }}>
                  <span>{lang === 'ar' ? 'اختبارات شاملة' : 'Final Exams'}</span>
                </div>
                <div className="acc-track-body" style={{ display: 'block' }}>
                  {exams.filter(e => e.courseId === course.id).map(ex => (
                    <div 
                      key={`e-${ex.id}`} 
                      className={`acc-exam ${activeItem.type === 'exam' && activeItem.id === ex.id ? 'active' : ''}`}
                      onClick={() => selectExam(ex)}
                    >
                      <span className="icon">🏆</span>
                      <span className="title">{ex.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN VIEWER */}
        <main className="theater-main">
          {activeItem.type === 'lesson' && activeItem.data && (
            <div className="lesson-viewer">
              <h2 className="viewer-title">{lang === 'ar' ? activeItem.data.titleAr : (activeItem.data.titleEn || activeItem.data.titleAr)}</h2>
              
              {/* Content / Video */}
              <div className="viewer-content">
                <p className="lesson-desc">{lang === 'ar' ? activeItem.data.contentAr : (activeItem.data.contentEn || activeItem.data.contentAr)}</p>
                
                {/* VIDEO PLAYER */}
                {activeItem.data.videoUrl && (
                  <div className="video-wrapper">
                    {/* Just a simple iframe for now. If it's YouTube, it works. If it's raw MP4, we can use <video> */}
                    {activeItem.data.videoUrl.includes('youtube.com') || activeItem.data.videoUrl.includes('youtu.be') ? (
                       <iframe 
                         src={activeItem.data.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} 
                         frameBorder="0" 
                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                         allowFullScreen
                         title="Lesson Video"
                       ></iframe>
                    ) : (
                      <video controls width="100%">
                        <source src={activeItem.data.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                )}
              </div>

              {/* PDF ATTACHMENT */}
              {activeItem.data.pdfUrl && (
                <div className="pdf-wrapper">
                  <h3>{lang === 'ar' ? 'المادة العلمية (PDF)' : 'Study Material (PDF)'}</h3>
                  <iframe src={activeItem.data.pdfUrl} width="100%" height="600px" title="PDF Document"></iframe>
                </div>
              )}
            </div>
          )}

          {activeItem.type === 'exam' && activeItem.data && (
            <QuizPlayer examId={activeItem.id} lang={lang} onComplete={loadData} />
          )}

          {!activeItem.type && (
            <div className="theater-empty">
              <span>👈</span> {lang === 'ar' ? 'اختر درساً أو اختباراً للبدء' : 'Select a lesson or exam to start'}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
