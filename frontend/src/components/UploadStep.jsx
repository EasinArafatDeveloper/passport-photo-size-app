"use client";

import { useCallback, useRef, useState } from "react";

const ACCEPT = "image/jpeg,image/jpg,image/png,image/webp";

export default function UploadStep({ onUpload, isLoading, progress }) {
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) {
        alert("Please select a JPEG, PNG, or WebP image.");
        return;
      }
      onUpload(file);
    },
    [onUpload]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  return (
    <>
      <style>{`
        .upload-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          min-height: 520px;
        }
        @media (max-width: 768px) {
          .upload-grid { grid-template-columns: 1fr; }
          .upload-left { border-right: none !important; border-bottom: 1px solid #e2e8f0; }
          .upload-left, .upload-right { padding: 32px 24px; }
        }
        @media (max-width: 640px) {
          .upload-left, .upload-right { padding: 24px 16px; }
          .upload-heading { font-size: 1.6rem; }
          .dropzone-title { font-size: 18px; }
        }

        /* LEFT PANEL */
        .upload-left {
          padding: 48px 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-right: 1px solid #e2e8f0;
          gap: 32px;
        }
        .upload-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          background: #ccfbf1;
          color: #0f766e;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          width: fit-content;
        }
        .upload-heading {
          font-size: 2rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
          letter-spacing: -0.025em;
          margin-top: 12px;
        }
        .upload-heading span { color: #0f766e; }
        .upload-desc {
          font-size: 15px;
          color: #64748b;
          line-height: 1.7;
          font-weight: 500;
          margin-top: 8px;
        }
        .upload-features {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 8px;
        }
        .upload-feature {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .upload-feature-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .upload-feature-icon.teal { background: #f0fdf9; color: #0f766e; }
        .upload-feature-icon.orange { background: #fff7ed; color: #ea580c; }
        .upload-feature h4 {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 3px;
        }
        .upload-feature p {
          font-size: 13px;
          color: #64748b;
          line-height: 1.5;
          font-weight: 500;
        }
        .upload-checklist {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px 24px;
        }
        .upload-checklist-title {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #94a3b8;
          margin-bottom: 14px;
        }
        .upload-checklist ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .upload-checklist li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
        }
        .check-icon {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #f0fdf9;
          color: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 10px;
          font-weight: 800;
        }

        /* RIGHT PANEL */
        .upload-right {
          padding: 48px 40px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .upload-right-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .step-badge {
          display: inline-flex;
          align-items: center;
          padding: 8px 16px;
          background: #0f172a;
          color: white;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          border-radius: 10px;
        }
        .accepts-label {
          text-align: right;
        }
        .accepts-label .label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #94a3b8;
        }
        .accepts-label .value {
          font-size: 12px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 2px;
        }

        /* UPLOAD ZONE */
        .upload-dropzone {
          flex: 1;
          border: 2px dashed rgba(15,118,110,0.25);
          border-radius: 20px;
          background: rgba(248,250,252,0.6);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 24px;
          cursor: pointer;
          transition: all 0.25s ease;
          min-height: 280px;
        }
        .upload-dropzone:hover {
          border-color: #0f766e;
          background: rgba(240,253,250,0.8);
          transform: translateY(-2px);
        }
        .upload-dropzone.drag-over {
          border-color: #0f766e;
          background: #f0fdf9;
          transform: scale(0.99);
        }
        .dropzone-icon {
          width: 72px; height: 72px;
          border-radius: 20px;
          background: #f0fdf9;
          color: #0f766e;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          transition: transform 0.3s;
          position: relative;
        }
        .upload-dropzone:hover .dropzone-icon { transform: scale(1.08); }
        .dropzone-ping {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          background: #0f766e;
          opacity: 0.15;
          animation: ping 1s ease-out infinite;
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.15; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .dropzone-title {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 8px;
        }
        .dropzone-sub {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          max-width: 280px;
          margin-bottom: 28px;
          font-weight: 500;
        }
        .dropzone-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .dz-btn-main {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 24px;
          background: #0f766e;
          color: white;
          font-size: 14px;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(15,118,110,0.3);
        }
        .dz-btn-main:hover { background: #0d5c56; transform: translateY(-1px); }
        .dz-btn-main:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .dz-btn-sec {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 20px;
          background: white;
          color: #334155;
          font-size: 14px;
          font-weight: 700;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .dz-btn-sec:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-1px); }
        .dz-btn-sec:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* PROGRESS */
        .upload-progress {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px 0 0;
        }
        .progress-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 700;
          color: #0f766e;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .progress-track {
          height: 6px;
          border-radius: 999px;
          background: #e2e8f0;
          overflow: hidden;
        }
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #0f766e, #10b981);
          border-radius: 999px;
          transition: width 0.5s ease;
        }
      `}</style>

      <div className="upload-grid">

        {/* ── LEFT: Info Panel ── */}
        <div className="upload-left">
          <div>
            <div className="upload-eyebrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Studio Setup
            </div>
            <h2 className="upload-heading">
              Upload your source <span>portrait.</span>
            </h2>
            <p className="upload-desc">
              One clear photo is all it takes. We&apos;ll handle the framing, background, and alignment automatically.
            </p>
          </div>

          <div className="upload-features">
            <div className="upload-feature">
              <div className="upload-feature-icon teal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div>
                <h4>Standard Framing</h4>
                <p>Precise head-to-shoulder ratio according to global regulations.</p>
              </div>
            </div>
            <div className="upload-feature">
              <div className="upload-feature-icon orange">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </div>
              <div>
                <h4>Dynamic Background</h4>
                <p>Instant removal and replacement with compliant backdrops.</p>
              </div>
            </div>
          </div>

          <div className="upload-checklist">
            <p className="upload-checklist-title">📋 Photo Checklist</p>
            <ul>
              {["Neutral expression, eyes open", "Direct light, no harsh shadows", "Plain background (optional)"].map((item) => (
                <li key={item}>
                  <span className="check-icon">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── RIGHT: Upload Zone ── */}
        <div className="upload-right">
          <div className="upload-right-header">
            <div className="step-badge">STEP 01</div>
            <div className="accepts-label">
              <div className="label">Accepted</div>
              <div className="value">JPG, PNG (MAX 10MB)</div>
            </div>
          </div>

          <div
            className={`upload-dropzone${dragOver ? " drag-over" : ""}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <div className="dropzone-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
              </svg>
              {dragOver && <span className="dropzone-ping" />}
            </div>

            <p className="dropzone-title">
              {dragOver ? "Drop to upload 🎯" : "Select or Drop Image"}
            </p>
            <p className="dropzone-sub">
              Drag your portrait here or click to browse your device files.
            </p>

            <div className="dropzone-buttons">
              <button
                className="dz-btn-main"
                onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                disabled={isLoading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="3" y2="15"/>
                </svg>
                Browse Files
              </button>
              <button
                className="dz-btn-sec"
                onClick={(e) => { e.stopPropagation(); cameraRef.current?.click(); }}
                disabled={isLoading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>
                </svg>
                Camera
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="upload-progress">
              <div className="progress-row">
                <span>Processing Image...</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-bar" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <input ref={fileRef} type="file" accept={ACCEPT} style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files?.[0])} />
      <input ref={cameraRef} type="file" accept={ACCEPT} capture="user" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files?.[0])} />
    </>
  );
}
