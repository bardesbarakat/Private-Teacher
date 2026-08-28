import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function PlaceholderPage({ titleEn, titleAr, subEn, subAr, descEn, descAr, icon }) {
  const { lang } = useLanguage();

  return (
    <div style={{ padding: '2rem' }}>
      <div className="page-header" style={{ padding: '0 0 1rem 0' }}>
        <h1>{icon} {lang === 'ar' ? titleAr : titleEn}</h1>
        <p>{lang === 'ar' ? subAr : subEn}</p>
      </div>
      <div className="profile-card" style={{ textAlign: 'center', padding: '4rem 2rem', marginTop: '2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{icon}</div>
        <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>
          {lang === 'ar' ? titleAr : titleEn}
        </h2>
        <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          {lang === 'ar' ? descAr : descEn}
        </p>
      </div>
    </div>
  );
}
