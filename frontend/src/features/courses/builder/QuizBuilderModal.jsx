import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createExam, updateExam, getExamDetail } from '../../../services/api';
import './CurriculumBuilder.css'; // Re-use some styles

export default function QuizBuilderModal({ courseId, lessonId, existingExamId, onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState({
    title: '',
    description: '',
    durationMinutes: 30,
    questions: []
  });

  useEffect(() => {
    if (existingExamId) {
      loadExam();
    }
  }, [existingExamId]);

  const loadExam = async () => {
    setLoading(true);
    try {
      const { data } = await getExamDetail(existingExamId);
      setExam(data);
    } catch {
      toast.error('فشل تحميل تفاصيل الاختبار');
    }
    setLoading(false);
  };

  const handleAddQuestion = () => {
    setExam(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: Date.now(), // temp id
          textAr: '',
          textEn: '',
          score: 1,
          order: prev.questions.length,
          options: [
            { id: Date.now() + 1, textAr: '', textEn: '', isCorrect: true },
            { id: Date.now() + 2, textAr: '', textEn: '', isCorrect: false }
          ]
        }
      ]
    }));
  };

  const updateQuestion = (qIndex, field, value) => {
    const newQs = [...exam.questions];
    newQs[qIndex][field] = value;
    setExam({ ...exam, questions: newQs });
  };

  const handleAddOption = (qIndex) => {
    const newQs = [...exam.questions];
    newQs[qIndex].options.push({
      id: Date.now(),
      textAr: '',
      textEn: '',
      isCorrect: false
    });
    setExam({ ...exam, questions: newQs });
  };

  const updateOption = (qIndex, oIndex, field, value) => {
    const newQs = [...exam.questions];
    if (field === 'isCorrect' && value === true) {
      // uncheck others
      newQs[qIndex].options.forEach(o => o.isCorrect = false);
    }
    newQs[qIndex].options[oIndex][field] = value;
    setExam({ ...exam, questions: newQs });
  };

  const removeOption = (qIndex, oIndex) => {
    const newQs = [...exam.questions];
    newQs[qIndex].options.splice(oIndex, 1);
    setExam({ ...exam, questions: newQs });
  };

  const removeQuestion = (qIndex) => {
    const newQs = [...exam.questions];
    newQs.splice(qIndex, 1);
    setExam({ ...exam, questions: newQs });
  };

  const handleSave = async () => {
    if (!exam.title) return toast.error('يرجى إدخال عنوان الاختبار');
    if (exam.questions.length === 0) return toast.error('يجب إضافة سؤال واحد على الأقل');

    // Validate
    for (let i = 0; i < exam.questions.length; i++) {
      const q = exam.questions[i];
      if (!q.textAr) return toast.error(`السؤال رقم ${i + 1} يجب أن يحتوي على نص بالعربية`);
      if (q.options.length < 2) return toast.error(`السؤال رقم ${i + 1} يجب أن يحتوي على خيارين على الأقل`);
      if (!q.options.some(o => o.isCorrect)) return toast.error(`يجب تحديد إجابة صحيحة للسؤال رقم ${i + 1}`);
    }

    setLoading(true);
    try {
      const payload = {
        title: exam.title,
        description: exam.description,
        durationMinutes: exam.durationMinutes,
        courseId,
        lessonId,
        questions: exam.questions.map((q, qi) => ({
          textAr: q.textAr,
          textEn: q.textEn,
          score: q.score,
          order: qi,
          options: q.options.map(o => ({
            textAr: o.textAr,
            textEn: o.textEn,
            isCorrect: o.isCorrect
          }))
        }))
      };

      if (existingExamId) {
        await updateExam(existingExamId, payload);
        toast.success('تم تحديث الاختبار بنجاح');
      } else {
        await createExam(payload);
        toast.success('تم إنشاء الاختبار بنجاح');
      }
      onSave();
    } catch (e) {
      toast.error(e.response?.data?.message || 'حدث خطأ أثناء الحفظ');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2>{existingExamId ? 'تعديل الاختبار' : 'إنشاء اختبار جديد'}</h2>
          <button className="btn btn--icon" onClick={onClose}>✕</button>
        </div>

        {loading && !exam.title ? (
          <div style={{ padding: 40, textAlign: 'center' }}>جاري التحميل...</div>
        ) : (
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="form-group">
              <label>عنوان الاختبار *</label>
              <input type="text" className="form-input" value={exam.title} onChange={e => setExam({ ...exam, title: e.target.value })} placeholder="مثال: اختبار الفصل الأول" />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>وصف الاختبار (اختياري)</label>
                <input type="text" className="form-input" value={exam.description} onChange={e => setExam({ ...exam, description: e.target.value })} placeholder="وصف قصير للاختبار..." />
              </div>
              <div className="form-group" style={{ width: '150px' }}>
                <label>المدة (بالدقائق)</label>
                <input type="number" className="form-input" value={exam.durationMinutes} onChange={e => setExam({ ...exam, durationMinutes: parseInt(e.target.value) || 0 })} min="1" />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--line-soft)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>الأسئلة ({exam.questions.length})</h3>
                <button className="btn btn--primary" onClick={handleAddQuestion}>+ إضافة سؤال</button>
              </div>

              {exam.questions.map((q, qIndex) => (
                <div key={q.id} style={{ background: 'var(--bg-1)', border: '1px solid var(--line-soft)', borderRadius: '10px', padding: '15px', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong>السؤال {qIndex + 1}</strong>
                    <button className="btn btn--danger btn--icon" onClick={() => removeQuestion(qIndex)} title="حذف السؤال">🗑️</button>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <input type="text" className="form-input" placeholder="نص السؤال (بالعربية) *" value={q.textAr} onChange={e => updateQuestion(qIndex, 'textAr', e.target.value)} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input type="text" className="form-input" placeholder="نص السؤال (بالإنجليزية) - اختياري" value={q.textEn} onChange={e => updateQuestion(qIndex, 'textEn', e.target.value)} dir="ltr" />
                    </div>
                    <div style={{ width: '80px' }}>
                      <input type="number" className="form-input" placeholder="الدرجة" value={q.score} onChange={e => updateQuestion(qIndex, 'score', parseInt(e.target.value) || 1)} min="1" title="درجة السؤال" />
                    </div>
                  </div>

                  <div style={{ paddingRight: '20px', borderRight: '2px solid var(--line)', marginTop: '10px' }}>
                    <div style={{ marginBottom: '8px', fontSize: '13px', color: 'var(--text-dim)' }}>الخيارات:</div>
                    {q.options.map((opt, oIndex) => (
                      <div key={opt.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                        <input 
                          type="radio" 
                          name={`correct-${q.id}`} 
                          checked={opt.isCorrect} 
                          onChange={(e) => updateOption(qIndex, oIndex, 'isCorrect', e.target.checked)}
                          title="تحديد كإجابة صحيحة"
                          style={{ width: '18px', height: '18px', accentColor: 'var(--mint)' }}
                        />
                        <input type="text" className="form-input" placeholder="الخيار (بالعربية)" value={opt.textAr} onChange={e => updateOption(qIndex, oIndex, 'textAr', e.target.value)} style={{ padding: '6px 10px', fontSize: '13px' }} />
                        <input type="text" className="form-input" placeholder="الخيار (بالإنجليزية)" value={opt.textEn} onChange={e => updateOption(qIndex, oIndex, 'textEn', e.target.value)} style={{ padding: '6px 10px', fontSize: '13px' }} dir="ltr" />
                        <button className="btn btn--icon" onClick={() => removeOption(qIndex, oIndex)} style={{ color: 'var(--danger)' }}>✕</button>
                      </div>
                    ))}
                    <button className="btn btn--ghost" onClick={() => handleAddOption(qIndex)} style={{ fontSize: '12px', padding: '4px 8px', marginTop: '5px' }}>+ إضافة خيار</button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn--ghost" onClick={onClose} disabled={loading}>إلغاء</button>
          <button className="btn btn--primary" onClick={handleSave} disabled={loading}>
            {loading ? 'جاري الحفظ...' : '💾 حفظ الاختبار'}
          </button>
        </div>
      </div>
    </div>
  );
}
