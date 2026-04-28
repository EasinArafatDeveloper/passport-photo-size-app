import Header from "@/components/Header";
import Link from "next/link";

export const metadata = {
  title: "About Easin Arafat | Developer of Passportify",
  description: "Learn more about Easin Arafat, a full-stack developer and AI enthusiast from Bangladesh, and the creator of Passportify.",
  keywords: "Easin Arafat, Easin Arafat Developer, Full-stack developer Bangladesh, Passportify creator, React NextJS Developer Dhaka",
  openGraph: {
    title: "About Easin Arafat | Developer of Passportify",
    description: "Full-stack developer from Bangladesh building AI-powered tools.",
    url: "https://passport-size-photo-generate.scaleupweb.xyz/about",
  }
};

const SKILLS = [
  { name: 'Next.js', color: '#000000' },
  { name: 'React', color: '#61DAFB' },
  { name: 'Python', color: '#3776AB' },
  { name: 'FastAPI', color: '#009688' },
  { name: 'AI / ML', color: '#FF6F00' },
  { name: 'rembg', color: '#3b82f6' },
  { name: 'OpenCV', color: '#5C3EE8' },
  { name: 'MediaPipe', color: '#00BCD4' },
  { name: 'REST API', color: '#e11d48' },
  { name: 'Vanilla CSS', color: '#264de4' },
  { name: 'Git / GitHub', color: '#f05032' },
];

const TIMELINE = [
  {
    date: 'April 2026',
    title: 'Passportify Launched 🚀',
    desc: 'Full-stack AI passport photo generator built with Next.js frontend and Python FastAPI backend.',
  },
  {
    date: 'March 2026',
    title: 'AI Integration',
    desc: 'Integrated rembg for background removal, MediaPipe for face detection, and OpenCV for image processing.',
  },
  {
    date: 'Feb 2026',
    title: 'Started Learning AI/ML',
    desc: 'Began deep-diving into computer vision and AI model integration with Python.',
  },
  {
    date: '2025',
    title: 'Full-Stack Journey Begins',
    desc: 'Started building full-stack web applications with React, Next.js, and Node.js.',
  },
];

export default function AboutPage() {
  return (
    <>
      <style>{`
        .about-page {
          min-height: 100vh;
          background: #f8fafc;
        }

        /* ── HERO BANNER ── */
        .about-hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #0f3a35 100%);
          padding: 100px 24px 80px;
          position: relative;
          overflow: hidden;
          text-align: center;
        }
        .about-hero-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .about-hero-inner {
          position: relative;
          z-index: 2;
          max-width: 700px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        .about-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 16px;
          border-radius: 999px;
          background: rgba(59,130,246,0.15);
          border: 1px solid rgba(59,130,246,0.3);
          color: #3b82f6;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .about-avail-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #3b82f6;
          animation: avail-pulse 1.5s ease-in-out infinite;
        }
        @keyframes avail-pulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.6); opacity: 0.5; }
        }
        .about-hero h1 {
          font-size: clamp(2.2rem, 5vw, 3.5rem);
          font-weight: 900;
          color: white;
          letter-spacing: -0.03em;
          line-height: 1.12;
        }
        .about-hero h1 span { color: #3b82f6; }
        .about-hero-sub {
          font-size: 16px;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          font-weight: 500;
          max-width: 500px;
        }
        .about-hero-role {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          color: rgba(255,255,255,0.7);
        }
        .role-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.3); }

        /* ── MAIN CONTENT ── */
        .about-body {
          max-width: 1100px;
          margin: 0 auto;
          padding: 64px 24px 100px;
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 48px;
          align-items: start;
        }
        @media (max-width: 860px) {
          .about-body { grid-template-columns: 1fr; }
        }

        /* ── LEFT COLUMN ── */
        .about-left {
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: sticky;
          top: 100px;
        }
        @media (max-width: 860px) {
          .about-left { position: static; }
        }

        /* Avatar card */
        .avatar-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
          text-align: center;
        }
        .avatar-ring {
          width: 120px; height: 120px;
          border-radius: 50%;
          padding: 3px;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          box-shadow: 0 0 28px rgba(37,99,235,0.3);
        }
        .avatar-img {
          width: 100%; height: 100%;
          border-radius: 50%;
          background: #1e293b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          border: 3px solid white;
        }
        .avatar-name {
          font-size: 1.3rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
        }
        .avatar-title {
          font-size: 13px;
          color: #64748b;
          font-weight: 600;
        }
        .avatar-location {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #94a3b8;
          font-weight: 600;
        }
        .avatar-available {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: #eff6ff;
          border: 1px solid #a7f3d0;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          color: #1e3a8a;
        }

        /* Contact card */
        .contact-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .contact-card-title {
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94a3b8;
          margin-bottom: 4px;
        }
        .contact-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 12px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          transition: all 0.2s;
          border: 1.5px solid #e2e8f0;
          color: #334155;
          background: #f8fafc;
        }
        .contact-link:hover {
          background: #eff6ff;
          border-color: rgba(37,99,235,0.3);
          color: #2563eb;
          transform: translateX(3px);
        }
        .contact-icon {
          width: 32px; height: 32px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* ── RIGHT COLUMN ── */
        .about-right {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        /* Section card */
        .about-section-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
        }
        .about-section-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #2563eb;
          margin-bottom: 12px;
        }
        .about-section-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
          margin-bottom: 14px;
        }
        .about-bio-text {
          font-size: 15px;
          color: #475569;
          line-height: 1.8;
          font-weight: 400;
        }
        .about-bio-text strong { color: #0f172a; font-weight: 700; }
        .about-bio-text span { color: #2563eb; font-weight: 700; }

        /* Stats row */
        .about-stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #e2e8f0;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          margin-top: 20px;
        }
        .about-stat-box {
          background: #f8fafc;
          padding: 20px 16px;
          text-align: center;
        }
        .about-stat-num {
          font-size: 1.8rem;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.03em;
        }
        .about-stat-lbl {
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-top: 4px;
        }

        /* Skills */
        .skills-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 4px;
        }
        .skill-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 14px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          color: #334155;
          transition: all 0.2s;
          cursor: default;
        }
        .skill-pill:hover {
          background: #eff6ff;
          border-color: rgba(37,99,235,0.3);
          color: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(37,99,235,0.1);
        }
        .skill-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* Timeline */
        .timeline {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-top: 4px;
        }
        .timeline-item {
          display: flex;
          gap: 20px;
          padding-bottom: 28px;
          position: relative;
        }
        .timeline-item:last-child { padding-bottom: 0; }
        .timeline-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          flex-shrink: 0;
          width: 16px;
        }
        .timeline-dot {
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #2563eb;
          border: 2px solid white;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.2);
          flex-shrink: 0;
          margin-top: 4px;
        }
        .timeline-line {
          flex: 1;
          width: 2px;
          background: #e2e8f0;
          margin-top: 6px;
        }
        .timeline-item:last-child .timeline-line { display: none; }
        .timeline-date {
          font-size: 11px;
          font-weight: 800;
          color: #2563eb;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 4px;
        }
        .timeline-title {
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 6px;
        }
        .timeline-desc {
          font-size: 13px;
          color: #64748b;
          line-height: 1.6;
          font-weight: 500;
        }

        /* CTA */
        .about-cta-card {
          background: linear-gradient(135deg, #0f172a, #0f3a35);
          border-radius: 24px;
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
          overflow: hidden;
        }
        .cta-glow {
          position: absolute;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: rgba(37,99,235,0.2);
          filter: blur(60px);
          top: -80px; right: -60px;
          pointer-events: none;
        }
        .about-cta-card h3 {
          font-size: 1.4rem;
          font-weight: 800;
          color: white;
          letter-spacing: -0.02em;
          position: relative;
          z-index: 1;
        }
        .about-cta-card p {
          font-size: 14px;
          color: rgba(255,255,255,0.6);
          line-height: 1.6;
          position: relative;
          z-index: 1;
        }
        .cta-btns {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
          margin-top: 4px;
        }
        .cta-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: #2563eb;
          color: white;
          font-size: 14px;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(37,99,235,0.4);
          cursor: pointer;
        }
        .cta-btn-primary:hover {
          background: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(37,99,235,0.5);
        }
        .cta-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: rgba(255,255,255,0.08);
          color: white;
          font-size: 14px;
          font-weight: 700;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
        }
        .cta-btn-ghost:hover {
          background: rgba(255,255,255,0.14);
          transform: translateY(-1px);
        }
      `}</style>

      <div className="about-page">
        <Header />

        {/* ── HERO ── */}
        <section className="about-hero">
          <div className="about-hero-blob" style={{ width: 400, height: 400, top: -100, right: -100, background: 'rgba(37,99,235,0.15)' }} />
          <div className="about-hero-blob" style={{ width: 300, height: 300, bottom: -80, left: '5%', background: 'rgba(59,130,246,0.08)' }} />

          <div className="about-hero-inner">
            <div className="about-hero-eyebrow">
              <span className="about-avail-dot" />
              Available for Projects
            </div>

            <h1>
              Meet the <span>Developer</span><br />behind Passportify
            </h1>

            <p className="about-hero-sub">
              A passionate full-stack developer from Bangladesh, building AI-powered tools that make everyday tasks effortless.
            </p>

            <div className="about-hero-role">
              <span className="role-dot" />
              Full-Stack Developer
              <span className="role-dot" />
              AI Enthusiast
              <span className="role-dot" />
              Bangladesh 🇧🇩
            </div>
          </div>
        </section>

        {/* ── BODY ── */}
        <div className="about-body">

          {/* LEFT: Avatar + Contacts */}
          <div className="about-left">
            <div className="avatar-card">
              <div className="avatar-ring">
                <img src="https://i.postimg.cc/9fC6cZ6F/Easin-Arafat-CV-Photo.png" alt="Easin Arafat" className="avatar-img" style={{ objectFit: 'cover' }} />
              </div>
              <div>
                <div className="avatar-name">Easin Arafat</div>
                <div className="avatar-title" style={{ marginTop: 4 }}>Full-Stack Developer & AI Builder</div>
              </div>
              <div className="avatar-location">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                Dhaka, Bangladesh
              </div>
              <div className="avatar-available">
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
                Open to Opportunities
              </div>
            </div>

            {/* Contact links */}
            <div className="contact-card">
              <div className="contact-card-title">Connect with me</div>
              <a href="https://github.com/EasinArafatDeveloper" target="_blank" rel="noopener noreferrer" className="contact-link">
                <div className="contact-icon" style={{ background: '#f1f5f9' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#334155">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
                GitHub Profile
              </a>
              <a href="mailto:mdeasinarafat016456@gmail.com" className="contact-link">
                <div className="contact-icon" style={{ background: '#fef2f2' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                Send an Email
              </a>
              <a href="https://www.linkedin.com/in/easin-arafat-developer/" target="_blank" rel="noopener noreferrer" className="contact-link">
                <div className="contact-icon" style={{ background: '#eff6ff' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#2563eb">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>
                  </svg>
                </div>
                LinkedIn
              </a>
            </div>
          </div>

          {/* RIGHT: Content sections */}
          <div className="about-right">

            {/* About Me */}
            <div className="about-section-card">
              <p className="about-section-label">👋 About Me</p>
              <h2 className="about-section-title">Hi, I&apos;m Easin Arafat</h2>
              <p className="about-bio-text">
                I&apos;m a <strong>passionate full-stack developer</strong> from Bangladesh who loves building practical, AI-powered tools that solve real-world problems. I enjoy turning complex ideas into simple, beautiful, and functional web applications.
              </p>
              <p className="about-bio-text" style={{ marginTop: 14 }}>
                <strong>Passportify</strong> was my vision to make passport photo creation <span>fast, affordable, and accessible</span> for everyone — especially in Bangladesh where professional studio charges can be unnecessarily high. This project combines a modern <span>Next.js</span> frontend with a powerful <span>Python FastAPI</span> backend, using cutting-edge AI models for face detection and background removal.
              </p>
              <p className="about-bio-text" style={{ marginTop: 14 }}>
                I believe technology should be <strong>accessible to everyone</strong>, and I&apos;m always looking for ways to use my skills to make a positive impact in my community and beyond.
              </p>

              <div className="about-stats-row">
                {[
                  { num: '1+', lbl: 'Projects Built' },
                  { num: '5+', lbl: 'AI Tools Used' },
                  { num: '100%', lbl: 'Open Source ❤️' },
                ].map(s => (
                  <div key={s.lbl} className="about-stat-box">
                    <div className="about-stat-num">{s.num}</div>
                    <div className="about-stat-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="about-section-card">
              <p className="about-section-label">⚡ Tech Stack & Skills</p>
              <h2 className="about-section-title">Technologies I Work With</h2>
              <div className="skills-wrap">
                {SKILLS.map(skill => (
                  <span key={skill.name} className="skill-pill">
                    <span className="skill-dot" style={{ background: skill.color }} />
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="about-section-card">
              <p className="about-section-label">📅 Journey</p>
              <h2 className="about-section-title">My Development Story</h2>
              <div className="timeline" style={{ marginTop: 20 }}>
                {TIMELINE.map((item, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-left">
                      <div className="timeline-dot" />
                      <div className="timeline-line" />
                    </div>
                    <div>
                      <div className="timeline-date">{item.date}</div>
                      <div className="timeline-title">{item.title}</div>
                      <div className="timeline-desc">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="about-cta-card">
              <div className="cta-glow" />
              <h3>Want to collaborate or hire me?</h3>
              <p>I&apos;m open to freelance projects, internships, and full-time opportunities. Let&apos;s build something amazing together!</p>
              <div className="cta-btns">
                <a href="mailto:mdeasinarafat016456@gmail.com" className="cta-btn-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Get in Touch
                </a>
                <Link href="/" className="cta-btn-ghost">
                  ← Back to App
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
