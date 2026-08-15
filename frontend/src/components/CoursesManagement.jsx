import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  adminGetCourses, adminDeleteCourse, adminToggleCourse,
  adminCreateCourse, adminUpdateCourse, adminGetTeachers
} from '../services/api';

/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */
const LEVELS = [
  { value: 'bac1',   label: 'أولى بكالوريا',  color: 'var(--mint-text)', icon: '📗' },
  { value: 'bac2',   label: 'تانية بكالوريا', color: 'var(--violet)', icon: '📘' },
  { value: 'review', label: 'مراجعة مكثفة',   color: 'var(--amber)', icon: '📙' },
];

const LEVEL_META = {
  bac1:   { color: 'var(--mint-text)', bg: 'var(--mint-soft)',  border: 'var(--mint-line)',   label: '📗 أولى بك.' },
  bac2:   { color: 'var(--violet)', bg: 'var(--violet-soft)', border: 'var(--violet-line)',  label: '📘 تانية بك.' },
  review: { color: 'var(--amber)', bg: 'var(--amber-soft)',  border: 'var(--amber-line)',   label: '📙 مراجعة' },
};

const EMPTY_FORM = {
  title: '', description: '', level: 'bac1',
  thumbnailUrl: '', teacherId: '', isPublished: true
};

/* ══════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════ */

/* ── Level badge ── */
function LevelBadge({ level }) {
  const m = LEVEL_META[level] || { color: 'var(--text-dim)', bg: 'rgba(255,255,255,.05)', border: 'var(--line)', label: level || '—' };
  return (
    <span style={{
      padding: '4px 11px', borderRadius: 999, fontSize: 12, fontWeight: 700,
      background: m.bg, color: m.color, border: `1px solid ${m.border}`,
      whiteSpace: 'nowrap', display: 'inline-block'
    }}>{m.label}</span>
  );
}

/* ── Publish badge ── */
function PublishBadge({ published }) {
  return (
    <span style={{
      padding: '4px 11px', borderRadius: 999, fontSize: 12, fontWeight: 700,
      background: published ? 'var(--mint-soft)' : 'rgba(239,68,68,.10)',
      color: published ? 'var(--mint-text)' : 'var(--danger)',
      border: `1px solid ${published ? 'var(--mint-line)' : 'var(--danger-line)'}`,
      display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: published ? 'var(--mint-text)' : 'var(--danger-solid)', display: 'inline-block' }} />
      {published ? 'منشور' : 'مخفي'}
    </span>
  );
}

/* ── Delete confirm dialog ── */
function DeleteDialog({ course, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(7px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--danger-line)',
        borderRadius: 22, padding: 36, maxWidth: 440, width: '100%',
        boxShadow: '0 40px 80px rgba(0,0,0,.65)', animation: 'scaleIn .2s ease'
      }}>
        <div style={{ fontSize: 52, textAlign: 'center', marginBottom: 14 }}>🗑️</div>
        <h3 style={{ textAlign: 'center', fontSize: 20, fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>حذف الكورس</h3>
        <p style={{ textAlign: 'center', color: 'var(--text-soft)', fontSize: 15, marginBottom: 8 }}>
          هل أنت متأكد من حذف الكورس
        </p>
        <p style={{ textAlign: 'center', fontWeight: 800, color: 'var(--danger)', fontSize: 17, marginBottom: 22 }}>
          "{course.title}"
        </p>
        <div style={{
          background: 'rgba(239,68,68,.07)', border: '1px solid var(--danger-line)',
          borderRadius: 12, padding: '12px 16px', marginBottom: 26, fontSize: 13.5,
          color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.6
        }}>
          ⚠️ سيتم حذف الكورس نهائياً مع جميع دروسه واختباراته وتسجيلات الطلاب. لا يمكن التراجع عن هذا الإجراء.
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '12px', borderRadius: 12,
            border: '1px solid var(--line)', background: 'transparent',
            color: 'var(--text-soft)', fontSize: 15, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-body)'
          }}>إلغاء</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '12px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg,#ef4444,#b91c1c)', color: '#fff',
            fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)',
            boxShadow: '0 8px 24px rgba(239,68,68,.35)'
          }}>نعم، احذف</button>
        </div>
      </div>
    </div>
  );
}

/* ── Course Form Modal (Add / Edit) ── */
function CourseModal({ mode, initial, teachers, onSave, onClose }) {
  const isEdit = mode === 'edit';
  const [form, setForm]     = useState(initial);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const ch = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.title.trim())   e.title     = 'عنوان الكورس مطلوب';
    if (!form.teacherId)      e.teacherId = 'يجب تحديد المعلم المسؤول';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave({
        title:        form.title.trim(),
        description:  form.description.trim() || null,
        level:        form.level,
        thumbnailUrl: form.thumbnailUrl.trim() || null,
        teacherId:    Number(form.teacherId),
        isPublished:  form.isPublished,
      });
    } finally { setSaving(false); }
  };

  const fieldStyle = (err) => ({
    width: '100%', boxSizing: 'border-box',
    background: 'var(--bg-field)',
    border: `1px solid ${err ? 'var(--danger)' : 'var(--line)'}`,
    borderRadius: 11, padding: '11px 14px', color: 'var(--text)',
    fontFamily: 'var(--font-body)', fontSize: 14.5, outline: 'none',
    transition: 'border-color .2s, box-shadow .2s'
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(7px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      overflowY: 'auto'
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--mint-line)',
        borderRadius: 22, padding: 32, maxWidth: 580, width: '100%',
        boxShadow: '0 40px 80px rgba(0,0,0,.65)', animation: 'scaleIn .22s ease',
        margin: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: 'var(--text)' }}>
              {isEdit ? '✏️ تعديل الكورس' : '➕ إضافة كورس جديد'}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>
              {isEdit ? 'عدّل بيانات الكورس وانقر حفظ' : 'أدخل بيانات الكورس الجديد'}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: 38, height: 38, borderRadius: 10, border: '1px solid var(--line)',
            background: 'var(--bg-field)', cursor: 'pointer', fontSize: 18,
            color: 'var(--text-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Title */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-soft)', display: 'block', marginBottom: 7 }}>
              عنوان الكورس *
            </label>
            <input
              type="text" value={form.title}
              onChange={e => ch('title', e.target.value)}
              placeholder="مثال: أولى بكالوريا — Python والذكاء الاصطناعي"
              style={fieldStyle(errors.title)}
              onFocus={e => { e.target.style.borderColor = 'var(--mint)'; e.target.style.boxShadow = '0 0 0 3px rgba(52,211,153,.12)'; }}
              onBlur={e  => { e.target.style.borderColor = errors.title ? 'var(--danger)' : 'var(--line)'; e.target.style.boxShadow = 'none'; }}
            />
            {errors.title && <p style={{ color: 'var(--danger)', fontSize: 12.5, marginTop: 5 }}>⚠ {errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-soft)', display: 'block', marginBottom: 7 }}>
              وصف الكورس <span style={{ fontWeight: 400, opacity: .6 }}>(اختياري)</span>
            </label>
            <textarea
              value={form.description}
              onChange={e => ch('description', e.target.value)}
              placeholder="وصف مختصر يظهر للطلاب في صفحة الكورس..."
              rows={3}
              style={{ ...fieldStyle(), resize: 'vertical', lineHeight: 1.6 }}
              onFocus={e => { e.target.style.borderColor = 'var(--mint)'; e.target.style.boxShadow = '0 0 0 3px rgba(52,211,153,.12)'; }}
              onBlur={e  => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Level + Teacher — 2 cols */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Level */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-soft)', display: 'block', marginBottom: 7 }}>
                المستوى الدراسي
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {LEVELS.map(lv => (
                  <button
                    type="button" key={lv.value}
                    onClick={() => ch('level', lv.value)}
                    style={{
                      padding: '9px 14px', borderRadius: 10, fontSize: 13.5, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'right',
                      display: 'flex', alignItems: 'center', gap: 8, transition: 'all .2s',
                      border: `1.5px solid ${form.level === lv.value ? LEVEL_META[lv.value]?.border : 'var(--line)'}`,
                      background: form.level === lv.value ? LEVEL_META[lv.value]?.bg : 'var(--bg-muted)',
                      color: form.level === lv.value ? LEVEL_META[lv.value]?.color : 'var(--text-soft)',
                    }}
                  >
                    <span>{lv.icon}</span> {lv.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Teacher + status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-soft)', display: 'block', marginBottom: 7 }}>
                  المعلم المسؤول *
                </label>
                <select
                  value={form.teacherId}
                  onChange={e => ch('teacherId', e.target.value)}
                  style={{ ...fieldStyle(errors.teacherId), color: form.teacherId ? 'var(--text)' : '#888' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--mint)'; e.target.style.boxShadow = '0 0 0 3px rgba(52,211,153,.12)'; }}
                  onBlur={e  => { e.target.style.borderColor = errors.teacherId ? 'var(--danger)' : 'var(--line)'; e.target.style.boxShadow = 'none'; }}
                >
                  <option value="">اختر المعلم المسؤول...</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id} style={{ color: 'var(--text)', background: 'var(--bg-1)' }}>
                      {t.fullNameAr} — {t.role === 'Teacher' ? '👩‍🏫 مدرّس' : t.role === 'Admin' ? '⚙️ أدمن' : t.role === 'Student' ? '👨‍🎓 طالب' : t.role}
                    </option>
                  ))}
                </select>
                {errors.teacherId && <p style={{ color: 'var(--danger)', fontSize: 12.5, marginTop: 5 }}>⚠ {errors.teacherId}</p>}
              </div>

              {/* Thumbnail URL */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-soft)', display: 'block', marginBottom: 7 }}>
                  رابط الصورة المصغّرة <span style={{ fontWeight: 400, opacity: .6 }}>(URL)</span>
                </label>
                <input
                  type="url" value={form.thumbnailUrl}
                  onChange={e => ch('thumbnailUrl', e.target.value)}
                  placeholder="https://..."
                  dir="ltr"
                  style={fieldStyle()}
                  onFocus={e => { e.target.style.borderColor = 'var(--mint)'; e.target.style.boxShadow = '0 0 0 3px rgba(52,211,153,.12)'; }}
                  onBlur={e  => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Published toggle */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--bg-muted)', border: '1px solid var(--line)',
                borderRadius: 12, padding: '12px 14px'
              }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>نشر الكورس</div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                    {form.isPublished ? 'مرئي للطلاب الآن' : 'مخفي (مسودة)'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => ch('isPublished', !form.isPublished)}
                  style={{
                    width: 52, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer',
                    background: form.isPublished ? 'var(--mint)' : 'rgba(255,255,255,.1)',
                    position: 'relative', transition: 'background .25s', flexShrink: 0
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 3,
                    right: form.isPublished ? 3 : undefined,
                    left: form.isPublished ? undefined : 3,
                    width: 22, height: 22, borderRadius: '50%',
                    background: '#fff', transition: 'all .25s',
                    boxShadow: '0 2px 5px rgba(0,0,0,.3)'
                  }} />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '13px', borderRadius: 12,
              border: '1px solid var(--line)', background: 'transparent',
              color: 'var(--text-soft)', fontSize: 15, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-body)'
            }}>إلغاء</button>
            <button type="submit" disabled={saving} style={{
              flex: 2, padding: '13px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg,var(--mint),var(--mint-2))',
              color: 'var(--text-ink)', fontSize: 15, fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)',
              boxShadow: '0 8px 24px var(--mint-glow)', opacity: saving ? .75 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'opacity .2s'
            }}>
              {saving
                ? <><span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(4,19,12,.3)', borderTopColor: 'var(--text-ink)', animation: 'spinSlow .7s linear infinite', display: 'inline-block' }} /> جارٍ الحفظ...</>
                : isEdit ? '💾 حفظ التعديلات' : '➕ إنشاء الكورس'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function CoursesManagement() {
  const [allCourses, setAllCourses]   = useState([]);
  const [teachers,   setTeachers]     = useState([]);
  const [filtered,   setFiltered]     = useState([]);
  const [loading,    setLoading]      = useState(true);
  const [search,     setSearch]       = useState('');
  const [levelFilter,setLevelFilter]  = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [sortCol,    setSortCol]      = useState('createdAt');
  const [sortAsc,    setSortAsc]      = useState(false);
  const [page,       setPage]         = useState(1);
  const PER_PAGE = 10;

  /* modals */
  const [modal,      setModal]        = useState(null);   // null | { mode:'add'|'edit', course? }
  const [deleteCourse, setDeleteCourse] = useState(null);

  /* ── load ── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, tRes] = await Promise.all([adminGetCourses(), adminGetTeachers()]);
      setAllCourses(cRes.data);
      setTeachers(tRes.data);
    } catch { toast.error('فشل تحميل البيانات'); }
    finally   { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── filter + search + sort ── */
  useEffect(() => {
    const q = search.trim().toLowerCase();
    let res = allCourses;

    if (levelFilter)   res = res.filter(c => c.level === levelFilter);
    if (teacherFilter) res = res.filter(c => String(c.teacherId) === teacherFilter);
    if (q)             res = res.filter(c =>
      c.title?.toLowerCase().includes(q) ||
      c.teacherName?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    );

    res = [...res].sort((a, b) => {
      let va = a[sortCol], vb = b[sortCol];
      if (typeof va === 'string') { va = va.toLowerCase(); vb = (vb||'').toLowerCase(); }
      if (va == null) va = 0; if (vb == null) vb = 0;
      if (va < vb) return sortAsc ? -1 :  1;
      if (va > vb) return sortAsc ?  1 : -1;
      return 0;
    });

    setFiltered(res);
    setPage(1);
  }, [allCourses, levelFilter, teacherFilter, search, sortCol, sortAsc]);

  /* pagination */
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /* sort */
  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(a => !a);
    else { setSortCol(col); setSortAsc(true); }
  };
  const SortIcon = ({ col }) => (
    <span style={{ fontSize: 10, marginRight: 4, opacity: sortCol === col ? 1 : .28 }}>
      {sortCol === col ? (sortAsc ? '▲' : '▼') : '⇅'}
    </span>
  );

  /* ── ACTIONS ── */
  const handleConfirmDelete = async () => {
    try {
      await adminDeleteCourse(deleteCourse.id);
      toast.success(`تم حذف كورس "${deleteCourse.title}"`);
      setAllCourses(prev => prev.filter(c => c.id !== deleteCourse.id));
    } catch (e) { toast.error(e.response?.data?.message || 'حدث خطأ'); }
    finally { setDeleteCourse(null); }
  };

  const handleToggle = async (course) => {
    try {
      const r = await adminToggleCourse(course.id);
      toast.success(r.data.message);
      setAllCourses(prev => prev.map(c => c.id === course.id ? { ...c, isPublished: !c.isPublished } : c));
    } catch { toast.error('حدث خطأ'); }
  };

  const handleSave = async (formData) => {
    try {
      if (modal.mode === 'add') {
        const res = await adminCreateCourse(formData);
        toast.success('تم إنشاء الكورس بنجاح ✅');
        // reload to get full data
        await load();
      } else {
        await adminUpdateCourse(modal.course.id, formData);
        toast.success('تم تحديث الكورس بنجاح ✅');
        await load();
      }
      setModal(null);
    } catch (e) {
      toast.error(e.response?.data?.message || 'حدث خطأ أثناء الحفظ');
      throw e; // keep modal open
    }
  };

  /* ── stats ── */
  const totalEnrolled = allCourses.reduce((s, c) => s + (c.enrollmentCount || 0), 0);
  const published     = allCourses.filter(c => c.isPublished).length;

  /* ══════════ RENDER ══════════ */
  return (
    <div>
      {/* ── PAGE HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: 'var(--text)' }}>إدارة الكورسات</h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-dim)' }}>
            <strong style={{ color: 'var(--mint-text)' }}>{allCourses.length}</strong> كورس ·{' '}
            <strong style={{ color: 'var(--mint-text)' }}>{published}</strong> منشور ·{' '}
            <strong style={{ color: 'var(--amber)' }}>{totalEnrolled}</strong> تسجيل إجمالي
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={load} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 16px', borderRadius: 10, border: '1px solid var(--line)',
            background: 'rgba(255,255,255,.04)', color: 'var(--text-soft)',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)'
          }}>🔄 تحديث</button>
          <button onClick={() => setModal({ mode: 'add' })} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg,var(--mint),var(--mint-2))',
            color: 'var(--text-ink)', fontSize: 14.5, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
            boxShadow: '0 6px 18px var(--mint-glow)', transition: 'filter .2s'
          }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            ➕ إضافة كورس جديد
          </button>
        </div>
      </div>

      {/* ── SEARCH + FILTERS ── */}
      <div style={{
        background: 'rgba(255,255,255,.02)', border: '1px solid var(--line-soft)',
        borderRadius: 16, padding: '16px 18px', marginBottom: 20,
        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <span style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 17, color: 'var(--text-dim)', pointerEvents: 'none' }}>🔍</span>
          <input
            type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث باسم الكورس، الوصف، أو المعلم..."
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,.04)', border: '1px solid var(--line)',
              borderRadius: 10, padding: '11px 42px 11px 14px',
              color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 14, outline: 'none'
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--mint)'; e.target.style.boxShadow = '0 0 0 3px rgba(52,211,153,.12)'; }}
            onBlur={e =>  { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none'; }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: '50%',
              width: 22, height: 22, cursor: 'pointer', color: 'var(--text-dim)', fontSize: 13
            }}>✕</button>
          )}
        </div>

        {/* Level filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[{ value: '', label: 'كل المستويات' }, ...LEVELS].map(lv => (
            <button
              key={lv.value}
              onClick={() => setLevelFilter(lv.value)}
              style={{
                padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all .2s',
                border: `1.5px solid ${levelFilter === lv.value ? (LEVEL_META[lv.value]?.border || 'var(--mint-line)') : 'transparent'}`,
                background: levelFilter === lv.value ? (LEVEL_META[lv.value]?.bg || 'var(--mint-soft)') : 'rgba(255,255,255,.04)',
                color: levelFilter === lv.value ? (LEVEL_META[lv.value]?.color || 'var(--mint-text)') : 'var(--text-soft)',
              }}
            >{lv.icon ? `${lv.icon} ${lv.label}` : lv.label}</button>
          ))}
        </div>

        {/* Teacher filter */}
        {teachers.length > 0 && (
          <select
            value={teacherFilter}
            onChange={e => setTeacherFilter(e.target.value)}
            style={{
              background: 'rgba(255,255,255,.05)', border: '1px solid var(--line)',
              borderRadius: 10, padding: '10px 14px', color: teacherFilter ? 'var(--text)' : '#888',
              fontFamily: 'var(--font-body)', fontSize: 13.5, outline: 'none', cursor: 'pointer'
            }}
          >
            <option value="">كل المعلمين</option>
            {teachers.map(t => (
              <option key={t.id} value={String(t.id)} style={{ color: '#000', background: '#fff' }}>
                {t.fullNameAr}
              </option>
            ))}
          </select>
        )}

        {(search || levelFilter || teacherFilter) && (
          <button onClick={() => { setSearch(''); setLevelFilter(''); setTeacherFilter(''); }} style={{
            padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
            background: 'none', border: '1px solid var(--line)', color: 'var(--text-dim)',
            cursor: 'pointer', fontFamily: 'var(--font-body)'
          }}>↩ إلغاء الفلتر</button>
        )}
      </div>

      {/* results meta */}
      <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 12 }}>
        {filtered.length === 0
          ? 'لا توجد نتائج'
          : `عرض ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, filtered.length)} من ${filtered.length} كورس`}
        {(search || levelFilter || teacherFilter) && (
          <span style={{ color: 'var(--mint)', marginRight: 6 }}>(مُصفَّى)</span>
        )}
      </div>

      {/* ── TABLE ── */}
      <div style={{
        background: 'rgba(255,255,255,.02)', border: '1px solid var(--line-soft)',
        borderRadius: 18, overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', border: '3px solid var(--mint-soft)', borderTopColor: 'var(--mint)', animation: 'spinSlow .8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-dim)', fontSize: 15 }}>جارٍ تحميل الكورسات...</p>
          </div>

        ) : filtered.length === 0 ? (
          /* ── EMPTY STATE ── */
          <div style={{ padding: '72px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 60, marginBottom: 18 }}>📚</div>
            <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 10 }}>
              {search || levelFilter || teacherFilter ? 'لا توجد نتائج مطابقة' : 'لا توجد كورسات حالياً'}
            </h3>
            <p style={{ fontSize: 14.5, color: 'var(--text-dim)', maxWidth: 380, margin: '0 auto 24px', lineHeight: 1.6 }}>
              {search
                ? `لم يُعثر على كورسات تطابق "${search}"`
                : 'ابدأ بإضافة أول كورس على المنصة وسيظهر هنا فوراً.'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {(search || levelFilter || teacherFilter) && (
                <button onClick={() => { setSearch(''); setLevelFilter(''); setTeacherFilter(''); }} style={{
                  padding: '11px 22px', borderRadius: 999,
                  background: 'rgba(255,255,255,.05)', border: '1px solid var(--line)',
                  color: 'var(--text-soft)', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'var(--font-body)'
                }}>↩ عرض الكل</button>
              )}
              <button onClick={() => setModal({ mode: 'add' })} style={{
                padding: '11px 24px', borderRadius: 999,
                background: 'linear-gradient(135deg,var(--mint),var(--mint-2))',
                border: 'none', color: 'var(--text-ink)', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', fontFamily: 'var(--font-body)',
                boxShadow: '0 6px 16px var(--mint-glow)'
              }}>➕ إضافة كورس جديد</button>
            </div>
          </div>

        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,.03)', borderBottom: '1px solid var(--line-soft)' }}>
                  {[
                    { label: '#',                col: 'id',              w: 50  },
                    { label: 'الكورس',           col: 'title',           w: 220 },
                    { label: 'المعلم',           col: 'teacherName',     w: 150 },
                    { label: 'المستوى',          col: 'level',           w: 110 },
                    { label: 'الطلاب المسجّلون', col: 'enrollmentCount', w: 110 },
                    { label: 'الدروس',           col: 'lessonCount',     w: 80  },
                    { label: 'الاختبارات',       col: 'examCount',       w: 90  },
                    { label: 'تاريخ الإنشاء',    col: 'createdAt',       w: 110 },
                    { label: 'الحالة',           col: 'isPublished',     w: 90  },
                    { label: 'إجراءات',          col: null,              w: 130 },
                  ].map(h => (
                    <th
                      key={h.label}
                      onClick={h.col ? () => handleSort(h.col) : undefined}
                      style={{
                        padding: '12px 14px', textAlign: 'right',
                        fontSize: 12.5, fontWeight: 700, minWidth: h.w,
                        whiteSpace: 'nowrap', userSelect: 'none',
                        cursor: h.col ? 'pointer' : 'default',
                        color: h.col && sortCol === h.col ? 'var(--mint-text)' : 'var(--text-dim)',
                        transition: 'color .15s'
                      }}
                    >
                      {h.col && <SortIcon col={h.col} />}{h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((c, idx) => (
                  <tr
                    key={c.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,.035)', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(52,211,153,.025)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* # */}
                    <td style={{ padding: '14px', fontSize: 12.5, color: 'var(--text-dim)', fontFamily: 'var(--font-latin)' }}>
                      {(page - 1) * PER_PAGE + idx + 1}
                    </td>

                    {/* الكورس */}
                    <td style={{ padding: '14px', minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* thumbnail or placeholder */}
                        <div style={{
                          width: 44, height: 44, borderRadius: 10, flexShrink: 0, overflow: 'hidden',
                          background: `linear-gradient(135deg, ${LEVEL_META[c.level]?.color || 'var(--mint)'}, rgba(0,0,0,.5))`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 20, border: '1px solid var(--line-soft)'
                        }}>
                          {c.thumbnailUrl
                            ? <img src={c.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                            : (LEVEL_META[c.level]?.label?.charAt(0) || '📚')}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.3, marginBottom: 3 }}>{c.title}</div>
                          {c.description && (
                            <div style={{
                              fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.4,
                              display: '-webkit-box', WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: 220
                            }}>{c.description}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* المعلم */}
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg,#c4b5fd,rgba(0,0,0,.5))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 800, color: '#fff'
                        }}>{c.teacherName?.charAt(0) || '?'}</div>
                        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{c.teacherName || '—'}</span>
                      </div>
                    </td>

                    {/* المستوى */}
                    <td style={{ padding: '14px' }}><LevelBadge level={c.level} /></td>

                    {/* الطلاب */}
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14 }}>👥</span>
                        <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--mint)', fontFamily: 'var(--font-latin)' }}>
                          {c.enrollmentCount || 0}
                        </span>
                      </div>
                    </td>

                    {/* الدروس */}
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-soft)', fontFamily: 'var(--font-latin)' }}>
                        {c.lessonCount || 0}
                      </span>
                    </td>

                    {/* الاختبارات */}
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-soft)', fontFamily: 'var(--font-latin)' }}>
                        {c.examCount || 0}
                      </span>
                    </td>

                    {/* تاريخ الإنشاء */}
                    <td style={{ padding: '14px', fontSize: 12.5, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                      {new Date(c.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>

                    {/* الحالة */}
                    <td style={{ padding: '14px' }}><PublishBadge published={c.isPublished} /></td>

                    {/* إجراءات */}
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {/* تعديل */}
                        <button
                          onClick={() => setModal({ mode: 'edit', course: c })}
                          title="تعديل"
                          style={{
                            width: 34, height: 34, borderRadius: 9, fontSize: 15,
                            border: '1px solid rgba(52,211,153,.25)', background: 'rgba(52,211,153,.08)',
                            color: 'var(--mint-text)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all .2s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(52,211,153,.2)'; e.currentTarget.style.borderColor = 'var(--mint)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(52,211,153,.08)'; e.currentTarget.style.borderColor = 'rgba(52,211,153,.25)'; }}
                        >✏️</button>

                        {/* نشر/إخفاء */}
                        <button
                          onClick={() => handleToggle(c)}
                          title={c.isPublished ? 'إخفاء' : 'نشر'}
                          style={{
                            width: 34, height: 34, borderRadius: 9, fontSize: 15,
                            border: `1px solid ${c.isPublished ? 'rgba(251,191,36,.28)' : 'rgba(52,211,153,.28)'}`,
                            background: c.isPublished ? 'rgba(251,191,36,.08)' : 'rgba(52,211,153,.08)',
                            color: c.isPublished ? '#fcd34d' : 'var(--mint-text)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all .2s'
                          }}
                        >{c.isPublished ? '🚫' : '✅'}</button>

                        {/* حذف */}
                        <button
                          onClick={() => setDeleteCourse(c)}
                          title="حذف"
                          style={{
                            width: 34, height: 34, borderRadius: 9, fontSize: 15,
                            border: '1px solid rgba(239,68,68,.25)', background: 'rgba(239,68,68,.07)',
                            color: '#fca5a5', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all .2s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,.18)'; e.currentTarget.style.borderColor = '#ef4444'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,.07)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,.25)'; }}
                        >🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 22 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid var(--line)', background: 'rgba(255,255,255,.03)', color: page === 1 ? 'var(--text-dim)' : 'var(--text-soft)', cursor: page === 1 ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, opacity: page === 1 ? .5 : 1 }}>
            ← السابق
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push('…'); acc.push(p); return acc; }, [])
            .map((p, i) => p === '…'
              ? <span key={`e${i}`} style={{ color: 'var(--text-dim)', padding: '0 4px' }}>…</span>
              : <button key={p} onClick={() => setPage(p)} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid', borderColor: page === p ? 'var(--mint)' : 'var(--line)', background: page === p ? 'var(--mint-soft)' : 'rgba(255,255,255,.03)', color: page === p ? 'var(--mint-text)' : 'var(--text-soft)', cursor: 'pointer', fontFamily: 'var(--font-latin)', fontSize: 13.5, fontWeight: 700 }}>{p}</button>
            )}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid var(--line)', background: 'rgba(255,255,255,.03)', color: page === totalPages ? 'var(--text-dim)' : 'var(--text-soft)', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, opacity: page === totalPages ? .5 : 1 }}>
            التالي →
          </button>
        </div>
      )}

      {/* ── MODALS ── */}
      {deleteCourse && (
        <DeleteDialog
          course={deleteCourse}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteCourse(null)}
        />
      )}

      {modal && (
        <CourseModal
          mode={modal.mode}
          teachers={teachers}
          initial={
            modal.mode === 'edit' && modal.course
              ? {
                  title:        modal.course.title        || '',
                  description:  modal.course.description  || '',
                  level:        modal.course.level        || 'bac1',
                  thumbnailUrl: modal.course.thumbnailUrl || '',
                  teacherId:    String(modal.course.teacherId || ''),
                  isPublished:  modal.course.isPublished  ?? true,
                }
              : { ...EMPTY_FORM }
          }
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
