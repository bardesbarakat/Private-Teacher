import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { examsApi } from '../api/client';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../i18n/LanguageContext';

const Exam = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (id) {
      examsApi.getById(id).then((res: any) => {
        setExam(res.data);
        setTimeLeft(res.data.timeLimitMinutes * 60);
        setLoading(false);
      });
    }
  }, [id]);

  useEffect(() => {
    if (timeLeft > 0 && !result && !loading) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !result && !loading) {
      handleSubmit();
    }
  }, [timeLeft, result, loading]);

  const handleSubmit = async () => {
    toast.loading('جاري تصحيح الاختبار...', { id: 'submit' });
    try {
      const res: any = await examsApi.submit(id!, answers);
      setResult(res.data);
      toast.success('تم إنهاء الاختبار!', { id: 'submit' });
    } catch (e) {
      toast.error('حدث خطأ', { id: 'submit' });
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>جاري تجهيز الاختبار...</div>;

  if (result) {
    const circumference = 2 * Math.PI * 60;
    const strokeDashoffset = circumference - (result.score / 100) * circumference;
    const isPassing = result.score >= 50;

    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-1)', padding: '20px' }}>
        <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '48px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '32px' }}>{t('exam', 'resultTitle')}</h2>
          
          <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 32px' }}>
            <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="80" cy="80" r="60" fill="none" stroke="var(--bg-2)" strokeWidth="12" />
              <circle cx="80" cy="80" r="60" fill="none" stroke={isPassing ? 'var(--mint)' : '#ef4444'} strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '36px', fontWeight: 'bold', color: isPassing ? 'var(--mint)' : '#ef4444' }} className="latin">{result.score}%</span>
            </div>
          </div>

          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: isPassing ? 'var(--mint)' : '#ef4444' }}>
            {t('exam', 'grade')} {result.score >= 90 ? t('exam', 'grade1') : result.score >= 75 ? t('exam', 'grade2') : result.score >= 60 ? t('exam', 'grade3') : result.score >= 50 ? t('exam', 'grade4') : t('exam', 'grade5')}
          </div>
          <p style={{ color: 'var(--text-soft)', marginBottom: '32px' }}>
            {t('exam', 'correct')} {result.correctCount} {t('exam', 'of')} {result.totalCount}.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button className="btn btn-outline" onClick={() => navigate(`/results/${result.id}`)}>{t('exam', 'reviewAnswers')}</button>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>{t('exam', 'backDashboard')}</button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = exam.questions[currentQIndex];
  const isTimeLow = timeLeft < 120;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-1)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Topbar */}
      <div style={{ background: 'var(--bg-0)', borderBottom: '1px solid var(--line)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold' }}>{exam.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isTimeLow ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-2)', padding: '8px 16px', borderRadius: 'var(--r-pill)', color: isTimeLow ? '#ef4444' : 'var(--text)', transition: 'all 0.3s' }}>
          <Clock size={18} />
          <span className="latin" style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="container" style={{ flex: 1, padding: '32px 16px', display: 'flex', gap: '32px' }}>
        
        {/* Main Q Area */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
          <div className="card" style={{ padding: '32px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', color: 'var(--text-soft)' }}>
              <span>{t('exam', 'question')} {currentQIndex + 1} {t('exam', 'of')} {exam.questions.length}</span>
            </div>
            
            <h2 style={{ fontSize: '24px', fontWeight: '600', lineHeight: '1.6', marginBottom: '32px' }}>
              {currentQ.text}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentQ.choices.map((choice: string, idx: number) => {
                const isSelected = answers[currentQ.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setAnswers({ ...answers, [currentQ.id]: idx })}
                    style={{
                      padding: '16px 24px',
                      background: isSelected ? 'var(--mint-soft)' : 'var(--bg-2)',
                      border: `1px solid ${isSelected ? 'var(--mint)' : 'var(--line)'}`,
                      borderRadius: 'var(--r-md)',
                      textAlign: 'right',
                      fontSize: '18px',
                      color: 'var(--text)',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}
                  >
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${isSelected ? 'var(--mint)' : 'var(--text-soft)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isSelected && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--mint)' }}></div>}
                    </div>
                    {choice}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
            <button 
              className="btn btn-outline" 
              disabled={currentQIndex === 0} 
              onClick={() => setCurrentQIndex(i => i - 1)}
              style={{ opacity: currentQIndex === 0 ? 0.5 : 1 }}
            >
              <ArrowRight size={18} /> {t('exam', 'prev')}
            </button>
            
            {currentQIndex === exam.questions.length - 1 ? (
              <button className="btn btn-primary" onClick={() => {
                if (window.confirm(t('exam', 'confirmMsg') || 'هل أنت متأكد من إنهاء الاختبار وتسليم الإجابات؟')) {
                  handleSubmit();
                }
              }}>
                {t('exam', 'finish')}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => setCurrentQIndex(i => i + 1)}>
                {t('exam', 'next')} <ArrowLeft size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Navigator */}
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column' }}>
          <div className="card" style={{ padding: '24px', position: 'sticky', top: '90px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>{t('exam', 'questions')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {exam.questions.map((q: any, idx: number) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = idx === currentQIndex;
                
                let bg = 'var(--bg-2)';
                let color = 'var(--text)';
                let border = '1px solid var(--line)';

                if (isCurrent) {
                  border = '2px solid var(--mint)';
                } else if (isAnswered) {
                  bg = 'var(--mint)';
                  color = 'var(--bg-1)';
                  border = '1px solid var(--mint)';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQIndex(idx)}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '8px',
                      background: bg,
                      color: color,
                      border: border,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      transition: 'all 0.2s'
                    }}
                    className="latin"
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--mint)' }}></div> مُجاب
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--bg-2)', border: '2px solid var(--mint)' }}></div> الحالي
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--bg-2)', border: '1px solid var(--line)' }}></div> غير مُجاب
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Exam;
