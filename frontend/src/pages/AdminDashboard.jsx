import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  adminGetStats,
  adminGetCourses, adminToggleCourse, adminDeleteCourse,
  adminGetSubmissions
} from '../services/api';
import UsersManagement from '../components/UsersManagement';
import CoursesManagement from '../components/CoursesManagement';

/* ── tiny StatCard ── */
function StatCard({ icon, num, label, color = 'var(--mint)' }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--line-soft)',
      borderRadius: 'var(--r-lg)', padding: '22px', display: 'flex',
      alignItems: 'center', gap: '16px'
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14, fontSize: 24, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-field)', border: '1px solid var(--line-soft)'
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
    Admin:   { bg: 'var(--danger-soft)', color: 'var(--danger)',  border: 'var(--danger-line)',   label: '⚙️ أدمن' },
    Teacher: { bg: 'var(--violet-soft)', color: 'var(--violet)', border: 'var(--violet-line)', label: '👩‍🏫 مدرّس' },
    Student: { bg: 'var(--mint-soft)',  color: 'var(--mint-text)', border: 'var(--mint-line)',  label: '👨‍🎓 طالب' },
    Parent:  { bg: 'var(--amber-soft)',  color: 'var(--amber)', border: 'var(--amber-line)',  label: '👨‍👧 ولي أمر' },
  };
  const s = map[role] || { bg: 'var(--bg-field)', color: 'var(--text-dim)', border: 'var(--line)', label: role };
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
    <div style={{ display: 'flex', minHeight: '100vh', paddingTop: 'var(--nav-h)', background: 'var(--bg-0)' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 256, background: 'var(--bg-1)', backdropFilter: 'blur(12px)',
        borderLeft: '1px solid var(--line-soft)',
        position: 'fixed', top: 'var(--nav-h)', bottom: 0, right: 0,
        display: 'flex', flexDirection: 'column', zIndex: 40, overflowY: 'auto'
      }}>
        {/* header */}
        <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid var(--line-soft)' }}>
          <div style={{
            width: 50, height: 50, borderRadius: '50%', marginBottom: 10,
            background: 'linear-gradient(135deg,var(--danger),#b91c1c)',
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
              background: tab === t.id ? 'var(--mint-soft)' : 'transparent',
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
            padding: '10px 12px', border: '1px solid var(--danger-line)',
            background: 'var(--danger-soft)', borderRadius: 'var(--r-sm)',
            color: 'var(--danger)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'var(--font-body)'
          }}>🚪 تسجيل الخروج</button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, minWidth: 0, marginRight: 256, padding: 'clamp(20px,3vw,36px)' }}>

        {/* topbar */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
            <h1 style={{ fontSize: 'clamp(22px,3vw,28px)', fontWeight: 800, color: 'var(--text)' }}>لوحة تحكم الأدمن</h1>
            <span style={{
              padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
              background: 'var(--danger-soft)', color: 'var(--danger)', border: '1px solid var(--danger-line)'
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
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>توزيع المستخدمين</h3>
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
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>صحة المنصة</h3>
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
          <UsersManagement />
        )}

        {/* ══ COURSES TAB ══ */}
        {tab === 'courses' && (
          <CoursesManagement />
        )}

        {/* ══ SUBMISSIONS TAB ══ */}
        {tab === 'submissions' && (
          <>
            <div style={{ marginBottom: 18, fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>نتائج الاختبارات ({submissions.length})</div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
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
                              <div style={{ height: '100%', width: `${s.percentage}%`, borderRadius: 3, background: s.percentage >= 50 ? 'var(--mint)' : 'var(--danger-solid)', transition: 'width .5s' }} />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, minWidth: 38, color: s.percentage >= 50 ? 'var(--mint)' : 'var(--danger)', fontFamily: 'var(--font-latin)' }}>
                              {pct(s.percentage)}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 700,
                            background: s.percentage >= 80 ? 'var(--mint-soft)' : s.percentage >= 50 ? 'var(--amber-soft)' : 'var(--danger-soft)',
                            color: s.percentage >= 80 ? 'var(--mint-text)' : s.percentage >= 50 ? 'var(--amber)' : 'var(--danger)',
                            border: `1px solid ${s.percentage >= 80 ? 'var(--mint-line)' : s.percentage >= 50 ? 'var(--amber-line)' : 'var(--danger-line)'}`
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