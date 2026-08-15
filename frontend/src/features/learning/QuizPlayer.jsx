import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getExamDetail, submitExam } from '../../services/api';
import './QuizPlayer.css'; // We'll add some basic styles

export default function QuizPlayer({ examId, lang, onComplete }) {
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOptionId }
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadExam();
  }, [examId]);

  const loadExam = async () => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    try {
      const { data } = await getExamDetail(examId);
      setExam(data);
    } catch (e) {
      toast.error('فشل تحميل الاختبار');
    }
    setLoading(false);
  };

  const handleOptionSelect = (qId, oId) => {
    if (result) return; // disable if already submitted
    setAnswers(prev => ({ ...prev, [qId]: oId }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < exam.questions.length) {
      if (!window.confirm('لم تقم بالإجابة على جميع الأسئلة، هل أنت متأكد من التسليم؟')) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        answers: Object.keys(answers).map(qId => ({
          questionId: parseInt(qId),
          selectedOptionId: answers[qId]
        }))
      };
      const { data } = await submitExam(examId, payload);
      setResult(data);
      toast.success('تم تسليم الاختبار بنجاح');
      if (onComplete) onComplete();
    } catch (e) {
      if (e.response?.data?.alreadySubmitted) {
        toast.error('لقد قمت بتسليم هذا الاختبار مسبقاً');
      } else {
        toast.error('حدث خطأ أثناء التسليم');
      }
    }
    setSubmitting(false);
  };

  if (loading) return <div className="quiz-loading">جاري تحميل الاختبار...</div>;
  if (!exam) return null;

  if (result) {
    return (
      <div className="quiz-result">
        <h2>{lang === 'ar' ? 'نتيجة الاختبار' : 'Exam Result'}</h2>
        <div className="score-card">
          <div className="score-value">{result.score} / {result.maxScore}</div>
          <div className="score-perc">{result.percentage.toFixed(1)}%</div>
        </div>
        
        <div className="result-answers">
          {result.answers.map((ans, idx) => (
            <div key={ans.questionId} className={`result-q ${ans.isCorrect ? 'correct' : 'wrong'}`}>
              <h4>{idx + 1}. {lang === 'ar' ? ans.questionTextAr : (ans.questionTextEn || ans.questionTextAr)}</h4>
              <p>
                <strong>{lang === 'ar' ? 'إجابتك:' : 'Your Answer:'} </strong>
                {ans.selectedOptionId ? (lang === 'ar' ? ans.selectedOptionTextAr : (ans.selectedOptionTextEn || ans.selectedOptionTextAr)) : (lang === 'ar' ? 'لم يتم الإجابة' : 'Not Answered')}
                {ans.isCorrect ? ' ✅' : ' ❌'}
              </p>
              {!ans.isCorrect && (
                <p className="correct-ans">
                  <strong>{lang === 'ar' ? 'الإجابة الصحيحة:' : 'Correct Answer:'} </strong>
                  {lang === 'ar' ? ans.correctOptionTextAr : (ans.correctOptionTextEn || ans.correctOptionTextAr)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-player">
      <div className="quiz-header">
        <h2 className="quiz-title">{exam.title}</h2>
        {exam.description && <p className="quiz-desc">{exam.description}</p>}
        <div className="quiz-meta">
          <span>⏱️ {exam.durationMinutes} {lang === 'ar' ? 'دقيقة' : 'Minutes'}</span>
          <span>❓ {exam.questions.length} {lang === 'ar' ? 'سؤال' : 'Questions'}</span>
        </div>
      </div>

      <div className="quiz-body">
        {exam.questions.map((q, idx) => (
          <div key={q.id} className="quiz-q-card">
            <h4 className="q-text">
              <span className="q-num">{idx + 1}.</span> 
              {lang === 'ar' ? q.textAr : (q.textEn || q.textAr)}
            </h4>
            <div className="q-options">
              {q.options.map(opt => (
                <label 
                  key={opt.id} 
                  className={`q-opt-label ${answers[q.id] === opt.id ? 'selected' : ''}`}
                >
                  <input 
                    type="radio" 
                    name={`q-${q.id}`} 
                    value={opt.id}
                    checked={answers[q.id] === opt.id}
                    onChange={() => handleOptionSelect(q.id, opt.id)}
                  />
                  <span>{lang === 'ar' ? opt.textAr : (opt.textEn || opt.textAr)}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="quiz-footer">
        <button className="btn btn--primary btn--lg" onClick={handleSubmit} disabled={submitting}>
          {submitting ? (lang === 'ar' ? 'جاري التسليم...' : 'Submitting...') : (lang === 'ar' ? 'تسليم الاختبار' : 'Submit Exam')}
        </button>
      </div>
    </div>
  );
}
