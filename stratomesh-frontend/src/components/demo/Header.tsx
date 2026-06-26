import './Header.css';

export default function Header() {
  return (
    <header className="header">

      {/* Left: Logo + Name */}
      <a className="header-logo" href="#">
        <svg
          className="logo-icon"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="14" cy="14" r="13" stroke="#00C896" strokeWidth="1" />
          <circle cx="14" cy="14" r="4" fill="#00C896" opacity="0.9" />
          <line x1="14" y1="1"  x2="14" y2="7"  stroke="#00C896" strokeWidth="0.8" strokeOpacity="0.5" />
          <line x1="14" y1="21" x2="14" y2="27" stroke="#00C896" strokeWidth="0.8" strokeOpacity="0.5" />
          <line x1="1"  y1="14" x2="7"  y2="14" stroke="#00C896" strokeWidth="0.8" strokeOpacity="0.5" />
          <line x1="21" y1="14" x2="27" y2="14" stroke="#00C896" strokeWidth="0.8" strokeOpacity="0.5" />
          <line x1="4.5"  y1="4.5"  x2="8.5"  y2="8.5"  stroke="#00C896" strokeWidth="0.6" strokeOpacity="0.3" />
          <line x1="19.5" y1="19.5" x2="23.5" y2="23.5" stroke="#00C896" strokeWidth="0.6" strokeOpacity="0.3" />
          <line x1="23.5" y1="4.5"  x2="19.5" y2="8.5"  stroke="#00C896" strokeWidth="0.6" strokeOpacity="0.3" />
          <line x1="8.5"  y1="19.5" x2="4.5"  y2="23.5" stroke="#00C896" strokeWidth="0.6" strokeOpacity="0.3" />
        </svg>
        <span className="logo-name">
          Strato<span>Mesh</span>
        </span>
      </a>

      {/* Right: Tech logos */}
      <div className="header-right">
        <span className="powered-label">Powered by</span>

        {/* Vercel logo */}
        <div className="vercel-logo">
          <svg viewBox="0 0 60 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6 L11 20 L18 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <rect x="22" y="5" width="11" height="15" rx="5.5" stroke="white" strokeWidth="2.2" fill="none" />
            <line x1="37" y1="4" x2="33" y2="24" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        <div className="tech-divider" />

        {/* AWS logo */}
        <div className="aws-logo">
          <svg viewBox="0 0 60 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="2" y="19" fontFamily="system-ui, sans-serif" fontSize="15" fontWeight="700" fill="white" letterSpacing="0.5">aws</text>
            <path d="M2 23 Q16 29 32 23" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M30 21 L33 23 L30 25" stroke="#FF9900" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
      </div>

    </header>
  );
}
