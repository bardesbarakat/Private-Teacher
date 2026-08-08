import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  getMyCourses, createCourse, updateCourse, deleteCourse,
  getLessonsByCourse, createLesson, deleteLesson,
  getExamsByCourse, createExam
} from '../services/api';
import './Dashboard.css';

const LEVELS = [
  { value:'Bac1', label:'أولى بكالوريا' },
  { value:'Bac2', label:'تانية بكالوريا' },
  { value:'General', label:'عام' },
];

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]  = useState('courses');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Courses
  const [courses, setCourses]         = useState([]);
  const [selectedCourse, setSelected] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse]     = useState(null);
  const [courseForm, setCourseForm]           = useState({ title:'', description:'', level:'Bac1' });

  // Lessons
  const [lessons, setLessons]         = useState([]);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm]   = useState({ title:'', content:'', videoUrl:'', pdfUrl:'', order:1 });

  // Exams
  const [exams, setExams]   = useState([]);
  const [showExamModal, setShowExamModal] = useState(false);
  const [examForm, setExamForm] = useState({ title:'', description:'', durationMinutes:30, questions:[] });
  const [newQuestion, setNewQuestion] = useState({ text:'', score:1, options:['','','',''], correctIndex:0 });

  const [loading, setLoading] = useState(false);

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => {
    if (selectedCourse) { loadLessons(); loadExams(); }
  }, [selectedCourse]);

  const loadCourses = async () => {
    try { const r = await getMyCourses(); setCourses(r.data); } catch {}
  };
  const loadLessons = async () => {
    try { const r = await getLessonsByCourse(selectedCourse.id); setLessons(r.data); } catch {}
  };
  const loadExams = async () => {
    try { const r = await getExamsByCourse(selectedCourse.id); setExams(r.data); } catch {}
  };

  const handleSaveCourse = async () => {
    if (!courseForm.title.trim()) { toast.error('عنوان الكورس مطلوب'); return; }
    setLoading(true);
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, { ...courseForm, isPublished: true });
        toast.success('تم تحديث الكورس');
      } else {
        await createCourse(courseForm);
        toast.success('تم إنشاء الكورس ✅');
      }
      setShowCourseModal(false); setEditingCourse(null);
      setCourseForm({ title:'', description:'', level:'Bac1' });
      loadCourses();
    } catch (e) { toast.error(e.response?.data?.message || 'حدث خطأ'); }
    setLoading(false);
  };

  const handleDeleteCourse = async (id) => {
    if (!confirm('هل تريد حذف هذا الكورس؟')) return;
    try { await deleteCourse(id); toast.success('تم الحذف'); loadCourses(); setSelected(null); }
    catch (e) { toast.error(e.response?.data?.message || 'حدث خطأ'); }
  };

  const handleSaveLesson = async () => {
    if (!lessonForm.title.trim()) { toast.error('عنوان الدرس مطلوب'); return; }
    setLoading(true);
    try {
      await createLesson({ ...lessonForm, courseId: selectedCourse.id });
      toast.success('تم إضافة الدرس ✅');
      setShowLessonModal(false);
      setLessonForm({ title:'', content:'', videoUrl:'', pdfUrl:'', order:lessons.length+1 });
      loadLessons();
    } catch (e) { toast.error(e.response?.data?.message || 'حدث خطأ'); }
    setLoading(false);
  };

  const handleDeleteLesson = async (id) => {
    if (!confirm('هل تريد حذف هذا الدرس؟')) return;
    try { await deleteLesson(id); toast.success('تم الحذف'); loadLessons(); }
    catch (e) { toast.error('حدث خطأ'); }
  };

  const addQuestion = () => {
    if (!newQuestion.text.trim()) { toast.error('نص السؤال مطلوب'); return; }
    const options = newQuestion.options.map((text, i) => ({ text, isCorrect: i === newQuestion.correctIndex }));
    setExamForm(f => ({ ...f, questions: [...f.questions, { text: newQuestion.text, score: newQuestion.score, order: f.questions.length+1, options }] }));
    setNewQuestion({ text:'', score:1, options:['','','',''], correctIndex:0 });
    toast.success('تم إضافة السؤال');
  };

  const handleSaveExam = async () => {
    if (!examForm.title.trim()) { toast.error('عنوان الاختبار مطلوب'); return; }
    if (examForm.questions.length === 0) { toast.error('أضف سؤالاً واحداً على الأقل'); return; }
    setLoading(true);
    try {
      await createExam({ ...examForm, courseId: selectedCourse.id });
      toast.success('تم إنشاء الاختبار ✅');
      setShowExamModal(false);
      setExamForm({ title:'', description:'', durationMinutes:30, questions:[] });
      loadExams();
    } catch (e) { toast.error(e.response?.data?.message || 'حدث خطأ'); }
    setLoading(false);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const SIDEBAR_ITEMS = [
    { id:'courses', icon:'📚', label:'كورساتي' },
    { id:'lessons', icon:'📖', label:'الدروس', disabled:!selectedCourse },
    { id:'exams',   icon:'📝', label:'الاختبارات', disabled:!selectedCourse },
  ];

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar__header">
          <div className="sidebar__avatar">{(user?.fullNameAr||'T')[0]}</div>
          <div className="sidebar__name">{user?.fullNameAr}</div>
          <div className="sidebar__role">
            <span className="badge badge--violet">👩‍🏫 مدرّس</span>
          </div>
        </div>
        <nav className="sidebar__nav">
          {SIDEBAR_ITEMS.map(item => (
            <button key={item.id} className={`sidebar__item ${tab===item.id?'active':''} ${item.disabled?'':''}` }
              onClick={() => { if(!item.disabled){ setTab(item.id); setSidebarOpen(false); } }}
              disabled={item.disabled} title={item.disabled ? 'اختر كورساً أولاً' : ''}>
              <span className="icon">{item.icon}</span>
              {item.label}
              {item.disabled && <span style={{marginRight:'auto',fontSize:'11px',color:'var(--text-dim)'}}>اختر كورساً</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar__footer">
          <button className="sidebar__logout" onClick={handleLogout}>
            <span>🚪</span> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dash-content">
        {/* Topbar */}
        <div className="dash-topbar">
          <div>
            <h1>لوحة المدرّس</h1>
            <p>مرحباً {user?.fullNameAr?.split(' ')[0]}! أدر كورساتك ودروسك من هنا.</p>
          </div>
          <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
            {selectedCourse && (
              <span className="badge badge--mint" style={{fontSize:'13px',padding:'6px 14px'}}>
                📚 {selectedCourse.title}
              </span>
            )}
            <button className="nav__burger" style={{display:'flex'}} onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row">
          {[
            { icon:'📚', num:courses.length, label:'إجمالي الكورسات' },
            { icon:'📖', num:courses.reduce((s,c)=>s+(c.lessonCount||0),0), label:'إجمالي الدروس' },
            { icon:'👥', num:courses.reduce((s,c)=>s+(c.enrollmentCount||0),0), label:'الطلاب المسجّلون' },
            { icon:'📝', num:selectedCourse ? exams.length : '—', label:'الاختبارات' },
          ].map((s,i) => (
            <div className="stat-card" key={i}>
              <div className="stat-card__icon">{s.icon}</div>
              <div>
                <div className="stat-card__num">{s.num}</div>
                <div className="stat-card__label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── COURSES TAB ── */}
        {tab === 'courses' && (
          <div className="dash-section">
            <div className="dash-section__head">
              <h2>كورساتي</h2>
              <button className="btn-primary" onClick={() => { setEditingCourse(null); setCourseForm({title:'',description:'',level:'Bac1'}); setShowCourseModal(true); }}>
                + إضافة كورس
              </button>
            </div>
            {courses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>لا يوجد كورسات بعد</h3>
                <p>ابدأ بإضافة كورسك الأول!</p>
                <button className="btn-primary" onClick={() => setShowCourseModal(true)}>إضافة أول كورس</button>
              </div>
            ) : (
              <div className="cards-grid">
                {courses.map(c => (
                  <div className={`item-card ${selectedCourse?.id===c.id?'':''}` } key={c.id}
                       style={selectedCourse?.id===c.id ? {borderColor:'var(--mint)'}:{}}>
                    <div className="item-card__header">
                      <span className="item-card__icon">📚</span>
                      <span className="badge badge--mint">{c.level || 'عام'}</span>
                    </div>
                    <div className="item-card__title">{c.title}</div>
                    <div className="item-card__sub">{c.description?.slice(0,80)}</div>
                    <div className="item-card__meta">
                      <span className="badge badge--amber">📖 {c.lessonCount} درس</span>
                      <span className="badge badge--violet">👥 {c.enrollmentCount} طالب</span>
                    </div>
                    <div className="item-card__actions">
                      <button className="btn-primary" style={{flex:1,padding:'8px',fontSize:'13px'}}
                        onClick={() => { setSelected(c); setTab('lessons'); }}>
                        إدارة →
                      </button>
                      <button className="btn-ghost" style={{padding:'8px 10px',fontSize:'13px'}}
                        onClick={() => { setEditingCourse(c); setCourseForm({title:c.title,description:c.description||'',level:c.level||'Bac1'}); setShowCourseModal(true); }}>
                        ✏️
                      </button>
                      <button className="btn-danger" style={{padding:'8px 10px'}} onClick={() => handleDeleteCourse(c.id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── LESSONS TAB ── */}
        {tab === 'lessons' && selectedCourse && (
          <div className="dash-section">
            <div className="dash-section__head">
              <h2>دروس: {selectedCourse.title}</h2>
              <button className="btn-primary" onClick={() => { setLessonForm({title:'',content:'',videoUrl:'',pdfUrl:'',order:lessons.length+1}); setShowLessonModal(true); }}>
                + إضافة درس
              </button>
            </div>
            {lessons.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📖</div>
                <h3>لا توجد دروس بعد</h3>
                <p>أضف أول درس لهذا الكورس</p>
                <button className="btn-primary" onClick={() => setShowLessonModal(true)}>إضافة درس</button>
              </div>
            ) : (
              <div style={{overflowX:'auto'}}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th><th>عنوان الدرس</th><th>فيديو</th><th>PDF</th><th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lessons.map((l,i) => (
                      <tr key={l.id}>
                        <td>{i+1}</td>
                        <td style={{fontWeight:600}}>{l.title}</td>
                        <td>{l.videoUrl ? <a href={l.videoUrl} target="_blank" className="auth-link" style={{fontSize:'12px'}}>رابط ▶</a> : <span style={{color:'var(--text-dim)'}}>—</span>}</td>
                        <td>{l.pdfUrl ? <a href={l.pdfUrl} target="_blank" className="auth-link" style={{fontSize:'12px'}}>PDF 📄</a> : <span style={{color:'var(--text-dim)'}}>—</span>}</td>
                        <td><button className="btn-danger" style={{padding:'6px 10px',fontSize:'12px'}} onClick={() => handleDeleteLesson(l.id)}>حذف</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── EXAMS TAB ── */}
        {tab === 'exams' && selectedCourse && (
          <div className="dash-section">
            <div className="dash-section__head">
              <h2>اختبارات: {selectedCourse.title}</h2>
              <button className="btn-primary" onClick={() => { setExamForm({title:'',description:'',durationMinutes:30,questions:[]}); setShowExamModal(true); }}>
                + إضافة اختبار
              </button>
            </div>
            {exams.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>لا توجد اختبارات</h3>
                <p>أنشئ أول اختبار لهذا الكورس</p>
                <button className="btn-primary" onClick={() => setShowExamModal(true)}>إنشاء اختبار</button>
              </div>
            ) : (
              <div className="cards-grid">
                {exams.map(e => (
                  <div className="item-card" key={e.id}>
                    <div className="item-card__header">
                      <span className="item-card__icon">📝</span>
                      <span className="badge badge--violet">{e.durationMinutes} دقيقة</span>
                    </div>
                    <div className="item-card__title">{e.title}</div>
                    <div className="item-card__meta">
                      <span className="badge badge--mint">❓ {e.questionCount} سؤال</span>
                      <span className="badge badge--amber">⭐ {e.totalScore} نقطة</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Course Modal ── */}
      {showCourseModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&setShowCourseModal(false)}>
          <div className="modal">
            <h3>{editingCourse ? 'تعديل الكورس' : 'إضافة كورس جديد'}</h3>
            <div className="auth-form">
              <div className="form-group">
                <label className="form-label">عنوان الكورس *</label>
                <input className="form-input" value={courseForm.title} onChange={e=>setCourseForm({...courseForm,title:e.target.value})} placeholder="عنوان الكورس..." />
              </div>
              <div className="form-group">
                <label className="form-label">الوصف</label>
                <textarea className="form-input" rows="3" value={courseForm.description} onChange={e=>setCourseForm({...courseForm,description:e.target.value})} placeholder="وصف الكورس..." style={{resize:'vertical'}} />
              </div>
              <div className="form-group">
                <label className="form-label">المستوى</label>
                <select className="form-input form-select" value={courseForm.level} onChange={e=>setCourseForm({...courseForm,level:e.target.value})}>
                  {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button className="btn-primary" onClick={handleSaveCourse} disabled={loading}>
                  {loading ? 'جارٍ الحفظ...' : 'حفظ'}
                </button>
                <button className="btn-ghost" onClick={() => setShowCourseModal(false)}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Lesson Modal ── */}
      {showLessonModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&setShowLessonModal(false)}>
          <div className="modal">
            <h3>إضافة درس جديد</h3>
            <div className="auth-form">
              <div className="form-group">
                <label className="form-label">عنوان الدرس *</label>
                <input className="form-input" value={lessonForm.title} onChange={e=>setLessonForm({...lessonForm,title:e.target.value})} placeholder="عنوان الدرس..." />
              </div>
              <div className="form-group">
                <label className="form-label">المحتوى النصي</label>
                <textarea className="form-input" rows="4" value={lessonForm.content} onChange={e=>setLessonForm({...lessonForm,content:e.target.value})} placeholder="اكتب محتوى الدرس هنا..." style={{resize:'vertical'}} />
              </div>
              <div className="form-group">
                <label className="form-label">رابط الفيديو (YouTube أو غيره)</label>
                <input className="form-input" type="url" dir="ltr" value={lessonForm.videoUrl} onChange={e=>setLessonForm({...lessonForm,videoUrl:e.target.value})} placeholder="https://youtube.com/..." />
              </div>
              <div className="form-group">
                <label className="form-label">رابط ملف PDF</label>
                <input className="form-input" type="url" dir="ltr" value={lessonForm.pdfUrl} onChange={e=>setLessonForm({...lessonForm,pdfUrl:e.target.value})} placeholder="https://example.com/lesson.pdf" />
              </div>
              <div className="modal-actions">
                <button className="btn-primary" onClick={handleSaveLesson} disabled={loading}>
                  {loading ? 'جارٍ الحفظ...' : 'إضافة الدرس'}
                </button>
                <button className="btn-ghost" onClick={() => setShowLessonModal(false)}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Exam Modal ── */}
      {showExamModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&setShowExamModal(false)}>
          <div className="modal" style={{maxWidth:'640px'}}>
            <h3>إنشاء اختبار جديد</h3>
            <div className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">عنوان الاختبار *</label>
                  <input className="form-input" value={examForm.title} onChange={e=>setExamForm({...examForm,title:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">المدة (دقائق)</label>
                  <input className="form-input" type="number" min="5" value={examForm.durationMinutes} onChange={e=>setExamForm({...examForm,durationMinutes:+e.target.value})} />
                </div>
              </div>

              {/* Added questions list */}
              {examForm.questions.length > 0 && (
                <div style={{background:'var(--bg-field)',border:'1px solid var(--line-soft)',borderRadius:'var(--r-sm)',padding:'12px'}}>
                  <p style={{fontSize:'13px',fontWeight:700,marginBottom:'8px',color:'var(--mint)'}}>الأسئلة المضافة ({examForm.questions.length})</p>
                  {examForm.questions.map((q,i) => (
                    <div key={i} style={{fontSize:'13px',padding:'6px 0',borderBottom:'1px solid var(--line-soft)',display:'flex',justifyContent:'space-between'}}>
                      <span>({i+1}) {q.text.slice(0,50)}</span>
                      <span style={{color:'var(--mint)'}}>{q.score} نقطة</span>
                    </div>
                  ))}
                </div>
              )}

              {/* New question form */}
              <div style={{background:'var(--bg-field)',border:'1px solid var(--mint-line)',borderRadius:'var(--r-sm)',padding:'14px'}}>
                <p style={{fontSize:'13px',fontWeight:700,marginBottom:'10px',color:'var(--mint-text)'}}>إضافة سؤال جديد</p>
                <div className="form-group" style={{marginBottom:'10px'}}>
                  <label className="form-label">نص السؤال</label>
                  <textarea className="form-input" rows="2" value={newQuestion.text} onChange={e=>setNewQuestion({...newQuestion,text:e.target.value})} placeholder="اكتب نص السؤال..." style={{resize:'vertical'}} />
                </div>
                <div className="form-group" style={{marginBottom:'10px'}}>
                  <label className="form-label">النقاط</label>
                  <input className="form-input" type="number" min="1" value={newQuestion.score} onChange={e=>setNewQuestion({...newQuestion,score:+e.target.value})} style={{width:'100px'}} />
                </div>
                <div style={{marginBottom:'10px'}}>
                  <label className="form-label" style={{marginBottom:'8px',display:'block'}}>الخيارات (اختر الصحيح)</label>
                  {newQuestion.options.map((opt,i) => (
                    <div key={i} style={{display:'flex',gap:'8px',alignItems:'center',marginBottom:'6px'}}>
                      <input type="radio" name="correct" checked={newQuestion.correctIndex===i}
                        onChange={() => setNewQuestion({...newQuestion,correctIndex:i})}
                        style={{accentColor:'var(--mint)',width:'16px',height:'16px'}} />
                      <input className="form-input" value={opt} placeholder={`الخيار ${i+1}`}
                        onChange={e => { const opts=[...newQuestion.options]; opts[i]=e.target.value; setNewQuestion({...newQuestion,options:opts}); }} />
                    </div>
                  ))}
                </div>
                <button type="button" className="btn-ghost" style={{width:'100%',justifyContent:'center'}} onClick={addQuestion}>
                  + إضافة هذا السؤال
                </button>
              </div>

              <div className="modal-actions">
                <button className="btn-primary" onClick={handleSaveExam} disabled={loading || examForm.questions.length===0}>
                  {loading ? 'جارٍ الحفظ...' : `حفظ الاختبار (${examForm.questions.length} سؤال)`}
                </button>
                <button className="btn-ghost" onClick={() => setShowExamModal(false)}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
