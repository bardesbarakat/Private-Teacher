import React from 'react';

interface BeduLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showSlogan?: boolean;
}

const BeduLogo: React.FC<BeduLogoProps> = ({ size = 'sm', showSlogan = false }) => {
  const scale = { xs: 0.65, sm: 1, md: 1.35, lg: 1.8 }[size];

  const iconW  = Math.round(36 * scale);
  const nameFs = Math.round(18 * scale);
  const subFs  = Math.round(10 * scale);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(10 * scale), userSelect: 'none' }}>
      {/* ── Icon ── */}
      <svg
        width={iconW} height={iconW}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bg-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3B6EF8" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          <linearGradient id="b-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
          <linearGradient id="book-g" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#3B6EF8" />
          </linearGradient>
        </defs>

        {/* Rounded square background */}
        <rect width="80" height="80" rx="18" fill="url(#bg-g)" />

        {/* Circuit traces */}
        <circle cx="10" cy="22" r="3" stroke="#60A5FA" strokeWidth="1.5" fill="none" opacity=".8" />
        <polyline points="13,22 20,22 20,18 26,18" stroke="#60A5FA" strokeWidth="1.5" fill="none" opacity=".8" />

        <circle cx="10" cy="30" r="3" stroke="#A5B4FC" strokeWidth="1.5" fill="none" opacity=".7" />
        <polyline points="13,30 20,30" stroke="#A5B4FC" strokeWidth="1.5" fill="none" opacity=".7" />

        <circle cx="10" cy="38" r="3" stroke="#818CF8" strokeWidth="1.5" fill="none" opacity=".65" />
        <polyline points="13,38 20,38 20,34 26,34" stroke="#818CF8" strokeWidth="1.5" fill="none" opacity=".65" />

        {/* Letter B */}
        <path
          d="M26 14 L26 46 L42 46 C49 46 54 42 54 36.5 C54 33 52 30.5 49 29 C51.5 27.5 53 25.5 53 22 C53 17.5 48.5 14 42 14 Z
             M32 20 L41 20 C44.5 20 47 22 47 25 C47 28 44.5 30 41 30 L32 30 Z
             M32 36 L42 36 C46 36 48 38 48 40.5 C48 43 46 45 42 45 L32 45 Z"
          fill="url(#b-g)"
        />

        {/* Open book */}
        <path d="M16 52 Q38 47 40 50 L40 65 Q38 62 16 66 Z" fill="url(#book-g)" opacity=".9" />
        <path d="M64 52 Q42 47 40 50 L40 65 Q42 62 64 66 Z" fill="#4F8EF7" opacity=".8" />
        <line x1="40" y1="50" x2="40" y2="65" stroke="rgba(255,255,255,.25)" strokeWidth="1.5" />
      </svg>

      {/* ── Wordmark ── */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{
          fontFamily: "'Space Grotesk', 'Cairo', sans-serif",
          fontWeight: 800,
          fontSize: nameFs,
          color: '#FFFFFF',
          letterSpacing: '-.03em',
        }} className="latin">BEDU</span>

        {showSlogan && (
          <span style={{
            fontSize: subFs,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            letterSpacing: '.01em',
            background: 'linear-gradient(90deg, #60A5FA, #818CF8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginTop: 3,
          } as React.CSSProperties}>
            Smart Learning.
          </span>
        )}
      </div>
    </div>
  );
};

export default BeduLogo;
