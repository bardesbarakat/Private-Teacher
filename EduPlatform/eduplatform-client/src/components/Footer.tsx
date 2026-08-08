import { Link } from 'react-router-dom';

const FbIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const TgIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>;
const IgIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
const YtIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>;
const MailIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const PhoneIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.32-1.32a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const MapIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;

const S = {
  link: { color: '#7A7060', fontSize: '14px', transition: 'color .2s', display: 'block', padding: '2px 0' } as React.CSSProperties,
};

const Footer = () => {
  const hoverGold = (e: React.MouseEvent) => (e.currentTarget as HTMLElement).style.color = '#F5C842';
  const hoverDim  = (e: React.MouseEvent) => (e.currentTarget as HTMLElement).style.color = '#7A7060';

  return (
    <footer style={{
      background: '#080808',
      borderTop: '1px solid rgba(245,200,66,.10)',
      paddingTop: '60px', paddingBottom: '28px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Top gold accent line */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '200px', height: '1px',
        background: 'linear-gradient(90deg, transparent, #F5C842, transparent)',
      }} />

      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '40px', marginBottom: '48px',
        }}>

          {/* Brand */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div style={{
                width: '38px', height: '38px',
                background: 'linear-gradient(135deg, #F5C842, #D4A017)',
                borderRadius: '10px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#0A0A0A',
                fontWeight: 900, fontSize: '18px',
                boxShadow: '0 4px 14px rgba(245,200,66,.3)',
              }}>E</div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#F5F0E8' }} className="latin">EduPlatform</span>
            </Link>
            <p style={{ color: '#7A7060', lineHeight: 1.75, marginBottom: '22px', fontSize: '13.5px' }}>
              منصة تعليمية متخصصة في البرمجة والذكاء الاصطناعي — خبرة حقيقية ونتائج مُثبَتة.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[<FbIcon/>, <TgIcon/>, <IgIcon/>, <YtIcon/>].map((icon, i) => (
                <a key={i} href="#" style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(245,200,66,.06)',
                  border: '1px solid rgba(245,200,66,.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#7A7060', transition: 'all .2s',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.color = '#F5C842';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(245,200,66,.12)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,200,66,.30)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.color = '#7A7060';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(245,200,66,.06)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,200,66,.15)';
                    (e.currentTarget as HTMLElement).style.transform = 'none';
                  }}
                >{icon}</a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F5C842', marginBottom: '18px', letterSpacing: '.04em' }}>
              روابط سريعة
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[['/', 'الرئيسية'], ['/catalog', 'الكورسات'], ['/login', 'تسجيل الدخول'], ['/register', 'إنشاء حساب']].map(([to, label]) => (
                <Link key={to} to={to} style={S.link} onMouseEnter={hoverGold} onMouseLeave={hoverDim}>{label}</Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F5C842', marginBottom: '18px', letterSpacing: '.04em' }}>
              تواصل معنا
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { icon: <MailIcon />, text: 'support@eduplatform.com' },
                { icon: <PhoneIcon />, text: '+20 155 829 8481', dir: 'ltr' },
                { icon: <MapIcon />,  text: 'القاهرة — الجيزة — أونلاين' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#7A7060', fontSize: '13.5px' }}>
                  <span style={{ color: '#F5C842', flexShrink: 0 }}>{item.icon}</span>
                  <span dir={item.dir}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(245,200,66,.08)',
          paddingTop: '22px',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '12px',
        }}>
          <span style={{ color: '#7A7060', fontSize: '13px' }}>
            © 2026 EduPlatform. جميع الحقوق محفوظة.
          </span>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['الخصوصية', 'الشروط والأحكام'].map(label => (
              <a key={label} href="#" style={{ color: '#7A7060', fontSize: '12.5px', transition: 'color .2s' }}
                onMouseEnter={hoverGold} onMouseLeave={hoverDim}>{label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
