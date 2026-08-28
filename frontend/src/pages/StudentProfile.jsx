import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './StudentProfile.css';

export default function StudentProfile() {
  const { user } = useAuth();
  const { lang } = useLanguage();

  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-header">
        <h1>{lang === 'ar' ? 'الملف الشخصي' : 'Profile'}</h1>
        <p>{lang === 'ar' ? 'إدارة إعدادات حسابك وتفضيلاتك' : 'Manage your account settings and preferences'}</p>
      </div>

      {/* PROFILE SECTIONS */}
      <div className="profile-container">
        
        {/* USER HEADER CARD */}
        <div className="profile-card header-card">
           <div className="avatar-large-container">
              <div className="avatar-large">
                 {user?.name ? user.name[0].toUpperCase() : 'S'}
              </div>
              <button className="edit-avatar-btn">📷</button>
           </div>
           <div className="header-card-info">
              <h2>{user?.name || (lang === 'ar' ? '[اسم الطالب]' : '[Student Name]')}</h2>
              <p>{user?.email || (lang === 'ar' ? '[البريد الإلكتروني]' : '[student@email.com]')}</p>
              <div className="student-id-badge">ID: STU-123456</div>
           </div>
        </div>

        <div className="profile-grid">
          {/* PERSONAL INFO */}
          <div className="profile-card">
             <h3 className="card-title">{lang === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}</h3>
             <div className="info-grid">
                <div className="info-item">
                   <span className="info-label">{lang === 'ar' ? 'الاسم بالكامل' : 'Full Name'}</span>
                   <span className="info-value">{user?.name || (lang === 'ar' ? '[اسم الطالب]' : '[Student Name]')}</span>
                </div>
                <div className="info-item">
                   <span className="info-label">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</span>
                   <span className="info-value">{user?.email || '[student@email.com]'}</span>
                </div>
                <div className="info-item">
                   <span className="info-label">{lang === 'ar' ? 'الهاتف' : 'Phone'}</span>
                   <span className="info-value">{user?.phone || '[Phone Number]'}</span>
                </div>
                <div className="info-item">
                   <span className="info-label">{lang === 'ar' ? 'المدينة' : 'City'}</span>
                   <span className="info-value">{user?.city || '[City]'}</span>
                </div>
                <div className="info-item">
                   <span className="info-label">{lang === 'ar' ? 'الجنس' : 'Gender'}</span>
                   <span className="info-value">{user?.gender || '[Gender]'}</span>
                </div>
                <div className="info-item">
                   <span className="info-label">{lang === 'ar' ? 'المرحلة الدراسية' : 'Education Status / Grade'}</span>
                   <span className="info-value">{user?.grade || '[Grade Level]'}</span>
                </div>
                <div className="info-item">
                   <span className="info-label">{lang === 'ar' ? 'المستوى' : 'Level'}</span>
                   <span className="info-value">{user?.level || '[Current Level]'}</span>
                </div>
             </div>
          </div>

          {/* MY GROUPS */}
          <div className="profile-card">
             <h3 className="card-title">{lang === 'ar' ? 'مجموعاتي' : 'My Groups'}</h3>
             <div className="groups-list">
                <div className="group-card">
                   <h4>{lang === 'ar' ? 'مجموعة البرمجة' : 'Programming Group'}</h4>
                   <p className="schedule-info">
                      🕒 {lang === 'ar' ? 'الأيام والأوقات: الأحد، الثلاثاء، الخميس 16:00 - 18:30' : 'Days & Time Slots: Sunday, Tuesday, Thursday 16:00 - 18:30'}
                   </p>
                </div>
             </div>
          </div>
        </div>

        <div className="profile-grid">
           {/* PARENT/GUARDIAN */}
           <div className="profile-card">
             <h3 className="card-title">{lang === 'ar' ? 'ولي الأمر' : 'Parent / Guardian Section'}</h3>
             <div className="info-grid">
                <div className="info-item">
                   <span className="info-label">{lang === 'ar' ? 'اسم ولي الأمر' : 'Guardian Name'}</span>
                   <span className="info-value">{user?.parentName || '[Parent Name]'}</span>
                </div>
                <div className="info-item">
                   <span className="info-label">{lang === 'ar' ? 'بريد ولي الأمر' : 'Guardian Email'}</span>
                   <span className="info-value">{user?.parentEmail || '[parent@email.com]'}</span>
                </div>
             </div>
           </div>

           {/* SECURITY */}
           <div className="profile-card security-card">
             <h3 className="card-title">{lang === 'ar' ? 'الأمان' : 'Security'}</h3>
             <p className="security-desc">
                {lang === 'ar' ? 'قم بتحديث كلمة المرور للحفاظ على أمان حسابك' : 'Update your password to keep your account secure'}
             </p>
             <button className="btn-primary">
                {lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
             </button>
           </div>
        </div>

      </div>
    </>
  );
}
