import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  getMyCourses, createCourse, updateCourse, deleteCourse
} from '../services/api';
import CurriculumBuilder from '../features/courses/builder/CurriculumBuilder';
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

  // Remove old lessons and exams state

  const [loading, setLoading] = useState(false);

  useEffect(() => { loadCourses(); }, []);
  // We no longer load lessons/exams here, CurriculumBuilder handles it

  const loadCourses = async () => {
    try { const r = await getMyCourses(); setCourses(r.data); } catch {}
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

  // Removed legacy save/delete lesson and exam methods

  const handleLogout = () => { logout(); navigate('/'); };

  const SIDEBAR_ITEMS = [
    { id:'courses', icon:'📚', label:'كورساتي' },
    { id:'curriculum', icon:'📋', label:'إدارة المحتوى', disabled:!selectedCourse },
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
            { icon:'🏆', num:courses.filter(c=>c.isPublished).length, label:'الكورسات المنشورة' },
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
              <div>
                <h2>كورساتي</h2>
                <p style={{fontSize:'13px',color:'var(--text-dim)',marginTop:4}}>
                  المعلم المسؤول: <strong style={{color:'var(--mint)'}}>{user?.fullNameAr}</strong>
                </p>
              </div>
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

                    {/* ── المعلم المسؤول ── */}
                    <div style={{
                      display:'flex', alignItems:'center', gap:8, margin:'8px 0',
                      background:'rgba(52,211,153,.06)', border:'1px solid rgba(52,211,153,.18)',
                      borderRadius:8, padding:'7px 12px'
                    }}>
                      <div style={{
                        width:28, height:28, borderRadius:'50%', flexShrink:0,
                        background:'linear-gradient(135deg,var(--mint),#0a4a2e)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:12, fontWeight:800, color:'#fff'
                      }}>{(c.teacherName || user?.fullNameAr || '?')[0]}</div>
                      <div>
                        <div style={{fontSize:11, color:'var(--text-dim)', lineHeight:1}}>المعلم المسؤول</div>
                        <div style={{fontSize:13, fontWeight:700, color:'var(--mint-text)'}}>{c.teacherName || user?.fullNameAr}</div>
                      </div>
                    </div>

                    <div className="item-card__meta">
                      <span className="badge badge--amber">📖 {c.lessonCount} درس</span>
                      <span className="badge badge--violet">👥 {c.enrollmentCount} طالب</span>
                      <span className={`badge ${c.isPublished ? 'badge--mint' : 'badge--amber'}`}>
                        {c.isPublished ? '✅ منشور' : '🚫 مخفي'}
                      </span>
                    </div>
                    <div className="item-card__actions">
                      <button className="btn-primary" style={{flex:1,padding:'8px',fontSize:'13px'}}
                        onClick={() => { setSelected(c); setTab('curriculum'); }}>
                        إدارة المحتوى →
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

        {/* ── CURRICULUM TAB ── */}
        {tab === 'curriculum' && selectedCourse && (
          <div className="dash-section">
            <CurriculumBuilder courseId={selectedCourse.id} />
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


    </div>
  );
}
