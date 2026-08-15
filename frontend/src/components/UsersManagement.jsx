import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  adminGetUsers, adminToggleUser, adminDeleteUser, adminMakeAdmin
} from '../services/api';

/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */
const ROLE_FILTERS = [
  { key: '',        label: 'الكل',        icon: '👥', color: 'var(--mint)' },
  { key: 'Student', label: 'طلاب',        icon: '👨‍🎓', color: 'var(--mint-text)' },
  { key: 'Teacher', label: 'مدرّسون',     icon: '👩‍🏫', color: 'var(--violet)' },
  { key: 'Parent',  label: 'أولياء أمور', icon: '👨‍👧', color: 'var(--amber)' },
  { key: 'Admin',   label: 'أدمن',        icon: '⚙️',  color: 'var(--danger)' },
];

const ROLE_META = {
  Admin:   { bg: 'var(--danger-soft)',   color: 'var(--danger)',  border: 'var(--danger-line)',   label: '⚙️ أدمن' },
  Teacher: { bg: 'var(--violet-soft)', color: 'var(--violet)',  border: 'var(--violet-line)', label: '👩‍🏫 مدرّس' },
  Student: { bg: 'var(--mint-soft)',  color: 'var(--mint-text)',  border: 'var(--mint-line)',  label: '👨‍🎓 طالب' },
  Parent:  { bg: 'var(--amber-soft)',  color: 'var(--amber)',  border: 'var(--amber-line)',  label: '👨‍👧 ولي أمر' },
};

const GOVERNORATES_EG = [
  'القاهرة','الإسكندرية','الجيزة','الشرقية','الدقهلية','البحيرة','المنوفية','الغربية',
  'القليوبية','كفر الشيخ','الفيوم','بني سويف','المنيا','أسيوط','سوهاج','قنا',
  'الأقصر','أسوان','البحر الأحمر','الوادي الجديد','مطروح','شمال سيناء','جنوب سيناء',
  'السويس','الإسماعيلية','بورسعيد','دمياط',
];

const YEARS_EG = ['أولى ثانوي','ثانية ثانوي','أولى بكالوريا','تانية بكالوريا','خارج المدرسة'];

/* ══════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════ */

function RoleBadge({ role }) {
  const m = ROLE_META[role] || { bg: 'var(--bg-card)', color: 'var(--text-dim)', border: 'var(--line)', label: role };
  return (
    <span style={{
      padding: '4px 11px', borderRadius: 999, fontSize: 12, fontWeight: 700,
      background: m.bg, color: m.color, border: `1px solid ${m.border}`,
      whiteSpace: 'nowrap', display: 'inline-block'
    }}>{m.label}</span>
  );
}

function StatusBadge({ active }) {
  return (
    <span style={{
      padding: '4px 11px', borderRadius: 999, fontSize: 12, fontWeight: 700,
      background: active ? 'var(--mint-soft)' : 'var(--danger-soft)',
      color: active ? 'var(--mint-text)' : 'var(--danger)',
      border: `1px solid ${active ? 'var(--mint-line)' : 'var(--danger-line)'}`,
      whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 5
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? 'var(--mint)' : 'var(--danger)', display: 'inline-block' }} />
      {active ? 'نشط' : 'موقوف'}
    </span>
  );
}

/* ── Delete Confirm Dialog ── */
function ConfirmDialog({ user, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,.72)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--danger-line)',
        borderRadius: 22, padding: 36, maxWidth: 440, width: '100%',
        boxShadow: '0 40px 80px rgba(0,0,0,.65)', animation: 'scaleIn .2s ease'
      }}>
        <div style={{ fontSize: 52, textAlign: 'center', marginBottom: 14 }}>🗑️</div>
        <h3 style={{ textAlign: 'center', fontSize: 20, fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>حذف المستخدم</h3>
        <p style={{ textAlign: 'center', color: 'var(--text-soft)', fontSize: 15, marginBottom: 8 }}>
          هل أنت متأكد من حذف حساب
        </p>
        <p style={{ textAlign: 'center', fontWeight: 800, color: 'var(--danger)', fontSize: 16, marginBottom: 24 }}>
          {user.fullNameAr} ({user.username})
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '12px', borderRadius: 12, border: '1px solid var(--line)',
            background: 'transparent', color: 'var(--text-soft)', fontSize: 15, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all .2s'
          }}>إلغاء</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '12px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg,var(--danger),#b91c1c)', color: '#fff',
            fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)',
            boxShadow: '0 8px 24px var(--danger-soft)', transition: 'filter .2s'
          }}>نعم، احذف</button>
        </div>
      </div>
    </div>
  );
}

/* ── Edit User Modal ── */
function EditModal({ user, onSave, onClose }) {
  const [form, setForm] = useState({
    role:         user.role,
    isActive:     user.isActive,
    governorate:  user.governorate || '',
    academicYear: user.academicYear || '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const change = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }));
  };

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(user.id, form); }
    finally { setSaving(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,.72)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--mint-line)',
        borderRadius: 22, padding: 32, maxWidth: 540, width: '100%',
        boxShadow: '0 40px 80px rgba(0,0,0,.65)', animation: 'scaleIn .22s ease',
        margin: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: 'var(--text)' }}>
              ✏️ تعديل بيانات المستخدم
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>{user.fullNameAr} · {user.username}</p>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 10, border: '1px solid var(--line)',
            background: 'rgba(255,255,255,.05)', cursor: 'pointer', fontSize: 18,
            color: 'var(--text-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>✕</button>
        </div>

        <div style={{
          background: 'var(--bg-field)', border: '1px solid var(--line-soft)',
          borderRadius: 14, padding: '14px 18px', marginBottom: 22,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px'
        }}>
          {[
            ['📧 الإيميل', user.email],
            ['📱 الهاتف',  user.phoneNumber],
            ['🆔 المعرّف', `#${user.id}`],
            ['📅 تاريخ التسجيل', new Date(user.createdAt).toLocaleDateString('ar-EG')],
          ].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 3 }}>{l}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-soft)', display: 'block', marginBottom: 8, fontWeight: 600 }}>
              الدور / الصلاحية
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {['Student','Teacher','Parent','Admin'].map(r => (
                <button key={r} onClick={() => change('role', r)} style={{
                  padding: '9px 6px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all .2s',
                  border: `1.5px solid ${form.role === r ? (ROLE_META[r]?.border || 'var(--mint-line)') : 'var(--line)'}`,
                  background: form.role === r ? (ROLE_META[r]?.bg || 'var(--mint-soft)') : 'var(--bg-field)',
                  color: form.role === r ? (ROLE_META[r]?.color || 'var(--mint-text)') : 'var(--text-soft)',
                }}>
                  {ROLE_META[r]?.label || r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, color: 'var(--text-soft)', display: 'block', marginBottom: 8, fontWeight: 600 }}>
              المحافظة
            </label>
            <select
              value={form.governorate}
              onChange={e => change('governorate', e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box', background: 'var(--bg-field)',
                border: `1px solid ${errors.governorate ? 'var(--danger)' : 'var(--line)'}`,
                borderRadius: 11, padding: '11px 14px',
                color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 14.5, outline: 'none',
                transition: 'all .2s'
              }}
            >
              <option value="" disabled style={{ color: 'var(--text-soft)' }}>محافظات مصر...</option>
              {GOVERNORATES_EG.map(g => <option key={g} value={g} style={{ color: 'var(--text)', background: 'var(--bg-1)' }}>{g}</option>)}
            </select>
          </div>

          {(form.role === 'Student') && (
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-soft)', display: 'block', marginBottom: 8, fontWeight: 600 }}>
                السنة الدراسية
              </label>
              <select
                value={form.academicYear}
                onChange={e => change('academicYear', e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box', background: 'var(--bg-field)',
                  border: `1px solid ${errors.academicYear ? 'var(--danger)' : 'var(--line)'}`,
                  borderRadius: 11, padding: '11px 14px',
                  color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 14.5, outline: 'none',
                  transition: 'all .2s'
                }}
              >
                <option value="" disabled style={{ color: 'var(--text-soft)' }}>السنة الدراسية...</option>
                {YEARS_EG.map(y => (
                  <option key={y} value={y} style={{ color: 'var(--text)', background: 'var(--bg-1)' }}>{y}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--bg-field)', border: '1px solid var(--line)',
            borderRadius: 12, padding: '12px 16px'
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>حالة الحساب</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 3 }}>
                {form.isActive ? 'الحساب نشط ويمكن المستخدم تسجيل الدخول' : 'الحساب موقوف مؤقتاً'}
              </div>
            </div>
            <button
              onClick={() => change('isActive', !form.isActive)}
              style={{
                width: 52, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer',
                background: form.isActive ? 'var(--mint)' : 'var(--line)',
                position: 'relative', transition: 'background .25s', flexShrink: 0
              }}
            >
              <span style={{
                position: 'absolute', top: 3,
                right: form.isActive ? 3 : undefined,
                left: form.isActive ? undefined : 3,
                width: 22, height: 22, borderRadius: '50%',
                background: '#fff', transition: 'all .25s',
                boxShadow: '0 2px 6px rgba(0,0,0,.3)'
              }} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 26 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: 13, borderRadius: 12, border: '1px solid var(--line)',
            background: 'transparent', color: 'var(--text-soft)', fontSize: 15, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-body)'
          }}>إلغاء</button>
          <button onClick={handleSave} disabled={saving} style={{
            flex: 2, padding: 13, borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg,var(--mint),var(--mint-2))', color: 'var(--text-ink)',
            fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)',
            boxShadow: '0 8px 24px var(--mint-glow)', opacity: saving ? .7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            {saving ? <><span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(4,19,12,.3)', borderTopColor: 'var(--text-ink)', animation: 'spinSlow .7s linear infinite', display: 'inline-block' }} /> جارٍ الحفظ...</> : '💾 حفظ التغييرات'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function UsersManagement() {
  const [allUsers, setAllUsers]     = useState([]);      
  const [filtered, setFiltered]     = useState([]);      
  const [loading, setLoading]       = useState(true);
  const [roleTab, setRoleTab]       = useState('');      
  const [search, setSearch]         = useState('');
  const [sortCol, setSortCol]       = useState('id');
  const [sortAsc, setSortAsc]       = useState(false);
  const [page, setPage]             = useState(1);
  const PER_PAGE = 12;

  const [editUser,   setEditUser]   = useState(null);   
  const [deleteUser, setDeleteUser] = useState(null);   

  const searchRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminGetUsers();
      setAllUsers(r.data);
    } catch {
      toast.error('فشل تحميل بيانات المستخدمين');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    let result = allUsers;

    if (roleTab)
      result = result.filter(u => u.role === roleTab);

    if (q)
      result = result.filter(u =>
        u.fullNameAr?.toLowerCase().includes(q) ||
        u.fullNameEn?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.phoneNumber?.includes(q)
      );

    result = [...result].sort((a, b) => {
      let va = a[sortCol], vb = b[sortCol];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });

    setFiltered(result);
    setPage(1);
  }, [allUsers, roleTab, search, sortCol, sortAsc]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(a => !a);
    else { setSortCol(col); setSortAsc(true); }
  };
  const SortIcon = ({ col }) => (
    <span style={{ fontSize: 10, marginRight: 4, opacity: sortCol === col ? 1 : .3 }}>
      {sortCol === col ? (sortAsc ? '▲' : '▼') : '⇅'}
    </span>
  );

  const handleConfirmDelete = async () => {
    try {
      await adminDeleteUser(deleteUser.id);
      toast.success(`تم حذف "${deleteUser.fullNameAr}" بنجاح`);
      setAllUsers(prev => prev.filter(u => u.id !== deleteUser.id));
    } catch (e) {
      toast.error(e.response?.data?.message || 'حدث خطأ أثناء الحذف');
    } finally {
      setDeleteUser(null);
    }
  };

  const handleToggle = async (user) => {
    try {
      const r = await adminToggleUser(user.id);
      toast.success(r.data.message);
      setAllUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
    } catch { toast.error('حدث خطأ'); }
  };

  const handleSaveEdit = async (id, form) => {
    try {
      const original = allUsers.find(u => u.id === id);
      if (original.isActive !== form.isActive) await adminToggleUser(id);
      if (original.role !== form.role && form.role === 'Admin') await adminMakeAdmin(id);

      setAllUsers(prev => prev.map(u => u.id === id ? { ...u, ...form } : u));
      toast.success('تم حفظ التغييرات بنجاح ✅');
      setEditUser(null);
    } catch (e) {
      toast.error(e.response?.data?.message || 'حدث خطأ أثناء الحفظ');
    }
  };

  const counts = ROLE_FILTERS.reduce((acc, t) => {
    acc[t.key] = t.key === '' ? allUsers.length : allUsers.filter(u => u.role === t.key).length;
    return acc;
  }, {});

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: 'var(--text)' }}>إدارة المستخدمين</h2>
            <p style={{ fontSize: 13.5, color: 'var(--text-dim)' }}>
              إجمالي المستخدمين: <strong style={{ color: 'var(--mint-text)' }}>{allUsers.length}</strong> مستخدم مسجّل
            </p>
          </div>
          <button onClick={load} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 10, border: '1px solid var(--line)',
            background: 'var(--bg-field)', color: 'var(--text-soft)',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
            transition: 'all .2s'
          }}>🔄 تحديث</button>
        </div>
      </div>

      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18,
        background: 'var(--bg-card)', border: '1px solid var(--line-soft)',
        borderRadius: 14, padding: '10px 14px'
      }}>
        {ROLE_FILTERS.map(t => (
          <button
            key={t.key}
            onClick={() => setRoleTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 999, fontSize: 13.5, fontWeight: 700,
              border: '1.5px solid', cursor: 'pointer', fontFamily: 'var(--font-body)',
              transition: 'all .2s',
              borderColor: roleTab === t.key ? t.color : 'transparent',
              background:  roleTab === t.key ? `${t.color}18` : 'transparent',
              color: roleTab === t.key ? t.color : 'var(--text-soft)',
            }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
            <span style={{
              fontSize: 11, fontWeight: 800, minWidth: 20, textAlign: 'center',
              background: roleTab === t.key ? `${t.color}30` : 'var(--bg-field)',
              color: roleTab === t.key ? t.color : 'var(--text-dim)',
              padding: '1px 7px', borderRadius: 999
            }}>{counts[t.key]}</span>
          </button>
        ))}
      </div>

      <div style={{ position: 'relative', marginBottom: 18 }}>
        <span style={{
          position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
          fontSize: 18, color: 'var(--text-dim)', pointerEvents: 'none'
        }}>🔍</span>
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="بحث بالاسم، الإيميل، Username، أو رقم الهاتف..."
          style={{
            width: '100%', background: 'var(--bg-field)',
            border: '1px solid var(--line)', borderRadius: 12,
            padding: '13px 48px 13px 46px', color: 'var(--text)',
            fontFamily: 'var(--font-body)', fontSize: 14.5, outline: 'none',
            transition: 'border-color .2s, box-shadow .2s',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--mint)'; e.target.style.boxShadow = '0 0 0 3px rgba(52,211,153,.15)'; }}
          onBlur={e =>  { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none'; }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              background: 'var(--bg-card)', border: 'none', borderRadius: '50%',
              width: 24, height: 24, cursor: 'pointer', color: 'var(--text-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
            }}
          >✕</button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>
          {filtered.length === 0 ? 'لا توجد نتائج' : `عرض ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, filtered.length)} من ${filtered.length} نتيجة`}
          {(search || roleTab) && <span style={{ color: 'var(--mint)', marginRight: 6 }}>(مُصفَّى)</span>}
        </span>
        {(search || roleTab) && (
          <button onClick={() => { setSearch(''); setRoleTab(''); }} style={{
            fontSize: 12.5, color: 'var(--mint-text)', background: 'none', border: 'none',
            cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--font-body)'
          }}>↩ إلغاء الفلتر</button>
        )}
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--line-soft)',
        borderRadius: 18, overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--mint-soft)', borderTopColor: 'var(--mint)', animation: 'spinSlow .8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-dim)', fontSize: 15 }}>جارٍ تحميل البيانات...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>لا توجد نتائج</h3>
            <p style={{ fontSize: 14, color: 'var(--text-dim)', maxWidth: 340, margin: '0 auto 20px' }}>
              {search ? `لم يُعثر على أي مستخدم يطابق "${search}"` : 'لا يوجد مستخدمون في هذا القسم حتى الآن.'}
            </p>
            {(search || roleTab) && (
              <button onClick={() => { setSearch(''); setRoleTab(''); }} style={{
                padding: '10px 22px', borderRadius: 999,
                background: 'var(--mint-soft)', border: '1px solid var(--mint-line)',
                color: 'var(--mint-text)', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', fontFamily: 'var(--font-body)'
              }}>↩ عرض الكل</button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr style={{ background: 'var(--bg-field)', borderBottom: '1px solid var(--line-soft)' }}>
                  {[
                    { label: '#',               col: 'id',           w: 52  },
                    { label: 'الاسم',            col: 'fullNameAr',   w: 160 },
                    { label: 'Username',          col: 'username',     w: 130 },
                    { label: 'الإيميل',          col: 'email',        w: 190 },
                    { label: 'الهاتف',           col: 'phoneNumber',  w: 130 },
                    { label: 'الدور',            col: 'role',         w: 110 },
                    { label: 'المحافظة',         col: 'governorate',  w: 110 },
                    { label: 'السنة الدراسية',   col: 'academicYear', w: 120 },
                    { label: 'تاريخ التسجيل',   col: 'createdAt',    w: 110 },
                    { label: 'الحالة',           col: 'isActive',     w: 90  },
                    { label: 'إجراءات',          col: null,           w: 120 },
                  ].map(h => (
                    <th
                      key={h.label}
                      onClick={h.col ? () => handleSort(h.col) : undefined}
                      style={{
                        padding: '12px 14px', textAlign: 'right',
                        fontSize: 12.5, fontWeight: 700, color: 'var(--text-dim)',
                        whiteSpace: 'nowrap', minWidth: h.w,
                        cursor: h.col ? 'pointer' : 'default',
                        userSelect: 'none',
                        transition: 'color .2s',
                        color: h.col && sortCol === h.col ? 'var(--mint-text)' : 'var(--text-dim)',
                      }}
                    >
                      {h.col && <SortIcon col={h.col} />}{h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((u, idx) => (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,.035)',
                      transition: 'background .15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--mint-soft)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '13px 14px', fontSize: 12.5, color: 'var(--text-dim)', fontFamily: 'var(--font-latin)' }}>
                      {(page - 1) * PER_PAGE + idx + 1}
                    </td>

                    <td style={{ padding: '13px 14px', minWidth: 150 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                          background: `linear-gradient(135deg, ${ROLE_META[u.role]?.color || 'var(--mint)'}, rgba(0,0,0,.5))`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 800, color: '#fff', textTransform: 'uppercase'
                        }}>
                          {u.fullNameAr?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>{u.fullNameAr}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-dim)', lineHeight: 1.3 }}>{u.fullNameEn}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '13px 14px' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 600,
                        color: 'var(--mint-text)', background: 'var(--mint-soft)',
                        border: '1px solid var(--mint-line)', borderRadius: 7, padding: '3px 9px'
                      }}>@{u.username}</span>
                    </td>

                    <td style={{ padding: '13px 14px', fontSize: 13, color: 'var(--text-soft)', direction: 'ltr', textAlign: 'left', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.email}
                    </td>

                    <td style={{ padding: '13px 14px', fontSize: 13, fontFamily: 'var(--font-latin)', direction: 'ltr', textAlign: 'left', color: 'var(--text-soft)' }}>
                      {u.phoneNumber}
                    </td>

                    <td style={{ padding: '13px 14px' }}>
                      <RoleBadge role={u.role} />
                    </td>

                    <td style={{ padding: '13px 14px', fontSize: 13, color: 'var(--text-soft)', whiteSpace: 'nowrap' }}>
                      {u.governorate || <span style={{ color: 'var(--text-dim)' }}>—</span>}
                    </td>

                    <td style={{ padding: '13px 14px', fontSize: 12.5, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                      {u.academicYear || <span style={{ opacity: .4 }}>—</span>}
                    </td>

                    <td style={{ padding: '13px 14px', fontSize: 12.5, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                      {new Date(u.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>

                    <td style={{ padding: '13px 14px' }}>
                      <StatusBadge active={u.isActive} />
                    </td>

                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => setEditUser(u)}
                          title="تعديل"
                          style={{
                            width: 34, height: 34, borderRadius: 9, border: '1px solid var(--mint-line)',
                            background: 'var(--mint-soft)', color: 'var(--mint-text)',
                            cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all .2s'
                          }}
                        >✏️</button>

                        <button
                          onClick={() => handleToggle(u)}
                          title={u.isActive ? 'إيقاف' : 'تفعيل'}
                          style={{
                            width: 34, height: 34, borderRadius: 9,
                            border: `1px solid ${u.isActive ? 'var(--amber-line)' : 'var(--mint-line)'}`,
                            background: u.isActive ? 'var(--amber-soft)' : 'var(--mint-soft)',
                            color: u.isActive ? 'var(--amber)' : 'var(--mint-text)',
                            cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all .2s'
                          }}
                        >{u.isActive ? '🚫' : '✅'}</button>

                        <button
                          onClick={() => setDeleteUser(u)}
                          title="حذف"
                          style={{
                            width: 34, height: 34, borderRadius: 9, fontSize: 15,
                            border: '1px solid var(--danger-line)',
                            background: 'var(--danger-soft)', color: 'var(--danger)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all .2s'
                          }}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '8px 16px', borderRadius: 10, border: '1px solid var(--line)',
              background: 'rgba(255,255,255,.03)', color: page === 1 ? 'var(--text-dim)' : 'var(--text-soft)',
              cursor: page === 1 ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)',
              fontSize: 13.5, fontWeight: 600, opacity: page === 1 ? .5 : 1
            }}
          >← السابق</button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) => p === '…'
              ? <span key={`ellipsis-${i}`} style={{ color: 'var(--text-dim)', padding: '0 4px' }}>…</span>
              : (
                <button key={p} onClick={() => setPage(p)} style={{
                  width: 36, height: 36, borderRadius: 10, border: '1px solid',
                  borderColor: page === p ? 'var(--mint)' : 'var(--line)',
                  background: page === p ? 'var(--mint-soft)' : 'rgba(255,255,255,.03)',
                  color: page === p ? 'var(--mint-text)' : 'var(--text-soft)',
                  cursor: 'pointer', fontFamily: 'var(--font-latin)', fontSize: 13.5, fontWeight: 700
                }}>{p}</button>
              )
            )
          }

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              padding: '8px 16px', borderRadius: 10, border: '1px solid var(--line)',
              background: 'rgba(255,255,255,.03)', color: page === totalPages ? 'var(--text-dim)' : 'var(--text-soft)',
              cursor: page === totalPages ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)',
              fontSize: 13.5, fontWeight: 600, opacity: page === totalPages ? .5 : 1
            }}
          >التالي →</button>
        </div>
      )}

      {/* ── MODALS ── */}
      {deleteUser && (
        <ConfirmDialog
          user={deleteUser}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteUser(null)}
        />
      )}

      {editUser && (
        <EditModal
          user={editUser}
          onSave={handleSaveEdit}
          onClose={() => setEditUser(null)}
        />
      )}
    </div>
  );
}
