import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { coursesApi } from '../api/client';
import CourseCard from '../components/CourseCard';
import { useLanguage } from '../i18n/LanguageContext';

const Catalog = () => {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    coursesApi.getAll().then((res: any) => {
      setCourses(res.data);
      setLoading(false);
    });
  }, []);

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.includes(searchTerm) || c.shortDescription.includes(searchTerm);
    const matchesFilter = activeFilter === 'all' || c.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const filters = [
    { id: 'all', label: t('catalog', 'filterAll') },
    { id: 'programming', label: t('catalog', 'filter1') },
    { id: 'web', label: t('catalog', 'filter2') },
    { id: 'ai', label: t('catalog', 'filterInt') },
  ];

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '100px', minHeight: '100vh' }}>
      <div className="container">
        
        {/* Header & Search */}
        <div style={{ textAlign: 'center', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>{t('catalog', 'title')}</h1>
          <p style={{ color: 'var(--text-soft)', fontSize: '18px', marginBottom: '32px' }}>{t('catalog', 'subtitle')}</p>
          
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }} size={20} />
            <input 
              type="text" 
              placeholder={t('catalog', 'search')} 
              className="input-control"
              style={{ width: '100%', paddingRight: '48px', fontSize: '16px', borderRadius: 'var(--r-pill)' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '48px', flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button 
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              style={{ 
                padding: '8px 20px', 
                borderRadius: 'var(--r-pill)', 
                background: activeFilter === f.id ? 'var(--mint)' : 'var(--bg-0)',
                color: activeFilter === f.id ? 'var(--bg-1)' : 'var(--text)',
                border: `1px solid ${activeFilter === f.id ? 'var(--mint)' : 'var(--line)'}`,
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="card" style={{ height: '400px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ height: '160px', background: 'var(--bg-2)', borderRadius: 'var(--r-md)', animation: 'pulseGlow 2s infinite' }}></div>
                <div style={{ height: '24px', background: 'var(--bg-2)', borderRadius: '4px', width: '80%', animation: 'pulseGlow 2s infinite' }}></div>
                <div style={{ height: '16px', background: 'var(--bg-2)', borderRadius: '4px', width: '100%', animation: 'pulseGlow 2s infinite' }}></div>
                <div style={{ height: '16px', background: 'var(--bg-2)', borderRadius: '4px', width: '60%', animation: 'pulseGlow 2s infinite' }}></div>
                <div style={{ marginTop: 'auto', height: '40px', background: 'var(--bg-2)', borderRadius: 'var(--r-md)', animation: 'pulseGlow 2s infinite' }}></div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {filteredCourses.map(course => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-soft)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>{t('catalog', 'noResults')}</h3>
            <p>{t('catalog', 'noResultsSub') || 'حاول البحث بكلمات مختلفة أو إزالة الفلاتر'}</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Catalog;
