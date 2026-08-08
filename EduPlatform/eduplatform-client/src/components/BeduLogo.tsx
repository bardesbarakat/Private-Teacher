import React from 'react';

interface BeduLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'horizontal';
  showSlogan?: boolean;
}

const sizes = {
  sm:  { icon: 32,  text: 16, slogan: 10 },
  md:  { icon: 44,  text: 22, slogan: 12 },
  lg:  { icon: 64,  text: 32, slogan: 14 },
  xl:  { icon: 100, text: 48, slogan: 16 },
};

// The BEDU "B" icon — circuit traces + open book
const BeduIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="BEDU Logo Icon"
  >
    <defs>
      <linearGradient id="bedu-grad-b" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#00C6FF" />
        <stop offset="50%"  stopColor="#4F8EF7" />
        <stop offset="100%" stopColor="#7B2FBE" />
      </linearGradient>
      <linearGradient id="bedu-grad-book" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor="#00C6FF" />
        <stop offset="100%" stopColor="#4F8EF7" />
      </linearGradient>
    </defs>

    {/* ── Circuit traces (left side of B) ── */}
    {/* Horizontal lines with circles */}
    <circle cx="8"  cy="20" r="3.5" stroke="#00C6FF" strokeWidth="2" fill="none" />
    <line   x1="11.5" y1="20" x2="32" y2="20" stroke="#00C6FF" strokeWidth="2" />

    <circle cx="8"  cy="32" r="3.5" stroke="#4F8EF7" strokeWidth="2" fill="none" />
    <line   x1="11.5" y1="32" x2="28" y2="32" stroke="#4F8EF7" strokeWidth="2" />

    <circle cx="8"  cy="44" r="3.5" stroke="#7B2FBE" strokeWidth="2" fill="none" />
    <line   x1="11.5" y1="44" x2="30" y2="44" stroke="#7B2FBE" strokeWidth="2" />

    {/* ── Letter B ── */}
    <path
      d="M32 14 L32 58 L52 58 C62 58 68 52 68 45 C68 40 65 36 60 34 C64 32 66 28 66 23 C66 17 61 14 52 14 Z
         M40 22 L50 22 C54 22 57 24 57 28 C57 32 54 34 50 34 L40 34 Z
         M40 42 L52 42 C57 42 60 44.5 60 49 C60 53.5 57 56 52 56 L40 56 Z"
      fill="url(#bedu-grad-b)"
    />

    {/* ── Open Book ── */}
    {/* Left page */}
    <path
      d="M18 62 Q35 56 50 60 L50 80 Q35 76 18 82 Z"
      fill="url(#bedu-grad-book)"
      opacity="0.85"
    />
    {/* Right page */}
    <path
      d="M82 62 Q65 56 50 60 L50 80 Q65 76 82 82 Z"
      fill="#4F8EF7"
      opacity="0.75"
    />
    {/* Book spine */}
    <line x1="50" y1="60" x2="50" y2="80" stroke="#0D1B4B" strokeWidth="2" />
    {/* Book bottom curve */}
    <path d="M18 82 Q50 86 82 82" stroke="#0D1B4B" strokeWidth="2" fill="none" />
  </svg>
);

// Full BEDU wordmark
const BeduWordmark: React.FC<{ fontSize: number }> = ({ fontSize }) => (
  <svg
    width={fontSize * 4.2}
    height={fontSize * 1.4}
    viewBox="0 0 210 70"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="BEDU"
  >
    <defs>
      <linearGradient id="bedu-underline" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor="#00C6FF" />
        <stop offset="50%"  stopColor="#4F8EF7" />
        <stop offset="100%" stopColor="#7B2FBE" />
      </linearGradient>
    </defs>
    {/* BEDU text */}
    <text
      x="0" y="52"
      fontFamily="'Space Grotesk', 'Cairo', sans-serif"
      fontWeight="800"
      fontSize="56"
      fill="#0D1B4B"
      letterSpacing="-1"
    >BEDU</text>
    {/* Gradient underline */}
    <rect x="0" y="60" width="210" height="4" rx="2" fill="url(#bedu-underline)" />
  </svg>
);

// ── Main Component ────────────────────────────────────────────────────────────
const BeduLogo: React.FC<BeduLogoProps> = ({
  size = 'md',
  variant = 'horizontal',
  showSlogan = false,
}) => {
  const s = sizes[size];

  if (variant === 'icon') {
    return <BeduIcon size={s.icon} />;
  }

  if (variant === 'full') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <BeduIcon size={s.icon * 1.5} />
        <BeduWordmark fontSize={s.text} />
        {showSlogan && (
          <div style={{ textAlign: 'center', marginTop: '4px' }}>
            <div style={{
              fontSize: `${s.slogan + 1}px`,
              color: '#334E68',
              fontWeight: 500,
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: '.02em',
            }}>Barakat Education Platform</div>
            <div style={{
              fontSize: `${s.slogan}px`,
              background: 'linear-gradient(90deg, #00C6FF, #4F8EF7, #7B2FBE)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
              marginTop: '3px',
              letterSpacing: '.05em',
            }}>Learn • Code • Grow</div>
          </div>
        )}
      </div>
    );
  }

  // horizontal (default) — icon + text side by side
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: `${s.icon * 0.25}px` }}>
      <BeduIcon size={s.icon} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
        <span style={{
          fontFamily: "'Space Grotesk', 'Cairo', sans-serif",
          fontWeight: 800,
          fontSize: `${s.text}px`,
          color: '#0D1B4B',
          letterSpacing: '-.5px',
        }}>BEDU</span>
        {showSlogan && (
          <span style={{
            fontSize: `${s.slogan}px`,
            background: 'linear-gradient(90deg, #00C6FF, #7B2FBE)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 600,
            fontFamily: "'Space Grotesk', sans-serif",
          }}>Learn • Code • Grow</span>
        )}
      </div>
    </div>
  );
};

export default BeduLogo;
