import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStudentResults } from '../services/api';
import './Dashboard.css';

export default function ParentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [results, setResults]     = useState([]);
  const [searched, setSearched]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleSearch = async () => {
    if (!studentId.trim()) { setError('يرجى إدخال معرّف الطالب'); return; }
    setError(''); setLoading(true);
    try {
      const r = await getStudentResults(studentId);
      setResults(r.data);
      setSearched(true);
    } catch (e) {
      setError(e.response?.data?.message || 'لم يُعثر على طالب بهذا المعرّف');
    }
    setLoading(false);
  };

  const avg = results.length ? Math.round(results.reduce((s,r)=>s+r.percentage,0)/results.length) : 0;

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar__header">
          <div className="sidebar__avatar">{(user?.fullNameAr||'P')[0]}</div>
          <div className="sidebar__name">{user?.fullNameAr}</div>
          <div className="sidebar__role"><span className="badge badge--amber">👨‍👧 ولي أمر</span></div>
        </div>
        <nav className="sidebar__nav">
          <button className="sidebar__item active"><span className="icon">📊</span> متابعة الطالب</button>
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
            <h1>لوحة ولي الأمر</h1>
            <p>أهلاً {user?.fullNameAr?.split(' ')[0]}! تابع أداء ابنك / ابنتك من هنا.</p>
          </div>
        </div>

        {/* Search student */}
        <div className="card" style={{marginBottom:'28px',maxWidth:'480px'}}>
          <h3 style={{fontSize:'16px',fontWeight:700,marginBottom:'14px'}}>🔍 البحث عن طالب</h3>
          <p style={{fontSize:'13.5px',color:'var(--text-dim)',marginBottom:'14px'}}>أدخل معرّف الطالب (User ID) لعرض نتائجه واختباراته.</p>
          <div style={{display:'flex',gap:'10px'}}>
            <input className="form-input" value={studentId} onChange={e=>setStudentId(e.target.value)}
              placeholder="مثال: 5" type="number" min="1" dir="ltr"
              onKeyDown={e=>e.key==='Enter'&&handleSearch()} />
            <button className="btn-primary" onClick={handleSearch} disabled={loading}>
              {loading ? '...' : 'بحث'}
            </button>
          </div>
          {error && <p style={{color:'var(--danger)',fontSize:'13px',marginTop:'8px'}}>{error}</p>}
        </div>

        {/* Results */}
        {searched && (
          <>
            {results.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>لا توجد نتائج</h3>
                <p>لم يؤدِّ الطالب أي اختبارات بعد</p>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="stats-row" style={{marginBottom:'24px'}}>
                  {[
                    { icon:'📝', num:results.length, label:'عدد الاختبارات' },
                    { icon:'⭐', num:avg+'%', label:'متوسط الدرجات' },
                    { icon:'✅', num:results.filter(r=>r.percentage>=50).length, label:'اختبارات ناجحة' },
                    { icon:'❌', num:results.filter(r=>r.percentage<50).length, label:'تحتاج مراجعة' },
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

                {/* Overall progress */}
                <div className="card" style={{marginBottom:'24px'}}>
                  <h3 style={{fontSize:'15px',fontWeight:700,marginBottom:'10px'}}>المستوى العام</h3>
                  <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                    <div className="progress-bar" style={{flex:1,height:'10px'}}>
                      <div className="progress-bar__fill" style={{width:`${avg}%`}} />
                    </div>
                    <span style={{fontSize:'18px',fontWeight:800,color:'var(--mint)',minWidth:'50px'}}>{avg}%</span>
                  </div>
                  <p style={{fontSize:'13px',color:'var(--text-dim)',marginTop:'8px'}}>
                    {avg>=80?'أداء ممتاز 🏆':avg>=50?'أداء جيد 👍، يحتاج مزيداً من التطوير':'يحتاج مراجعة ومتابعة إضافية 📖'}
                  </p>
                </div>

                {/* Table */}
                <div className="dash-section">
                  <div className="dash-section__head"><h2>تفاصيل الاختبارات</h2></div>
                  <div style={{overflowX:'auto'}}>
                    <table className="data-table">
                      <thead>
                        <tr><th>الاختبار</th><th>الدرجة</th><th>النسبة</th><th>الحالة</th><th>التاريخ</th></tr>
                      </thead>
                      <tbody>
                        {results.map(r => (
                          <tr key={r.id}>
                            <td style={{fontWeight:600}}>{r.examTitle}</td>
                            <td><strong style={{color:'var(--mint)'}}>{r.score}/{r.maxScore}</strong></td>
                            <td>
                              <div style={{display:'flex',alignItems:'center',gap:'8px',minWidth:'120px'}}>
                                <div className="progress-bar" style={{flex:1}}>
                                  <div className="progress-bar__fill" style={{width:`${r.percentage}%`}} />
                                </div>
                                <span style={{fontSize:'13px',fontWeight:700,minWidth:'38px',color:r.percentage>=50?'var(--mint)':'var(--danger)'}}>{Math.round(r.percentage)}%</span>
                              </div>
                            </td>
                            <td><span className={`badge ${r.percentage>=80?'badge--mint':r.percentage>=50?'badge--amber':'badge--danger'}`}>
                              {r.percentage>=80?'ممتاز':r.percentage>=50?'مقبول':'ضعيف'}
                            </span></td>
                            <td style={{color:'var(--text-dim)',fontSize:'13px'}}>{new Date(r.submittedAt).toLocaleDateString('ar-DZ')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
