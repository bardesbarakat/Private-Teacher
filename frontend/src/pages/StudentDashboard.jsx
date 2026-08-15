import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  getAllCourses, getEnrolled, enrollCourse,
  takeExam, submitExam, getResult, getMyResults
} from '../services/api';
import './Dashboard.css';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('courses');

  const [allCourses, setAllCourses]   = useState([]);
  const [enrolled, setEnrolled]       = useState([]);
  const [lessons, setLessons]         = useState([]);
  const [exams, setExams]             = useState([]);
  const [myResults, setMyResults]     = useState([]);
  const [selectedCourse, setSelected] = useState(null);

  // Exam taking state
  const [currentExam, setCurrentExam]   = useState(null);
  const [answers, setAnswers]           = useState({});
  const [examResult, setExamResult]     = useState(null);
  const [examLoading, setExamLoading]   = useState(false);
  const [timeLeft, setTimeLeft]         = useState(0);

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    if (selectedCourse) { loadLessons(selectedCourse.courseId || selectedCourse.id); loadExams(selectedCourse.courseId || selectedCourse.id); }
  }, [selectedCourse]);

  // Timer
  useEffect(() => {
    if (!currentExam || examResult) return;
    const t = setInterval(() => setTimeLeft(p => { if(p<=1){ clearInterval(t); handleSubmitExam(); return 0; } return p-1; }), 1000);
    return () => clearInterval(t);
  }, [currentExam, examResult]);

  const loadData = async () => {
    try {
      const [all, enr, res] = await Promise.all([getAllCourses(), getEnrolled(), getMyResults()]);
      setAllCourses(all.data);
      setEnrolled(enr.data);
      setMyResults(res.data);
    } catch {}
  };

  const loadLessons = async (cId) => {
    // try { const r = await getLessonsByCourse(cId); setLessons(r.data); } catch {}
  };
  const loadExams = async (cId) => {
    // try { const r = await getExamsByCourse(cId); setExams(r.data); } catch {}
  };

  const handleEnroll = async (courseId) => {
    try {
      await enrollCourse(courseId);
      toast.success('تم التسجيل في الكورس! 🎉');
      loadData();
    } catch (e) { toast.error(e.response?.data?.message || 'حدث خطأ'); }
  };

  const handleStartExam = async (examId, durationMinutes) => {
    setExamLoading(true);
    setExamResult(null);
    try {
      const r = await takeExam(examId);
      setCurrentExam(r.data);
      setAnswers({});
      setTimeLeft(durationMinutes * 60);
      setTab('exam');
    } catch (e) {
      const msg = e.response?.data?.message || 'حدث خطأ';
      toast.error(msg);
      if (e.response?.data?.alreadySubmitted) {
        // Show previous result
        const prev = myResults.find(r => r.examId === examId);
        if (prev) { const rr = await getResult(prev.id); setExamResult(rr.data); setTab('result'); }
      }
    }
    setExamLoading(false);
  };

  const handleSubmitExam = useCallback(async () => {
    if (!currentExam) return;
    setExamLoading(true);
    try {
      const payload = {
        examId: currentExam.id,
        answers: currentExam.questions.map(q => ({
          questionId: q.id,
          selectedOptionId: answers[q.id] || null
        }))
      };
      const r = await submitExam(payload);
      setExamResult(r.data);
      setTab('result');
      toast.success('تم تسليم الاختبار! 🎉');
      loadData();
    } catch (e) { toast.error(e.response?.data?.message || 'حدث خطأ في التسليم'); }
    setExamLoading(false);
  }, [currentExam, answers]);

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const isEnrolled = (cId) => enrolled.some(e => e.courseId === cId);

  const SIDEBAR = [
    { id:'courses', icon:'🌐', label:'جميع الكورسات' },
    { id:'enrolled', icon:'📚', label:'كورساتي المسجّلة' },
    { id:'lessons', icon:'📖', label:'الدروس', disabled:!selectedCourse },
    { id:'exams', icon:'📝', label:'الاختبارات', disabled:!selectedCourse },
    { id:'results', icon:'📊', label:'نتائجي' },
  ];

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar__header">
          <div className="sidebar__avatar">{(user?.fullNameAr||'S')[0]}</div>
          <div className="sidebar__name">{user?.fullNameAr}</div>
          <div className="sidebar__role"><span className="badge badge--mint">👨‍🎓 طالب</span></div>
        </div>
        <nav className="sidebar__nav">
          {SIDEBAR.map(item => (
            <button key={item.id} className={`sidebar__item ${tab===item.id?'active':''}`}
              disabled={item.disabled}
              onClick={() => { if(!item.disabled) setTab(item.id); }}>
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar__footer">
          <button className="sidebar__logout" onClick={() => { logout(); navigate('/'); }}>
            <span>🚪</span> تسجيل الخروج
          </button>
        </div>
      </aside>

      <main className="dash-content">
        <div className="dash-topbar">
          <div>
            <h1>لوحة الطالب</h1>
            <p>أهلاً {user?.fullNameAr?.split(' ')[0]}! تابع تقدّمك وأدِّ اختباراتك.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row">
          {[
            { icon:'📚', num:enrolled.length, label:'الكورسات المسجّلة' },
            { icon:'📝', num:myResults.length, label:'الاختبارات المكتملة' },
            { icon:'⭐', num:myResults.length ? Math.round(myResults.reduce((s,r)=>s+r.percentage,0)/myResults.length)+'%' : '—', label:'متوسط الدرجات' },
            { icon:'🎯', num:allCourses.length, label:'الكورسات المتاحة' },
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

        {/* ── ALL COURSES ── */}
        {tab === 'courses' && (
          <div className="dash-section">
            <div className="dash-section__head"><h2>جميع الكورسات المتاحة</h2></div>
            <div className="cards-grid">
              {allCourses.map(c => (
                <div className="item-card" key={c.id}>
                  <div className="item-card__header">
                    <span className="item-card__icon">📚</span>
                    {c.level && <span className="badge badge--mint">{c.level}</span>}
                  </div>
                  <div className="item-card__title">{c.title}</div>
                  <div className="item-card__sub">{c.teacherName}</div>
                  <div className="item-card__meta">
                    <span>📖 {c.lessonCount} درس</span>
                    <span>👥 {c.enrollmentCount}</span>
                  </div>
                  <div className="item-card__actions">
                    {isEnrolled(c.id) ? (
                      <button className="btn-ghost" style={{flex:1,justifyContent:'center'}}
                        onClick={() => { setSelected({...c,courseId:c.id}); setTab('lessons'); }}>
                        عرض الدروس →
                      </button>
                    ) : (
                      <button className="btn-primary" style={{flex:1,justifyContent:'center'}}
                        onClick={() => handleEnroll(c.id)}>
                        سجّل في الكورس
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ENROLLED ── */}
        {tab === 'enrolled' && (
          <div className="dash-section">
            <div className="dash-section__head"><h2>كورساتي المسجّلة</h2></div>
            {enrolled.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>لم تسجّل في أي كورس بعد</h3>
                <p>اذهب لتصفّح الكورسات والتسجيل</p>
                <button className="btn-primary" onClick={() => setTab('courses')}>تصفّح الكورسات</button>
              </div>
            ) : (
              <div className="cards-grid">
                {enrolled.map(e => (
                  <div className="item-card" key={e.id}>
                    <div className="item-card__icon">📚</div>
                    <div className="item-card__title">{e.courseTitle}</div>
                    <div className="item-card__sub">تاريخ التسجيل: {new Date(e.enrolledAt).toLocaleDateString('ar-DZ')}</div>
                    <div className="item-card__actions">
                      <button className="btn-primary" style={{flex:1,justifyContent:'center'}}
                        onClick={() => { setSelected({...e}); setTab('lessons'); }}>
                        الدروس والاختبارات →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── LESSONS ── */}
        {tab === 'lessons' && selectedCourse && (
          <div className="dash-section">
            <div className="dash-section__head">
              <h2>دروس: {selectedCourse.courseTitle || selectedCourse.title}</h2>
              <button className="btn-ghost" onClick={() => setTab('exams')}>الاختبارات ←</button>
            </div>
            {lessons.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📖</div><h3>لا توجد دروس بعد</h3></div>
            ) : (
              <div className="cards-grid">
                {lessons.map((l,i) => (
                  <div className="item-card" key={l.id}>
                    <div className="item-card__header">
                      <span className="item-card__icon">📖</span>
                      <span className="badge badge--amber">درس {i+1}</span>
                    </div>
                    <div className="item-card__title">{l.title}</div>
                    {l.content && <div className="item-card__sub">{l.content.slice(0,80)}...</div>}
                    <div className="item-card__actions">
                      {l.videoUrl && <a href={l.videoUrl} target="_blank" className="btn-ghost" style={{flex:1,justifyContent:'center',fontSize:'13px'}}>▶ فيديو</a>}
                      {l.pdfUrl  && <a href={l.pdfUrl}  target="_blank" className="btn-ghost" style={{flex:1,justifyContent:'center',fontSize:'13px'}}>📄 PDF</a>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── EXAMS ── */}
        {tab === 'exams' && selectedCourse && (
          <div className="dash-section">
            <div className="dash-section__head">
              <h2>اختبارات: {selectedCourse.courseTitle || selectedCourse.title}</h2>
            </div>
            {exams.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📝</div><h3>لا توجد اختبارات بعد</h3></div>
            ) : (
              <div className="cards-grid">
                {exams.map(e => {
                  const done = myResults.find(r => r.examId === e.id);
                  return (
                    <div className="item-card" key={e.id}>
                      <div className="item-card__header">
                        <span className="item-card__icon">📝</span>
                        {done
                          ? <span className="badge badge--mint">✅ مكتمل</span>
                          : <span className="badge badge--amber">⏳ لم يُؤدَّ</span>
                        }
                      </div>
                      <div className="item-card__title">{e.title}</div>
                      <div className="item-card__meta">
                        <span>❓ {e.questionCount} سؤال</span>
                        <span>⏱️ {e.durationMinutes} دقيقة</span>
                        <span>⭐ {e.totalScore} نقطة</span>
                      </div>
                      {done && (
                        <div style={{marginTop:'8px'}}>
                          <div style={{fontSize:'13px',color:'var(--text-dim)',marginBottom:'6px'}}>
                            نتيجتي: <strong style={{color:'var(--mint)'}}>{done.score}/{done.maxScore}</strong> ({Math.round(done.percentage)}%)
                          </div>
                          <div className="progress-bar"><div className="progress-bar__fill" style={{width:`${done.percentage}%`}}/></div>
                        </div>
                      )}
                      <div className="item-card__actions">
                        <button className={`${done?'btn-ghost':'btn-primary'}`} style={{flex:1,justifyContent:'center'}}
                          onClick={() => handleStartExam(e.id, e.durationMinutes)} disabled={examLoading}>
                          {done ? 'عرض النتيجة' : 'ابدأ الاختبار →'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── EXAM TAKING ── */}
        {tab === 'exam' && currentExam && !examResult && (
          <div className="exam-container">
            <div className="exam-header">
              <div>
                <h2 style={{fontSize:'18px',fontWeight:800}}>{currentExam.title}</h2>
                <p style={{fontSize:'13px',color:'var(--text-dim)'}}>{currentExam.questions.length} سؤال</p>
              </div>
              <div className={`exam-timer ${timeLeft < 120 ? 'warning' : ''}`}>
                ⏱️ {formatTime(timeLeft)}
              </div>
            </div>

            {currentExam.questions.map((q, qi) => (
              <div className="question-card" key={q.id}>
                <div className="question-num">السؤال {qi+1} من {currentExam.questions.length} · {q.score} نقطة</div>
                <div className="question-text">{q.text}</div>
                {q.options.map(opt => (
                  <div key={opt.id} className={`option-item ${answers[q.id]===opt.id?'selected':''}`}
                       onClick={() => setAnswers({...answers, [q.id]: opt.id})}>
                    <div className={`option-circle ${answers[q.id]===opt.id?'':''}` } style={{color:answers[q.id]===opt.id?'var(--mint)':'var(--text-dim)'}}>
                      {answers[q.id]===opt.id ? '●' : '○'}
                    </div>
                    {opt.text}
                  </div>
                ))}
              </div>
            ))}

            <div style={{textAlign:'center',padding:'16px 0 32px'}}>
              <button className="btn-primary lg" onClick={handleSubmitExam} disabled={examLoading}>
                {examLoading ? 'جارٍ التسليم...' : `تسليم الاختبار (${Object.keys(answers).length}/${currentExam.questions.length} إجابة)`}
              </button>
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {tab === 'result' && examResult && (
          <div className="exam-container">
            <div className="result-card">
              <div style={{fontSize:'48px',marginBottom:'12px'}}>
                {examResult.percentage >= 80 ? '🏆' : examResult.percentage >= 50 ? '👍' : '📚'}
              </div>
              <div className="result-score">{examResult.score}/{examResult.maxScore}</div>
              <div className="result-pct">{Math.round(examResult.percentage)}%</div>
              <div className="result-label" style={{color: examResult.percentage>=50?'var(--mint-text)':'var(--danger)'}}>
                {examResult.percentage >= 80 ? 'ممتاز! أداء رائع 🎉' : examResult.percentage >= 50 ? 'جيد! استمر في التقدّم 💪' : 'تحتاج مزيداً من المراجعة 📖'}
              </div>
              <div style={{display:'flex',gap:'12px',justifyContent:'center',marginTop:'16px'}}>
                <span className="badge badge--mint">✅ {examResult.answers.filter(a=>a.isCorrect).length} صحيح</span>
                <span className="badge badge--danger">❌ {examResult.answers.filter(a=>!a.isCorrect).length} خاطئ</span>
              </div>
            </div>

            {/* Detailed answers */}
            {examResult.answers.map((a,i) => (
              <div className={`question-card`} key={a.questionId}
                style={{borderColor: a.isCorrect ? 'var(--mint-line)' : 'var(--danger-line)'}}>
                <div className="question-num">السؤال {i+1} · {a.isCorrect ? '✅ صحيح' : '❌ خاطئ'}</div>
                <div className="question-text">{a.questionText}</div>
                {a.selectedOptionId && (
                  <div className={`option-item ${a.isCorrect?'correct':'wrong'}`} style={{cursor:'default'}}>
                    <div className="option-circle">{a.isCorrect?'✓':'✗'}</div>
                    إجابتك: {a.selectedOptionText}
                  </div>
                )}
                {!a.isCorrect && (
                  <div className="option-item correct" style={{cursor:'default',marginTop:'6px'}}>
                    <div className="option-circle">✓</div>
                    الإجابة الصحيحة: {a.correctOptionText}
                  </div>
                )}
              </div>
            ))}
            <div style={{textAlign:'center',padding:'16px 0 32px'}}>
              <button className="btn-primary" onClick={() => { setExamResult(null); setCurrentExam(null); setTab('results'); }}>
                عرض جميع نتائجي
              </button>
            </div>
          </div>
        )}

        {/* ── MY RESULTS ── */}
        {tab === 'results' && (
          <div className="dash-section">
            <div className="dash-section__head"><h2>نتائجي</h2></div>
            {myResults.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>لا توجد نتائج بعد</h3>
                <p>أدِّ اختباراتك وستظهر النتائج هنا</p>
              </div>
            ) : (
              <div style={{overflowX:'auto'}}>
                <table className="data-table">
                  <thead>
                    <tr><th>الاختبار</th><th>الدرجة</th><th>النسبة</th><th>الحالة</th><th>التاريخ</th></tr>
                  </thead>
                  <tbody>
                    {myResults.map(r => (
                      <tr key={r.id}>
                        <td style={{fontWeight:600}}>{r.examTitle}</td>
                        <td><strong style={{color:'var(--mint)'}}>{r.score}/{r.maxScore}</strong></td>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:'8px',minWidth:'120px'}}>
                            <div className="progress-bar" style={{flex:1}}>
                              <div className="progress-bar__fill" style={{width:`${r.percentage}%`}} />
                            </div>
                            <span style={{fontSize:'13px',color:'var(--mint)',fontWeight:700,minWidth:'38px'}}>{Math.round(r.percentage)}%</span>
                          </div>
                        </td>
                        <td><span className={`badge ${r.percentage>=50?'badge--mint':'badge--danger'}`}>{r.percentage>=80?'ممتاز':r.percentage>=50?'جيد':'ضعيف'}</span></td>
                        <td style={{color:'var(--text-dim)',fontSize:'13px'}}>{new Date(r.submittedAt).toLocaleDateString('ar-DZ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
