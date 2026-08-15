import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  adminGetStats, adminGetUsers, adminToggleUser, adminDeleteUser,
  adminGetCourses, adminToggleCourse, adminDeleteCourse,
  adminGetSubmissions, adminMakeAdmin
} from '../services/api';

/* ── tiny StatCard ── */
function StatCard({ icon, num, label, color = 'var(--mint)' }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,.03)', border: '1px solid var(--line-soft)',
      borderRadius: 'var(--r-lg)', padding: '22px', display: 'flex',
      alignItems: 'center', gap: '16px'
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14, fontSize: 24, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,.05)', border: '1px solid var(--line-soft)'
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-latin)', color }}>{num}</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

/* ── Badge ── */
function RoleBadge({ role }) {
  const map = {
    Admin:   { bg: 'rgba(239,68,68,.15)', color: '#fca5a5',  border: 'rgba(239,68,68,.4)',   label: '⚙️ أدمن' },
    Teacher: { bg: 'rgba(167,139,250,.1)', color: '#c4b5fd', border: 'rgba(167,139,250,.3)', label: '👩‍🏫 مدرّس' },
    Student: { bg: 'rgba(52,211,153,.1)',  color: '#7ee7b6', border: 'rgba(52,211,153,.3)',  label: '👨‍🎓 طالب' },
    Parent:  { bg: 'rgba(251,191,36,.1)',  color: '#fcd34d', border: 'rgba(251,191,36,.3)',  label: '👨‍👧 ولي أمر' },
  };
  const s = map[role] || { bg: 'rgba(255,255,255,.05)', color: 'var(--text-dim)', border: 'var(--line)', label: role };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`
    }}>{s.label}</span>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');

  /* data */
  const [stats, setStats]           = useState(null);
  const [users, setUsers]           = useState([]);
  const [courses, setCourses]       = useState([]);
  const [submissions, setSubmissions] = useState([]);

  /* filters */
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(false);

  /* ── loaders ── */
  const loadStats = useCallback(async () => {
    try { const r = await adminGetStats(); setStats(r.data); } catch {}
  }, []);

  const loadUsers = useCallback(async () => {
    try { const r = await adminGetUsers(roleFilter || undefined, search || undefined); setUsers(r.data); } catch {}
  }, [roleFilter, search]);

  const loadCourses = useCallback(async () => {
    try { const r = await adminGetCourses(); setCourses(r.data); } catch {}
  }, []);

  const loadSubmissions = useCallback(async () => {
    try { const r = await adminGetSubmissions(); setSubmissions(r.data); } catch {}
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { if (tab === 'users') loadUsers(); }, [tab, loadUsers]);
  useEffect(() => { if (tab === 'courses') loadCourses(); }, [tab, loadCourses]);
  useEffect(() => { if (tab === 'submissions') loadSubmissions(); }, [tab, loadSubmissions]);

  /* ── actions ── */
  const handleToggleUser = async (id) => {
    try {
      const r = await adminToggleUser(id);
      toast.success(r.data.message);
      loadUsers(); loadStats();
    } catch { toast.error('حدث خطأ'); }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`هل تريد حذف "${name}" نهائياً؟`)) return;
    try {
      await adminDeleteUser(id);
      toast.success('تم الحذف');
      loadUsers(); loadStats();
    } catch (e) { toast.error(e.response?.data?.message || 'حدث خطأ'); }
  };

  const handleMakeAdmin = async (id, name) => {
    if (!window.confirm(`منح صلاحيات الأدمن لـ "${name}"؟`)) return;
    try {
      await adminMakeAdmin(id);
      toast.success('تم منح الصلاحيات');
      loadUsers();
    } catch { toast.error('حدث خطأ'); }
  };

  const handleToggleCourse = async (id) => {
    try {
      const r = await adminToggleCourse(id);
      toast.success(r.data.message);
      loadCourses();
    } catch { toast.error('حدث خطأ'); }
  };

  const handleDeleteCourse = async (id, title) => {
    if (!window.confirm(`حذف كورس "${title}"؟`)) return;
    try {
      await adminDeleteCourse(id);
      toast.success('تم حذف الكورس');
      loadCourses(); loadStats();
    } catch (e) { toast.error(e.response?.data?.message || 'حدث خطأ'); }
  };

  /* ── sidebar tabs ── */
  const TABS = [
    { id: 'overview',     icon: '📊', label: 'نظرة عامة' },
    { id: 'users',        icon: '👥', label: 'المستخدمون' },
    { id: 'courses',      icon: '📚', label: 'الكورسات' },
    { id: 'submissions',  icon: '📝', label: 'نتائج الاختبارات' },
  ];

  const pct = (p) => `${Math.round(p)}%`;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', paddingTop: 'var(--nav-h)', background: 'var(--bg-1)' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 256, background: 'rgba(4,9,6,.95)', backdropFilter: 'blur(12px)',
        borderLeft: '1px solid var(--line-soft)',
        position: 'fixed', top: 'var(--nav-h)', bottom: 0, right: 0,
        display: 'flex', flexDirection: 'column', zIndex: 40, overflowY: 'auto'
      }}>
        {/* header */}
        <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid var(--line-soft)' }}>
          <div style={{
            width: 50, height: 50, borderRadius: '50%', marginBottom: 10,
            background: 'linear-gradient(135deg,#ef4444,#b91c1c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: '#fff'
          }}>⚙️</div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{user?.fullNameAr}</div>
          <div style={{ marginTop: 4 }}><RoleBadge role="Admin" /></div>
        </div>

        {/* nav */}
        <nav style={{ padding: '8px 0', flex: 1 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '13px 20px', width: '100%', background: 'none', border: 'none',
              borderRight: `3px solid ${tab === t.id ? 'var(--mint)' : 'transparent'}`,
              color: tab === t.id ? 'var(--mint)' : 'var(--text-soft)',
              fontSize: 14.5, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer',
              fontFamily: 'var(--font-body)', textAlign: 'right',
              background: tab === t.id ? 'rgba(52,211,153,.07)' : 'transparent',
              transition: 'all .2s'
            }}>
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--line-soft)' }}>
          <button onClick={() => { logout(); navigate('/'); }} style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            padding: '10px 12px', border: '1px solid rgba(239,68,68,.4)',
            background: 'rgba(239,68,68,.07)', borderRadius: 'var(--r-sm)',
            color: '#fca5a5', fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'var(--font-body)'
          }}>🚪 تسجيل الخروج</button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, marginRight: 256, padding: 'clamp(20px,3vw,36px)' }}>

        {/* topbar */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
            <h1 style={{ fontSize: 'clamp(22px,3vw,28px)', fontWeight: 800 }}>لوحة تحكم الأدمن</h1>
            <span style={{
              padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
              background: 'rgba(239,68,68,.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,.4)'
            }}>⚙️ Admin Panel</span>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>
            Barakat Education Platform · إدارة كاملة للمنصة
          </p>
        </div>

        {/* ══ OVERVIEW TAB ══ */}
        {tab === 'overview' && stats && (
          <>
            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
              <StatCard icon="👥" num={stats.totalUsers}        label="إجمالي المستخدمين" />
              <StatCard icon="👨‍🎓" num={stats.totalStudents}  label="الطلاب" color="var(--mint)" />
              <StatCard icon="👩‍🏫" num={stats.totalTeachers}  label="المدرّسون" color="var(--violet)" />
              <StatCard icon="👨‍👧" num={stats.totalParents}   label="أولياء الأمور" color="var(--amber)" />
              <StatCard icon="📚" num={stats.totalCourses}      label="الكورسات" />
              <StatCard icon="📖" num={stats.totalLessons}      label="الدروس" />
              <StatCard icon="📝" num={stats.totalExams}        label="الاختبارات" />
              <StatCard icon="✅" num={stats.totalSubmissions}  label="التسليمات" />
              <StatCard icon="🎓" num={stats.totalEnrollments}  label="التسجيلات" />
              <StatCard icon="⭐" num={pct(stats.avgScore)}     label="متوسط الدرجات" color="var(--amber)" />
              <StatCard icon="🆕" num={stats.newUsersThisMonth} label="مستخدمون جدد هذا الشهر" color="var(--mint)" />
            </div>

            {/* Quick info cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18 }}>
              {/* Distribution */}
              <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>توزيع المستخدمين</h3>
                {[
                  { label: 'الطلاب', count: stats.totalStudents, color: 'var(--mint)', pct: stats.totalUsers ? Math.round(stats.totalStudents / stats.totalUsers * 100) : 0 },
                  { label: 'المدرّسون', count: stats.totalTeachers, color: 'var(--violet)', pct: stats.totalUsers ? Math.round(stats.totalTeachers / stats.totalUsers * 100) : 0 },
                  { label: 'أولياء الأمور', count: stats.totalParents, color: 'var(--amber)', pct: stats.totalUsers ? Math.round(stats.totalParents / stats.totalUsers * 100) : 0 },
                ].map(row => (
                  <div key={row.label} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                      <span style={{ color: 'var(--text-soft)' }}>{row.label}</span>
                      <span style={{ fontWeight: 700, color: row.color }}>{row.count} ({row.pct}%)</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--line)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${row.pct}%`, background: row.color, borderRadius: 3, transition: 'width .5s ease' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Platform health */}
              <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>صحة المنصة</h3>
                {[
                  { label: 'الكورسات النشطة', val: stats.totalCourses, icon: '📚', ok: stats.totalCourses > 0 },
                  { label: 'متوسط الدرجات', val: pct(stats.avgScore), icon: '⭐', ok: stats.avgScore >= 50 },
                  { label: 'اختبارات مكتملة', val: stats.totalSubmissions, icon: '✅', ok: stats.totalSubmissions >= 0 },
                  { label: 'إجمالي التسجيلات', val: stats.totalEnrollments, icon: '🎓', ok: stats.totalEnrollments >= 0 },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line-soft)' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span>{row.icon}</span>
                      <span style={{ fontSize: 14, color: 'var(--text-soft)' }}>{row.label}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: row.ok ? 'var(--mint)' : 'var(--danger)', fontFamily: 'var(--font-latin)' }}>{row.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══ USERS TAB ══ */}
        {tab === 'users' && (
          <>
            {/* filters */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <input
                style={{ flex: '1 1 220px', background: 'rgba(255,255,255,.05)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '10px 14px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 14, outline: 'none' }}
                placeholder="🔍 بحث بالاسم / الإيميل / username..."
                value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadUsers()}
              />
              {['', 'Student', 'Teacher', 'Parent', 'Admin'].map(r => (
                <button key={r} onClick={() => setRoleFilter(r)} style={{
                  padding: '9px 16px', borderRadius: 999, fontSize: 13.5, fontWeight: 600,
                  border: '1.5px solid', cursor: 'pointer', fontFamily: 'var(--font-body)',
                  borderColor: roleFilter === r ? 'var(--mint)' : 'var(--line)',
                  background: roleFilter === r ? 'var(--mint-soft)' : 'transparent',
                  color: roleFilter === r ? 'var(--mint-text)' : 'var(--text-soft)',
                  transition: 'all .2s'
                }}>
                  {r === '' ? 'الكل' : r === 'Student' ? '👨‍🎓 طلاب' : r === 'Teacher' ? '👩‍🏫 مدرّسون' : r === 'Parent' ? '👨‍👧 أولياء' : '⚙️ أدمن'}
                </button>
              ))}
              <button onClick={loadUsers} style={{ padding: '9px 18px', borderRadius: 999, background: 'linear-gradient(135deg,var(--mint),var(--mint-2))', color: 'var(--text-ink)', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                بحث
              </button>
            </div>

            <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line-soft)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>المستخدمون ({users.length})</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--line-soft)' }}>
                      {['#', 'الاسم', 'Username', 'الإيميل', 'الهاتف', 'الدور', 'المحافظة', 'السنة الدراسية', 'تاريخ التسجيل', 'الحالة', 'إجراءات'].map(h => (
                        <th key={h} style={{ padding: '11px 14px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={11} style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>لا توجد نتائج</td></tr>
                    ) : users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.02)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text-dim)', fontFamily: 'var(--font-latin)' }}>{u.id}</td>
                        <td style={{ padding: '11px 14px', minWidth: 140 }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{u.fullNameAr}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{u.fullNameEn}</div>
                        </td>
                        <td style={{ padding: '11px 14px', fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--mint-text)' }}>{u.username}</td>
                        <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text-soft)', direction: 'ltr', textAlign: 'left' }}>{u.email}</td>
                        <td style={{ padding: '11px 14px', fontSize: 13, fontFamily: 'var(--font-mono)', direction: 'ltr', textAlign: 'left' }}>{u.phoneNumber}</td>
                        <td style={{ padding: '11px 14px' }}><RoleBadge role={u.role} /></td>
                        <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text-soft)', whiteSpace: 'nowrap' }}>{u.governorate}</td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{u.academicYear || '—'}</td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{new Date(u.createdAt).toLocaleDateString('ar-EG')}</td>
                        <td style={{ padding: '11px 14px' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 700,
                            background: u.isActive ? 'rgba(52,211,153,.1)' : 'rgba(239,68,68,.1)',
                            color: u.isActive ? 'var(--mint-text)' : '#fca5a5',
                            border: `1px solid ${u.isActive ? 'rgba(52,211,153,.3)' : 'rgba(239,68,68,.3)'}`
                          }}>{u.isActive ? '✅ نشط' : '🚫 موقوف'}</span>
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                            <button onClick={() => handleToggleUser(u.id)} style={{
                              padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                              background: u.isActive ? 'rgba(239,68,68,.1)' : 'rgba(52,211,153,.1)',
                              color: u.isActive ? '#fca5a5' : 'var(--mint-text)',
                              border: `1px solid ${u.isActive ? 'rgba(239,68,68,.3)' : 'rgba(52,211,153,.3)'}`,
                              cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--font-body)'
                            }}>
                              {u.isActive ? '🚫 إيقاف' : '✅ تفعيل'}
                            </button>
                            {u.role !== 'Admin' && (
                              <button onClick={() => handleMakeAdmin(u.id, u.fullNameAr)} style={{
                                padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                background: 'rgba(239,68,68,.07)', color: '#fca5a5',
                                border: '1px solid rgba(239,68,68,.25)', cursor: 'pointer',
                                fontFamily: 'var(--font-body)', whiteSpace: 'nowrap'
                              }}>⚙️ أدمن</button>
                            )}
                            <button onClick={() => handleDeleteUser(u.id, u.fullNameAr)} style={{
                              padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                              background: 'rgba(239,68,68,.1)', color: '#fca5a5',
                              border: '1px solid rgba(239,68,68,.3)', cursor: 'pointer',
                              fontFamily: 'var(--font-body)'
                            }}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ══ COURSES TAB ══ */}
        {tab === 'courses' && (
          <>
            <div style={{ marginBottom: 18, fontWeight: 700, fontSize: 16 }}>الكورسات ({courses.length})</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
              {courses.length === 0 ? (
                <p style={{ color: 'var(--text-dim)', padding: 40 }}>لا توجد كورسات</p>
              ) : courses.map(c => (
                <div key={c.id} style={{
                  background: 'rgba(255,255,255,.025)', border: '1px solid var(--line-soft)',
                  borderRadius: 'var(--r-lg)', padding: 22,
                  borderColor: c.isPublished ? 'rgba(52,211,153,.2)' : 'rgba(239,68,68,.2)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dim)', fontFamily: 'var(--font-latin)' }}>#{c.id}</span>
                    <span style={{
                      padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 700,
                      background: c.isPublished ? 'rgba(52,211,153,.1)' : 'rgba(239,68,68,.1)',
                      color: c.isPublished ? 'var(--mint-text)' : '#fca5a5',
                      border: `1px solid ${c.isPublished ? 'rgba(52,211,153,.3)' : 'rgba(239,68,68,.3)'}`
                    }}>{c.isPublished ? '✅ منشور' : '🚫 مخفي'}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 6 }}>{c.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 12 }}>المدرّس: {c.teacherName}</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                    {[['📖', c.lessonCount, 'درس'], ['👥', c.enrollmentCount, 'طالب'], ['📝', c.examCount, 'اختبار']].map(([icon, num, label]) => (
                      <span key={label} style={{ padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,.05)', border: '1px solid var(--line-soft)', color: 'var(--text-soft)' }}>
                        {icon} {num} {label}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleToggleCourse(c.id)} style={{
                      flex: 1, padding: '8px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                      background: c.isPublished ? 'rgba(239,68,68,.1)' : 'rgba(52,211,153,.1)',
                      color: c.isPublished ? '#fca5a5' : 'var(--mint-text)',
                      border: `1px solid ${c.isPublished ? 'rgba(239,68,68,.3)' : 'rgba(52,211,153,.3)'}`,
                      cursor: 'pointer', fontFamily: 'var(--font-body)'
                    }}>{c.isPublished ? '🚫 إخفاء' : '✅ نشر'}</button>
                    <button onClick={() => handleDeleteCourse(c.id, c.title)} style={{
                      padding: '8px 12px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                      background: 'rgba(239,68,68,.1)', color: '#fca5a5',
                      border: '1px solid rgba(239,68,68,.3)', cursor: 'pointer', fontFamily: 'var(--font-body)'
                    }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══ SUBMISSIONS TAB ══ */}
        {tab === 'submissions' && (
          <>
            <div style={{ marginBottom: 18, fontWeight: 700, fontSize: 16 }}>نتائج الاختبارات ({submissions.length})</div>
            <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--line-soft)' }}>
                      {['#', 'الطالب', 'الاختبار', 'الدرجة', 'النسبة', 'الحالة', 'تاريخ التسليم'].map(h => (
                        <th key={h} style={{ padding: '11px 14px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>لا توجد نتائج بعد</td></tr>
                    ) : submissions.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.02)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text-dim)', fontFamily: 'var(--font-latin)' }}>{s.id}</td>
                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{s.studentName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-latin)' }}>ID: {s.studentId}</div>
                        </td>
                        <td style={{ padding: '11px 14px', fontSize: 13.5, fontWeight: 600 }}>{s.examTitle}</td>
                        <td style={{ padding: '11px 14px', fontWeight: 800, fontSize: 15, color: 'var(--mint)', fontFamily: 'var(--font-latin)' }}>
                          {s.score}<span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 400 }}>/{s.maxScore}</span>
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
                            <div style={{ flex: 1, height: 6, background: 'var(--line)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${s.percentage}%`, borderRadius: 3, background: s.percentage >= 50 ? 'var(--mint)' : '#ef4444', transition: 'width .5s' }} />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, minWidth: 38, color: s.percentage >= 50 ? 'var(--mint)' : '#fca5a5', fontFamily: 'var(--font-latin)' }}>
                              {pct(s.percentage)}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 700,
                            background: s.percentage >= 80 ? 'rgba(52,211,153,.1)' : s.percentage >= 50 ? 'rgba(251,191,36,.1)' : 'rgba(239,68,68,.1)',
                            color: s.percentage >= 80 ? 'var(--mint-text)' : s.percentage >= 50 ? '#fcd34d' : '#fca5a5',
                            border: `1px solid ${s.percentage >= 80 ? 'rgba(52,211,153,.3)' : s.percentage >= 50 ? 'rgba(251,191,36,.3)' : 'rgba(239,68,68,.3)'}`
                          }}>
                            {s.percentage >= 80 ? '🏆 ممتاز' : s.percentage >= 50 ? '👍 مقبول' : '❌ ضعيف'}
                          </span>
                        </td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                          {new Date(s.submittedAt).toLocaleDateString('ar-EG')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}