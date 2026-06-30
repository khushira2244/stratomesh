import './Header.css';

export default function Header() {
  return (
    <header className="header">

      {/* Left: Logo + Name */}
      <a className="header-logo" href="#">
        <img
          src="/logo.png"
          alt="StratoMesh logo"
          className="logo-icon"
        />
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
