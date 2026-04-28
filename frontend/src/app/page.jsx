"use client";

import { useCallback, useState } from "react";
import ConfigStep from "@/components/ConfigStep";
import Header from "@/components/Header";
import ProcessStep from "@/components/ProcessStep";
import ResultStep from "@/components/ResultStep";
import StepIndicator from "@/components/StepIndicator";
import Toast from "@/components/Toast";
import UploadStep from "@/components/UploadStep";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [step, setStep] = useState("upload");
  const [sessionId, setSessionId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState(null);
  const [config, setConfig] = useState({
    copies: 6,
    bgColor: "white",
    countryPreset: "standard",
  });

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleUpload = useCallback(async (file) => {
    setIsLoading(true);
    setProgress(20);
    const reader = new FileReader();
    reader.onload = (e) => setSourcePreview(e.target?.result);
    reader.readAsDataURL(file);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API}/upload-image`, { method: "POST", body: form });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Upload failed"); }
      const data = await res.json();
      setSessionId(data.session_id);
      setProgress(100);
      showToast({ type: "success", message: "Image uploaded! Configure your passport photo next." });
      setTimeout(() => setStep("config"), 500);
    } catch (err) {
      showToast({ type: "error", message: err instanceof Error ? err.message : "Upload failed" });
    } finally { setIsLoading(false); setProgress(0); }
  }, [showToast]);

  const handleProcess = useCallback(async () => {
    if (!sessionId) return;
    setStep("process"); setIsLoading(true); setProgress(10);
    const interval = setInterval(() => { setProgress((p) => Math.min(p + 8, 88)); }, 600);
    try {
      const res = await fetch(`${API}/process-photo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, copies: parseInt(config.copies, 10) || 6, bg_color: config.bgColor || "white", country_preset: config.countryPreset || "standard" }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Processing failed"); }
      const data = await res.json();
      clearInterval(interval); setProgress(100);
      setPreviewUrl(`${API}${data.preview_url}?t=${Date.now()}`);
      setDownloadUrl(`${API}${data.download_url}`);
      showToast({ type: "success", message: "Passport sheet generated successfully!" });
      setTimeout(() => setStep("result"), 350);
    } catch (err) {
      clearInterval(interval);
      showToast({ type: "error", message: err instanceof Error ? err.message : "Processing failed" });
      setStep("config");
    } finally { setIsLoading(false); setProgress(0); }
  }, [config, sessionId, showToast]);

  const handleReset = useCallback(() => {
    setStep("upload"); setSessionId(null); setPreviewUrl(null);
    setSourcePreview(null); setDownloadUrl(null); setProgress(0);
  }, []);

  return (
    <div className="page-shell">
      <style>{`
        /* â”€â”€ Layout â”€â”€ */
        .main-wrapper {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        /* â”€â”€ Hero â”€â”€ */
        .hero {
          padding: 80px 24px 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .hero-content {
          max-width: 760px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 28px;
          position: relative;
          z-index: 2;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          background: white;
          border: 1px solid rgba(15,118,110,0.15);
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          color: #0f766e;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          box-shadow: 0 2px 12px rgba(15,118,110,0.1);
        }
        .hero-badge-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #10b981;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%,100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.7; }
        }
        .hero-title {
          font-family: 'Inter', sans-serif;
          font-size: clamp(2.6rem, 6vw, 4.5rem);
          font-weight: 900;
          line-height: 1.08;
          letter-spacing: -0.03em;
          color: #0f172a;
        }
        .hero-title span {
          color: #0f766e;
        }
        .hero-subtitle {
          font-size: 1.125rem;
          color: #64748b;
          max-width: 540px;
          line-height: 1.7;
          font-weight: 500;
        }
        .hero-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .hero-btn-main {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          background: #0f766e;
          color: white;
          font-size: 15px;
          font-weight: 700;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 6px 24px rgba(15,118,110,0.3);
        }
        .hero-btn-main:hover {
          background: #0d5c56;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(15,118,110,0.35);
        }
        .hero-btn-sec {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          background: white;
          color: #334155;
          font-size: 15px;
          font-weight: 700;
          border: 1.5px solid #e2e8f0;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .hero-btn-sec:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }
        .hero-trust {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
        }
        .hero-avatars {
          display: flex;
        }
        .hero-avatars img {
          width: 32px; height: 32px;
          border-radius: 50%;
          border: 2px solid white;
          margin-left: -8px;
          object-fit: cover;
        }
        .hero-avatars img:first-child { margin-left: 0; }
        /* Hero BG Blobs */
        .hero-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
          opacity: 0.5;
        }
        .hero-blob-1 { width: 500px; height: 500px; top: -150px; left: -100px; background: rgba(15,118,110,0.12); }
        .hero-blob-2 { width: 400px; height: 400px; top: -50px; right: -100px; background: rgba(251,146,60,0.1); }

        /* â”€â”€ Features â”€â”€ */
        .section { padding: 80px 24px; }
        .section-center { text-align: center; margin-bottom: 56px; }
        .section-eyebrow {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #0f766e;
          margin-bottom: 12px;
        }
        .section-title {
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.025em;
          line-height: 1.15;
        }
        .features-grid {
          display: grid;
          gap: 20px;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          max-width: 1100px;
          margin: 0 auto;
        }
        .feature-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 32px 28px;
          transition: all 0.25s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.08);
          border-color: rgba(15,118,110,0.2);
        }
        .feature-icon {
          width: 52px; height: 52px;
          border-radius: 16px;
          background: #f0fdf9;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 20px;
          transition: transform 0.3s;
        }
        .feature-card:hover .feature-icon { transform: scale(1.1) rotate(5deg); }
        .feature-card h3 { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
        .feature-card p { font-size: 14px; color: #64748b; line-height: 1.6; font-weight: 500; }

        /* â”€â”€ Steps â”€â”€ */
        .steps-section { padding: 80px 24px; background: white; }
        .steps-grid {
          display: grid;
          gap: 40px;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          max-width: 900px;
          margin: 0 auto;
          position: relative;
        }
        .steps-grid::before {
          content: '';
          position: absolute;
          top: 36px;
          left: 20%;
          right: 20%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
          display: none;
        }
        @media (min-width: 640px) { .steps-grid::before { display: block; } }
        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
        }
        .step-circle {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: #0f766e;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 0 8px 24px rgba(15,118,110,0.3);
          transition: transform 0.3s;
          border: 4px solid white;
        }
        .step-circle:hover { transform: scale(1.08) rotate(5deg); }
        .step-num {
          position: absolute;
          top: -6px; right: -6px;
          width: 24px; height: 24px;
          border-radius: 50%;
          background: #0f172a;
          color: white;
          font-size: 10px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }
        .step-item h4 { font-size: 16px; font-weight: 800; color: #0f172a; }

        /* â”€â”€ Workflow â”€â”€ */
        .workflow-section {
          padding: 40px 24px 100px;
          scroll-margin-top: 100px;
        }
        .workflow-header {
          margin-bottom: 40px;
          padding: 28px 32px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        /* â”€â”€ Footer â”€â”€ */
        .footer {
          border-top: 1px solid #e2e8f0;
          background: white;
          padding: 60px 24px;
        }
        .footer-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
        }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .footer-logo {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: #0f172a;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 13px;
        }
        .footer-brand-name {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.3px;
        }
        .footer-copy {
          font-size: 12px;
          color: #94a3b8;
          font-weight: 600;
          margin-top: 4px;
        }
        .footer-links {
          display: flex;
          gap: 28px;
        }
        .footer-links a {
          font-size: 13px;
          font-weight: 600;
          color: #94a3b8;
          transition: color 0.2s;
        }
        .footer-links a:hover { color: #0f766e; }
        .footer-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
      `}</style>

      <div className="main-wrapper">
        <Header />

        <main style={{ flex: 1 }}>

          {/* â”€â”€ HERO â”€â”€ */}
          <section className="hero">
            <div className="hero-blob hero-blob-1" />
            <div className="hero-blob hero-blob-2" />
            <div className="hero-content">
              <div className="hero-badge">
                <div className="hero-badge-dot" />
                AI-Powered Precision
              </div>

              <h1 className="hero-title">
                Create Passport Photos<br />
                <span>in Seconds</span>
              </h1>

              <p className="hero-subtitle">
                Professional, biometric-compliant passport photos from your smartphone. Auto background removal, face alignment & instant PDF download.
              </p>

              <div className="hero-buttons">
                <button
                  className="hero-btn-main"
                  onClick={() => document.getElementById("workflow-section")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="3" y2="15"/>
                  </svg>
                  Upload Photo Now
                </button>
                <button className="hero-btn-sec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Watch Demo
                </button>
              </div>

              <div className="hero-trust">
                <div className="hero-avatars">
                  <img src="https://i.pravatar.cc/100?img=1" alt="user" />
                  <img src="https://i.pravatar.cc/100?img=11" alt="user" />
                  <img src="https://i.pravatar.cc/100?img=5" alt="user" />
                </div>
                <span>Used by <strong style={{color:'#0f172a'}}>50,000+</strong> travelers this month</span>
              </div>
            </div>
          </section>

          {/* â”€â”€ FEATURES â”€â”€ */}
          <section className="section" id="features" style={{ background: '#f8fafc' }}>
            <div className="section-center">
              <p className="section-eyebrow">Our Capabilities</p>
              <h2 className="section-title">Built for Official Compliance</h2>
            </div>
            <div className="features-grid">
              {[
                { icon: "âœ¨", title: "Background Removal", desc: "Instantly swap any background for official white or light blue." },
                { icon: "ðŸ‘¤", title: "Perfect Face Alignment", desc: "AI centers your face and adjusts eye-level for strict regulations." },
                { icon: "ðŸ“", title: "Passport Size Presets", desc: "Supports 35Ã—45mm, 2Ã—2 inch, and all global standard sizes." },
                { icon: "ðŸ“„", title: "Instant Print-Ready PDF", desc: "Generates high-res A4 sheets with multiple copies for printing." },
              ].map((f, i) => (
                <div key={i} className="feature-card">
                  <div className="feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* â”€â”€ HOW IT WORKS â”€â”€ */}
          <section className="steps-section" id="how-it-works">
            <div className="section-center">
              <p className="section-eyebrow">Simple Process</p>
              <h2 className="section-title">Three Simple Steps</h2>
            </div>
            <div className="steps-grid">
              {[
                { num: "01", title: "Upload Photo", icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                  </svg>
                )},
                { num: "02", title: "AI Processes", icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>
                  </svg>
                )},
                { num: "03", title: "Download & Print", icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="3" y2="15"/>
                  </svg>
                )},
              ].map((s, i) => (
                <div key={i} className="step-item">
                  <div className="step-circle">
                    {s.icon}
                    <span className="step-num">{s.num}</span>
                  </div>
                  <h4>{s.title}</h4>
                </div>
              ))}
            </div>
          </section>
          {/* â”€â”€ WORKFLOW â”€â”€ */}
          <section className="workflow-section" id="workflow-section">
            {/* Step Header */}
            <div className="workflow-header">
              <StepIndicator currentStep={step} />
            </div>

            {step === "upload" && (
              <div className="surface-panel" style={{ overflow: 'hidden' }}>
                <UploadStep onUpload={handleUpload} isLoading={isLoading} progress={progress} />
              </div>
            )}
            {step === "config" && (
              <div className="surface-panel" style={{ overflow: 'hidden', padding: '40px' }}>
                <ConfigStep config={config} setConfig={setConfig} sourcePreview={sourcePreview} onBack={handleReset} onProcess={handleProcess} />
              </div>
            )}
            {step === "process" && <ProcessStep progress={progress} />}
            {step === "result" && (
              <div className="surface-panel" style={{ overflow: 'hidden', padding: '40px' }}>
                <ResultStep previewUrl={previewUrl} downloadUrl={downloadUrl} config={config} onReset={handleReset} />
              </div>
            )}
          </section>
        </main>

        {/* â”€â”€ FOOTER â”€â”€ */}
        <footer className="footer">
          <div className="footer-inner">
            <div>
              <div className="footer-brand">
                <div className="footer-logo">PM</div>
                <div>
                  <div className="footer-brand-name">PassportAI</div>
                  <div className="footer-copy">Â© {new Date().getFullYear()} Passport Photo Maker</div>
                </div>
              </div>
            </div>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Contact Us</a>
            </div>
            <div className="footer-badge">
              ðŸ”’ Encrypted & Secure
            </div>
          </div>
        </footer>
      </div>

      {toast && <Toast {...toast} />}
    </div>
  );
}
