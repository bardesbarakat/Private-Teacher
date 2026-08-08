import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllCourses, enrollCourse } from '../services/api';
import toast from 'react-hot-toast';
import './Home.css';

const LEVEL_LABELS = { Bac1:'أولى بكالوريا', Bac2:'تانية بكالوريا', General:'عام' };
const LEVELS = ['', 'Bac1', 'Bac2', 'General'];

export default function Courses() {
  const { isAuthenticated, role } = useAuth();
  const [courses, setCourses]     = useState([]);
  const [level, setLevel]         = useState('');
  const [loading, setLoading]     = useState(true);

  useEffect(() => { load(); }, [level]);

  const load = async () => {
    setLoading(true);
    try { const r = await getAllCourses(level || undefined); setCourses(r.data); }
    catch {}
    setLoading(false);
  };

  const handleEnroll = async (courseId) => {
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    try { await enrollCourse(courseId); toast.success('تم التسجيل! ✅'); }
    catch (e) { toast.error(e.response?.data?.message || 'حدث خطأ'); }
  };

  return (
    <>
      <div style={{minHeight:'100vh', paddingTop:'calc(var(--nav-h) + 32px)', paddingBottom:'60px'}}>
        <div className="container">
          <div className="section-head">
            <span className="section-eyebrow">EduBarakat</span>
            <h1>جميع الكورسات</h1>
            <p>اختر الكورس المناسب لمستواك وابدأ رحلة التعلّم</p>
          </div>

          {/* Filter */}
          <div style={{display:'flex',gap:'10px',justifyContent:'center',flexWrap:'wrap',marginBottom:'32px'}}>
            {LEVELS.map(l => (
              <button key={l} className={`btn-ghost ${level===l?'':''}`}
                style={level===l ? {borderColor:'var(--mint)',background:'var(--mint-soft)',color:'var(--mint-text)'} : {}}
                onClick={() => setLevel(l)}>
                {l === '' ? 'الكل' : LEVEL_LABELS[l]}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner spinner--lg" /></div>
          ) : courses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>لا توجد كورسات متاحة</h3>
            </div>
          ) : (
            <div className="courses-grid">
              {courses.map(c => (
                <div className="course-card" key={c.id}>
                  <div className="course-card__thumb">
                    {c.level === 'Bac1' ? '📐' : c.level === 'Bac2' ? '🎯' : '💡'}
                  </div>
                  <div className="course-card__body">
                    {c.level && <div className="course-card__level"><span className="badge badge--mint">{LEVEL_LABELS[c.level] || c.level}</span></div>}
                    <h3 className="course-card__title">{c.title}</h3>
                    {c.description && <p className="course-card__desc">{c.description.slice(0,100)}</p>}
                    <div className="course-card__meta">
                      <span>📚 {c.lessonCount} درس</span>
                      <span>👥 {c.enrollmentCount} طالب</span>
                    </div>
                    <p className="course-card__teacher">المدرّس: {c.teacherName}</p>
                    {role === 'Student' && (
                      <button className="btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={() => handleEnroll(c.id)}>
                        سجّل في الكورس
                      </button>
                    )}
                    {!isAuthenticated && (
                      <a href="/register" className="btn-primary" style={{width:'100%',justifyContent:'center',display:'flex'}}>
                        سجّل للانضمام
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
