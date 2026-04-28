"use client";

import { useState } from "react";

const NAV_LINKS = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "About", href: "/about" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        .nav-wrapper {
          position: sticky;
          top: 16px;
          z-index: 100;
          padding: 0 16px;
        }
        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 68px;
          padding: 0 28px;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04);
          max-width: 1280px;
          margin: 0 auto;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        .nav-logo-icon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: linear-gradient(135deg, #0f766e, #0d9488);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 14px;
          letter-spacing: 0.5px;
          box-shadow: 0 6px 20px rgba(15,118,110,0.35);
        }
        .nav-logo-text {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.5px;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 36px;
          list-style: none;
        }
        .nav-links a {
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
          text-decoration: none;
          transition: color 0.2s;
        }
        .nav-links a:hover {
          color: #0f766e;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .nav-login {
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px 14px;
          border-radius: 10px;
          transition: color 0.2s, background 0.2s;
        }
        .nav-login:hover {
          color: #0f172a;
          background: #f1f5f9;
        }
        .nav-cta {
          font-size: 14px;
          font-weight: 700;
          color: white;
          background: #0f172a;
          border: none;
          cursor: pointer;
          padding: 10px 22px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .nav-cta:hover {
          background: #0f766e;
          box-shadow: 0 8px 24px rgba(15,118,110,0.3);
          transform: translateY(-1px);
        }
        .nav-hamburger {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          color: #334155;
        }
        .nav-hamburger:hover {
          background: #f1f5f9;
        }
        .mobile-menu {
          position: fixed;
          top: 100px;
          left: 16px;
          right: 16px;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.12);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 99;
          animation: slideDown 0.2s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mobile-menu a {
          display: block;
          padding: 12px 16px;
          font-size: 15px;
          font-weight: 600;
          color: #334155;
          text-decoration: none;
          border-radius: 12px;
          transition: background 0.2s, color 0.2s;
        }
        .mobile-menu a:hover {
          background: #f0fdfa;
          color: #0f766e;
        }
        .mobile-menu-cta {
          margin-top: 8px;
          padding: 14px 16px;
          font-size: 15px;
          font-weight: 700;
          color: white;
          background: #0f766e;
          border: none;
          cursor: pointer;
          border-radius: 14px;
          text-align: center;
          transition: background 0.2s;
        }
        .mobile-menu-cta:hover {
          background: #0d9488;
        }
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .nav-login { display: none; }
          .nav-cta { display: none; }
          .nav-hamburger { display: flex; }
        }
      `}</style>

      <div className="nav-wrapper">
        <div className="nav-inner">
          {/* Logo */}
          <a href="/" className="nav-logo">
            <div className="nav-logo-icon">PM</div>
            <span className="nav-logo-text">PassportAI</span>
          </a>

          {/* Desktop Nav Links */}
          <ul className="nav-links">
            {NAV_LINKS.map((link) => (
              <li key={link.name}>
                <a href={link.href}>{link.name}</a>
              </li>
            ))}
          </ul>

          {/* Desktop Actions */}
          <div className="nav-actions">
            <button className="nav-login">Log In</button>
            <button className="nav-cta">
              Get Started
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>

            {/* Hamburger */}
            <button
              className="nav-hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {NAV_LINKS.map((link) => (
            <a key={link.name} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.name}
            </a>
          ))}
          <button className="mobile-menu-cta">Get Started Free</button>
        </div>
      )}
    </>
  );
}
