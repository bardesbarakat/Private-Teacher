import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { generateLessonCodes, getLessonCodes } from '../../../services/api';

export default function LessonCodeManager({ lessonId }) {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generateCount, setGenerateCount] = useState(10);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchCodes();
  }, [lessonId]);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const res = await getLessonCodes(lessonId);
      setCodes(res.data);
    } catch (err) {
      toast.error('فشل في تحميل أكواد التفعيل');
    }
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (!window.confirm(`هل أنت متأكد من توليد ${generateCount} كود تفعيل جديد؟`)) return;
    setGenerating(true);
    try {
      await generateLessonCodes(lessonId, generateCount);
      toast.success('تم توليد الأكواد بنجاح!');
      fetchCodes();
    } catch (err) {
      toast.error('فشل في توليد الأكواد');
    }
    setGenerating(false);
  };

  const printCodes = () => {
    window.print();
  };

  return (
    <div className="lesson-codes-container" style={{ padding: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }} className="no-print">
        <h3 style={{ margin: 0, color: 'var(--violet)' }}>🔑 أكواد التفعيل للدرس</h3>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="number" 
            min="1" 
            max="100" 
            value={generateCount} 
            onChange={e => setGenerateCount(Number(e.target.value))}
            className="form-input" 
            style={{ width: '80px', padding: '0.4rem' }} 
            title="عدد الأكواد"
          />
          <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
            {generating ? 'جاري التوليد...' : '+ توليد أكواد'}
          </button>
          {codes.length > 0 && (
            <button className="btn btn-ghost" onClick={printCodes}>🖨️ طباعة الأكواد</button>
          )}
        </div>
      </div>

      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; }
            .no-print { display: none !important; }
            .code-card { break-inside: avoid; page-break-inside: avoid; margin-bottom: 20px; }
          }
          .codes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
        `}
      </style>

      {loading ? (
        <p>جاري التحميل...</p>
      ) : codes.length === 0 ? (
        <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem', border: '1px dashed var(--line)', borderRadius: '8px' }}>
          لا توجد أكواد مولدة لهذا الدرس حتى الآن.
        </p>
      ) : (
        <div className="print-area">
          <div className="codes-grid">
            {codes.map(c => (
              <div key={c.id} className="code-card" style={{
                border: '2px solid var(--line)', 
                borderRadius: '12px', 
                padding: '1rem',
                background: 'var(--bg-card)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: c.isUsed ? 0.6 : 1
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '2px', background: 'var(--bg-1)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--violet-line)' }}>
                  {c.code}
                </div>
                
                <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', marginTop: '0.5rem' }}>
                  <QRCodeSVG value={c.redeemUrl} size={100} />
                </div>
                
                <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginTop: '0.5rem' }}>
                  {c.isUsed ? (
                    <span style={{ color: 'var(--danger-solid)' }}>
                      مستخدم بواسطة: {c.redeemedByStudentName || 'طالب مجهول'}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--mint-text)' }}>✔️ كود غير مستخدم</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
