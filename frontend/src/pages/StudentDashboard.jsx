import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './StudentDashboard.css';

const ARABIC_MOCK_DATA = [
  {
    id: 1, title: 'الوحدة األولى: ما هي المعلومات؟',
    materials: [
      { id: 101, title: 'الدرس 1-1: المعلومات والوسائط', type: 'pdf', size: '2.4 MB' },
      { id: 102, title: 'الدرس 1-2: أخالقيات المعلومات', type: 'ppt', size: '5.1 MB' }
    ]
  },
  { id: 2, title: 'الوحدة الثانية: القوانين والحقوق في مجتمع المعلومات', materials: [] },
  { id: 3, title: 'الوحدة الثالثة: أمن المعلومات', materials: [] },
  { id: 4, title: 'الوحدة الرابعة: تكنولوجيا المعلومات والمجتمع', materials: [] },
  { id: 5, title: 'الوحدة الخامسة: االتصاالت', materials: [] },
  {
    id: 6, title: 'الوحدة السادسة: تصميم المعلومات',
    materials: [
      { id: 601, title: 'الدرس 6-1: التناظري والرقمي', type: 'pdf', size: '1.2 MB' },
      { id: 602, title: 'الدرس 6-2: النظام الثنائي وكمية البيانات', type: 'ppt', size: '3.1 MB' }
    ]
  },
  { id: 7, title: 'الوحدة السابعة: الكمبيوترات', materials: [] },
  { id: 8, title: 'الوحدة الثامنة: الشبكات', materials: [] },
  { id: 9, title: 'الوحدة التاسعة: قواعد البيانات', materials: [] },
  { id: 10, title: 'الوحدة العاشرة: تحليل البيانات', materials: [] },
  { id: 11, title: 'الوحدة الحادية عشر: المحاكاة', materials: [] },
  {
    id: 12, title: 'الوحدة الثانية عشر: البرمجة',
    materials: [
      { id: 1201, title: 'الدرس 12-1: الخوارزميات', type: 'pdf', size: '1.5 MB' },
      { id: 1202, title: 'الدرس 12-2: أساسيات البرمجة (Python)', type: 'code', size: '4 KB', lang: 'Python' }
    ]
  },
  {
    id: 13, title: 'الوحدة الثالثة عشر: الذكاء االصطناعي التوليدي',
    materials: [
      { id: 1301, title: 'الدرس 13-1: الذكاء االصطناعي التوليدي', type: 'ppt', size: '8.4 MB' },
      { id: 1302, title: 'الدرس 13-2: HTML, CSS', type: 'code', size: '12 KB', lang: 'HTML/CSS' }
    ]
  }
];

const ENGLISH_MOCK_DATA = [
  {
    id: 1, title: 'Chapter 1: What is Information?',
    materials: [
      { id: 101, title: 'Lesson 1-1: Information and Media', type: 'pdf', size: '2.4 MB' },
      { id: 102, title: 'Lesson 1-2: Information Ethics', type: 'ppt', size: '5.1 MB' }
    ]
  },
  { id: 2, title: 'Chapter 2: Regulations and Rights in the Information Society', materials: [] },
  { id: 3, title: 'Chapter 3: Information Security', materials: [] },
  { id: 4, title: 'Chapter 4: Information Technology and Society', materials: [] },
  { id: 5, title: 'Chapter 5: Communication', materials: [] },
  {
    id: 6, title: 'Chapter 6: Information Design',
    materials: [
      { id: 601, title: 'Lesson 6-1: Analog and Digital', type: 'pdf', size: '1.2 MB' },
      { id: 602, title: 'Lesson 6-2: Binary and Amount of Information', type: 'ppt', size: '3.1 MB' }
    ]
  },
  { id: 7, title: 'Chapter 7: Computers', materials: [] },
  { id: 8, title: 'Chapter 8: Networks', materials: [] },
  { id: 9, title: 'Chapter 9: Databases', materials: [] },
  { id: 10, title: 'Chapter 10: Data Analysis', materials: [] },
  { id: 11, title: 'Chapter 11: Simulations', materials: [] },
  {
    id: 12, title: 'Chapter 12: Programming (Python)',
    materials: [
      { id: 1201, title: 'Lesson 12-1: Algorithm', type: 'pdf', size: '1.5 MB' },
      { id: 1202, title: 'Lesson 12-2: Programming Basics [1]', type: 'code', size: '4 KB', lang: 'Python' }
    ]
  },
  {
    id: 13, title: 'Chapter 13: Generative AI',
    materials: [
      { id: 1301, title: 'Lesson 13-1: Generative AI', type: 'ppt', size: '8.4 MB' },
      { id: 1302, title: 'Lesson 13-2: HTML, CSS', type: 'code', size: '12 KB', lang: 'HTML/CSS' }
    ]
  }
];

export default function StudentDashboard() {
  const { user } = useAuth();
  
  // Track preference: 'arabic' | 'english'
  const [activeTrack, setActiveTrack] = useState(() => {
    return localStorage.getItem('bedu_curriculum_pref') || 'arabic';
  });
  
  const [openChapters, setOpenChapters] = useState({});

  useEffect(() => {
    localStorage.setItem('bedu_curriculum_pref', activeTrack);
  }, [activeTrack]);

  const toggleChapter = (id) => {
    setOpenChapters(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const isArabic = activeTrack === 'arabic';
  const currentData = isArabic ? ARABIC_MOCK_DATA : ENGLISH_MOCK_DATA;

  const renderIcon = (type) => {
    if (type === 'pdf') return '📄';
    if (type === 'ppt') return '📊';
    if (type === 'code') return '💻';
    return '📁';
  };

  const renderActions = (item) => {
    if (item.type === 'pdf') {
      return (
        <>
          <button className="mat-btn btn-primary">{isArabic ? 'عرض' : 'Preview'}</button>
          <button className="mat-btn btn-secondary">{isArabic ? 'تحميل' : 'Download'}</button>
        </>
      );
    }
    if (item.type === 'ppt') {
      return (
        <>
          <button className="mat-btn btn-primary">{isArabic ? 'عرض الشرائح' : 'View Slides'}</button>
          <button className="mat-btn btn-secondary">{isArabic ? 'تحميل PPTX' : 'Download PPTX'}</button>
        </>
      );
    }
    if (item.type === 'code') {
      return (
        <>
          <button className="mat-btn btn-primary">{isArabic ? 'عرض الكود' : 'View Code'}</button>
          <button className="mat-btn btn-secondary">{isArabic ? 'نسخ الكود' : 'Copy Snippet'}</button>
        </>
      );
    }
  };

  return (
    <div style={{ direction: isArabic ? 'rtl' : 'ltr' }}>
      {/* PAGE HEADER */}
      <div className="page-header" style={{ paddingBottom: '1rem' }}>
        <h1>{isArabic ? 'المادة العلمية' : 'Course Materials'}</h1>
        <p>{isArabic ? 'استعرض الدروس، والملاحظات، والملحقات الخاصة بمنهجك الدراسي.' : 'Access lessons, study guides, and materials for your curriculum.'}</p>
      </div>

      {/* TRACK SWITCHER */}
      <div className="curriculum-tabs">
        <button 
          className={`curriculum-tab ${isArabic ? 'active' : ''}`}
          onClick={() => setActiveTrack('arabic')}
        >
          المنهج العربي
        </button>
        <button 
          className={`curriculum-tab ${!isArabic ? 'active' : ''}`}
          onClick={() => setActiveTrack('english')}
        >
          Languages Curriculum
        </button>
      </div>

      {/* ACCORDIONS LIST */}
      <div style={{ paddingBottom: '4rem' }}>
        {currentData.map((chapter) => {
          const isOpen = openChapters[chapter.id];
          return (
            <div key={chapter.id} className="chapter-accordion">
              
              {/* Header */}
              <div className="chapter-header" onClick={() => toggleChapter(chapter.id)}>
                <h3>{chapter.title}</h3>
                <span className={`chapter-toggle ${isOpen ? 'open' : ''}`}>▼</span>
              </div>
              
              {/* Content */}
              {isOpen && (
                <div className="chapter-content">
                  {chapter.materials.length > 0 ? (
                    <div className="materials-list">
                      {chapter.materials.map(mat => (
                        <div key={mat.id} className="mat-card">
                          <div className="mat-header">
                            <span className="mat-icon">{renderIcon(mat.type)}</span>
                            <div className="mat-info">
                              <h4>{mat.title}</h4>
                              <p>{mat.type.toUpperCase()} • {mat.size} {mat.lang ? `• ${mat.lang}` : ''}</p>
                            </div>
                          </div>
                          <div className="mat-actions">
                            {renderActions(mat)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📭</div>
                      <p>{isArabic ? 'لا توجد مواد تعليمية مضافة لهذا الدرس حالياً.' : 'No materials uploaded for this lesson yet.'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
