"use client";

import { useState } from "react";
import Image from "next/image";

const PRESET_LABELS = {
  standard:   "Standard 35 × 45 mm",
  bangladesh: "Bangladesh 35 × 45 mm",
  usa:        "USA 51 × 51 mm",
  uk:         "UK 35 × 45 mm",
};

const PRINT_TIPS = [
  "Print on A4 glossy or matte photo paper",
  "Set scale to 100% (Actual Size)",
  "Use high-quality print settings",
  "Cut carefully along the white guides",
];

export default function ResultStep({ previewUrl, downloadUrl, config, onReset }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!downloadUrl) return;
    setDownloading(true);
    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "passport_photos.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <style>{`
        .result-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          min-height: 580px;
        }
        @media (max-width: 900px) {
          .result-grid { grid-template-columns: 1fr; }
          .result-left { border-right: none !important; border-bottom: 1px solid #e2e8f0; }
          .result-left, .result-right { padding: 32px 24px; }
        }
        @media (max-width: 640px) {
          .result-left, .result-right { padding: 24px 16px; }
          .result-title { font-size: 1.5rem; }
          .result-config-bar { grid-template-columns: 1fr; }
          .result-header-row { flex-wrap: wrap; }
        }

        /* ── LEFT ── */
        .result-left {
          border-right: 1px solid #e2e8f0;
          padding: 40px 36px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Header row */
        .result-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .result-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 14px;
          border-radius: 999px;
          background: #dbeafe;
          color: #1e3a8a;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          width: fit-content;
          margin-bottom: 10px;
        }
        .result-check-circle {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
          flex-shrink: 0;
        }
        .result-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.25;
          letter-spacing: -0.02em;
        }
        .result-title span { color: #2563eb; }
        .result-desc {
          font-size: 14px;
          color: #64748b;
          line-height: 1.65;
          font-weight: 500;
          margin-top: 6px;
          max-width: 380px;
        }
        .result-dpi-badge {
          background: #eff6ff;
          border: 1px solid #a7f3d0;
          border-radius: 14px;
          padding: 12px 18px;
          text-align: center;
          flex-shrink: 0;
        }
        .result-dpi-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #2563eb;
        }
        .result-dpi-value {
          font-size: 20px;
          font-weight: 800;
          color: #1e3a8a;
          margin-top: 2px;
        }

        /* Preview frame */
        .result-preview-frame {
          border-radius: 20px;
          overflow: hidden;
          border: 6px solid white;
          box-shadow: 0 16px 48px rgba(0,0,0,0.12);
          background: #f1f5f9;
          position: relative;
          aspect-ratio: 210/297;
          width: 100%;
          max-width: 300px;
          margin: 0 auto;
        }
        .result-preview-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 10px;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 600;
          animation: result-pulse 1.5s ease-in-out infinite;
        }
        @keyframes result-pulse {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.5; }
        }

        /* Config summary bar */
        .result-config-bar {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1px;
          background: #e2e8f0;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
        }
        .result-config-item {
          background: white;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .result-config-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94a3b8;
        }
        .result-config-value {
          font-size: 12px;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── RIGHT ── */
        .result-right {
          padding: 40px 36px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Export card */
        .result-export-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
        }
        .result-step-badge {
          display: inline-flex;
          align-items: center;
          padding: 7px 14px;
          background: #2563eb;
          color: white;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          border-radius: 9px;
          width: fit-content;
        }
        .result-export-title {
          font-size: 1.4rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
        }
        .result-export-desc {
          font-size: 13px;
          color: #64748b;
          line-height: 1.6;
          font-weight: 500;
        }
        .result-btn-download {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 15px;
          background: #2563eb;
          color: white;
          font-size: 15px;
          font-weight: 700;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 6px 20px rgba(37,99,235,0.3);
        }
        .result-btn-download:hover {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(37,99,235,0.35);
        }
        .result-btn-download:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .result-btn-reset {
          width: 100%;
          padding: 13px;
          background: white;
          color: #334155;
          font-size: 14px;
          font-weight: 700;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .result-btn-reset:hover { background: #f8fafc; border-color: #cbd5e1; }

        /* Download spinner */
        .dl-spin {
          width: 18px; height: 18px;
          border-radius: 50%;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: white;
          animation: result-spin 0.8s linear infinite;
        }
        @keyframes result-spin { to { transform: rotate(360deg); } }

        /* Print tips card */
        .result-tips-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
        }
        .result-tips-title {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #2563eb;
          margin-bottom: 16px;
        }
        .result-tips-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .result-tip-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 12px;
        }
        .result-tip-num {
          width: 26px; height: 26px;
          border-radius: 8px;
          background: #dbeafe;
          color: #2563eb;
          font-size: 11px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .result-tip-text {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
        }
      `}</style>

      <div className="result-grid">

        {/* ── LEFT: Preview ── */}
        <div className="result-left">
          <div>
            <div className="result-status">
              <span className="result-check-circle">✓</span>
              Process Complete
            </div>
            <div className="result-header-row">
              <div>
                <h2 className="result-title">
                  Your passport sheet is <span>ready.</span>
                </h2>
                <p className="result-desc">
                  The high-resolution sheet has been generated. Download the PDF and print it on A4 photo paper.
                </p>
              </div>
              <div className="result-dpi-badge">
                <div className="result-dpi-label">Resolution</div>
                <div className="result-dpi-value">300 DPI</div>
              </div>
            </div>
          </div>

          {/* Preview image */}
          <div className="result-preview-frame">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Passport sheet preview"
                fill
                style={{ objectFit: "contain" }}
                unoptimized
              />
            ) : (
              <div className="result-preview-loading">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="3" y2="15"/>
                </svg>
                <span>Loading preview…</span>
              </div>
            )}
          </div>

          {/* Config summary */}
          <div className="result-config-bar">
            {[
              { label: "Preset",   value: PRESET_LABELS[config.countryPreset] },
              { label: "Backdrop", value: config.bgColor === "white" ? "White" : "Light Blue" },
              { label: "Copies",   value: `${config.copies} / A4` },
            ].map((item) => (
              <div key={item.label} className="result-config-item">
                <span className="result-config-label">{item.label}</span>
                <span className="result-config-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Export + Tips ── */}
        <div className="result-right">

          {/* Export card */}
          <div className="result-export-card">
            <div className="result-step-badge">FINAL STEP</div>
            <h3 className="result-export-title">Export your file</h3>
            <p className="result-export-desc">
              The PDF is optimized for standard home or professional printers. No further scaling is required.
            </p>

            <button
              className="result-btn-download"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <>
                  <span className="dl-spin" />
                  Preparing…
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="3" y2="15"/>
                  </svg>
                  Download PDF Sheet
                </>
              )}
            </button>

            <button className="result-btn-reset" onClick={onReset}>
              ↺ Generate Another Sheet
            </button>
          </div>

          {/* Print tips */}
          <div className="result-tips-card">
            <p className="result-tips-title">📋 Print Guidance</p>
            <div className="result-tips-list">
              {PRINT_TIPS.map((tip, i) => (
                <div key={i} className="result-tip-row">
                  <span className="result-tip-num">{i + 1}</span>
                  <span className="result-tip-text">{tip}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
