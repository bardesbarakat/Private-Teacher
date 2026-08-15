import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getCourseCurriculum, createTrack, createChapter, createLesson, deleteChapter, deleteLesson, getExamsByCourse, deleteExam } from '../../../services/api';
import LessonEditorModal from './LessonEditorModal';
import QuizBuilderModal from './QuizBuilderModal';
import './CurriculumBuilder.css';

export default function CurriculumBuilder({ courseId }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTracks, setExpandedTracks] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});
  const [editingLesson, setEditingLesson] = useState(null);

  const [exams, setExams] = useState([]);
  const [editingExamId, setEditingExamId] = useState(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [examTarget, setExamTarget] = useState({ courseId: null, lessonId: null });

  useEffect(() => {
    if (courseId) loadCurriculum();
  }, [courseId]);

  const loadCurriculum = async () => {
    setLoading(true);
    try {
      const [{ data: currData }, { data: examsData }] = await Promise.all([
        getCourseCurriculum(courseId, true), // true = includeDrafts
        getExamsByCourse(courseId)
      ]);
      setTracks(currData);
      setExams(examsData);
    } catch (err) {
      toast.error('حدث خطأ أثناء تحميل المنهج');
    }
    setLoading(false);
  };

  const handleAddTrack = async () => {
    const type = prompt('نوع المسار (مثال: نظري, عملي):');
    if (!type) return;
    try {
      await createTrack({ courseId, type });
      toast.success('تمت إضافة المسار');
      loadCurriculum();
    } catch (e) {
      toast.error('حدث خطأ');
    }
  };

  const handleAddChapter = async (trackId) => {
    const title = prompt('عنوان الفصل:');
    if (!title) return;
    try {
      await createChapter({ trackId, titleAr: title, titleEn: title, orderIndex: 0, isPublished: true });
      toast.success('تم إضافة الفصل');
      setExpandedTracks(prev => ({ ...prev, [trackId]: true }));
      loadCurriculum();
    } catch (e) {
      toast.error('حدث خطأ');
    }
  };

  const handleAddLesson = async (chapterId) => {
    const title = prompt('عنوان الدرس:');
    if (!title) return;
    try {
      await createLesson({ chapterId, titleAr: title, titleEn: title, orderIndex: 0, isPublished: true });
      toast.success('تم إضافة الدرس');
      setExpandedChapters(prev => ({ ...prev, [chapterId]: true }));
      loadCurriculum();
    } catch (e) {
      toast.error('حدث خطأ');
    }
  };

  const handleDeleteChapter = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الفصل بكل محتوياته؟')) return;
    try {
      await deleteChapter(id);
      toast.success('تم الحذف');
      loadCurriculum();
    } catch (e) {
      toast.error('حدث خطأ');
    }
  };

  const handleDeleteLesson = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الدرس؟')) return;
    try {
      await deleteLesson(id);
      toast.success('تم الحذف');
      loadCurriculum();
    } catch (e) {
      toast.error('حدث خطأ');
    }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الاختبار؟')) return;
    try {
      await deleteExam(id);
      toast.success('تم حذف الاختبار');
      loadCurriculum();
    } catch (e) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const openQuizBuilder = (target) => {
    setExamTarget(target);
    setEditingExamId(null);
    setIsQuizModalOpen(true);
  };

  const editQuiz = (id) => {
    setEditingExamId(id);
    setIsQuizModalOpen(true);
  };

  const toggleTrack = (id) => setExpandedTracks(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleChapter = (id) => setExpandedChapters(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) return <div className="curriculum-loading">جاري تحميل المنهج...</div>;

  return (
    <div className="curriculum-builder">
      <div className="builder-header">
        <h2>بناء المنهج (المسارات والفصول)</h2>
        <button className="btn btn--primary" onClick={handleAddTrack}>+ إضافة مسار جديد</button>
      </div>

      <div className="tracks-list">
        {tracks.length === 0 && <p className="empty-state">لم يتم إضافة أي مسارات بعد.</p>}
        {tracks.map(track => (
          <div key={track.id} className="track-card">
            <div className="track-header" onClick={() => toggleTrack(track.id)}>
              <h3>📁 مسار: {track.type}</h3>
              <div className="track-actions">
                <span className="count-badge">{track.chapters?.length || 0} فصول</span>
                <button className="btn btn--icon" onClick={(e) => { e.stopPropagation(); handleAddChapter(track.id); }} title="إضافة فصل">
                  ➕
                </button>
              </div>
            </div>

            {expandedTracks[track.id] && (
              <div className="track-body">
                {track.chapters?.length === 0 && <p className="empty-state-sm">لا توجد فصول في هذا المسار</p>}
                {track.chapters?.map(chapter => (
                  <div key={chapter.id} className="chapter-card">
                    <div className="chapter-header" onClick={() => toggleChapter(chapter.id)}>
                      <h4>📘 {chapter.titleAr} {!chapter.isPublished && <span className="draft-badge">مسودة</span>}</h4>
                      <div className="chapter-actions">
                        <button className="btn btn--icon" onClick={(e) => { e.stopPropagation(); handleAddLesson(chapter.id); }} title="إضافة درس">➕</button>
                        <button className="btn btn--icon btn--danger" onClick={(e) => { e.stopPropagation(); handleDeleteChapter(chapter.id); }} title="حذف الفصل">🗑️</button>
                      </div>
                    </div>

                    {expandedChapters[chapter.id] && (
                      <div className="chapter-body">
                        {chapter.lessons?.length === 0 && <p className="empty-state-sm">لا توجد دروس</p>}
                        {chapter.lessons?.map(lesson => {
                          const lessonExams = exams.filter(e => e.lessonId === lesson.id);
                          return (
                            <div key={lesson.id} className="lesson-item">
                              <span className="lesson-icon">📄</span>
                              <span className="lesson-title">{lesson.titleAr} {!lesson.isPublished && <span className="draft-badge">مسودة</span>}</span>
                              <div className="lesson-actions">
                                <button className="btn btn--icon" onClick={() => openQuizBuilder({ lessonId: lesson.id })} title="إضافة اختبار للدرس">📝</button>
                                <button className="btn btn--icon" onClick={() => setEditingLesson(lesson)} title="تعديل تفاصيل الدرس وملفاته">✏️</button>
                                <button className="btn btn--icon btn--danger" onClick={() => handleDeleteLesson(lesson.id)} title="حذف الدرس">🗑️</button>
                              </div>
                              {lessonExams.map(ex => (
                                <div key={ex.id} style={{ padding: '8px 12px', background: 'var(--bg-card)', marginTop: '8px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--line-soft)', width: '100%' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>📝</span>
                                    <strong>{ex.title}</strong>
                                    {!ex.isPublished && <span className="draft-badge">مسودة</span>}
                                  </div>
                                  <div>
                                    <button className="btn btn--icon" onClick={() => editQuiz(ex.id)} style={{ fontSize: '14px' }}>✏️</button>
                                    <button className="btn btn--icon btn--danger" onClick={() => handleDeleteExam(ex.id)} style={{ fontSize: '14px' }}>🗑️</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '30px', borderTop: '2px solid var(--line)', paddingTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>اختبارات المقرر الشاملة (Final Exams)</h3>
          <button className="btn btn--secondary" onClick={() => openQuizBuilder({ courseId })}>+ إضافة اختبار شامل</button>
        </div>
        {exams.filter(e => e.courseId === courseId).map(ex => (
          <div key={ex.id} style={{ padding: '12px 16px', background: 'var(--bg-card)', marginBottom: '10px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--line-soft)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>📝</span>
              <div>
                <strong style={{ fontSize: '15px' }}>{ex.title}</strong>
                {!ex.isPublished && <span className="draft-badge" style={{ marginRight: '8px' }}>مسودة</span>}
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>{ex.questionCount} أسئلة · {ex.durationMinutes} دقيقة</div>
              </div>
            </div>
            <div>
              <button className="btn btn--icon" onClick={() => editQuiz(ex.id)}>✏️</button>
              <button className="btn btn--icon btn--danger" onClick={() => handleDeleteExam(ex.id)}>🗑️</button>
            </div>
          </div>
        ))}
        {exams.filter(e => e.courseId === courseId).length === 0 && <p className="empty-state-sm">لا توجد اختبارات شاملة.</p>}
      </div>

      {editingLesson && (
        <LessonEditorModal 
          lesson={editingLesson} 
          onClose={() => setEditingLesson(null)} 
          onSave={() => { setEditingLesson(null); loadCurriculum(); }} 
        />
      )}

      {isQuizModalOpen && (
        <QuizBuilderModal
          courseId={examTarget.courseId}
          lessonId={examTarget.lessonId}
          existingExamId={editingExamId}
          onClose={() => setIsQuizModalOpen(false)}
          onSave={() => { setIsQuizModalOpen(false); loadCurriculum(); }}
        />
      )}
    </div>
  );
}
