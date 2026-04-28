"use client";

import Image from "next/image";

const PRESETS = [
  { value: "standard",   label: "Standard",   detail: "35 × 45 mm", note: "Works for most passport formats." },
  { value: "bangladesh", label: "Bangladesh", detail: "35 × 45 mm", note: "Useful for NID, visa, and BMET style photos." },
  { value: "usa",        label: "USA",        detail: "51 × 51 mm", note: "Square crop for US passport and visa use cases." },
  { value: "uk",         label: "UK",         detail: "35 × 45 mm", note: "Softer head ratio tuned for the UK format." },
];

const BG_OPTIONS = [
  { value: "white",      label: "White",      color: "#ffffff" },
  { value: "light_blue", label: "Light Blue", color: "#b3d4f0" },
];

const COPY_OPTIONS = [4, 6, 8];

export default function ConfigStep({ config, setConfig, sourcePreview, onProcess, onBack }) {
  const update = (key, value) => setConfig((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <style>{`
        .cfg-grid {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 0;
          min-height: 600px;
        }
        @media (max-width: 900px) {
          .cfg-grid { grid-template-columns: 1fr; }
          .cfg-left  { border-right: none !important; border-bottom: 1px solid #e2e8f0; }
          .cfg-left, .cfg-right { padding: 32px 24px; }
        }
        @media (max-width: 640px) {
          .cfg-left, .cfg-right { padding: 24px 16px; }
          .cfg-heading { font-size: 1.5rem; }
          .cfg-actions { flex-direction: column; }
        }

        /* ── LEFT (Preview) ── */
        .cfg-left {
          padding: 40px 36px;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .cfg-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          background: #dbeafe;
          color: #2563eb;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          width: fit-content;
        }
        .cfg-heading {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.25;
          letter-spacing: -0.02em;
        }
        .cfg-heading span { color: #2563eb; }
        .cfg-desc {
          font-size: 14px;
          color: #64748b;
          line-height: 1.65;
          font-weight: 500;
        }

        /* Photo preview frame */
        .cfg-photo-frame {
          border-radius: 20px;
          overflow: hidden;
          border: 6px solid white;
          box-shadow: 0 16px 48px rgba(0,0,0,0.12);
          aspect-ratio: 4/5;
          background: #f1f5f9;
          position: relative;
          flex: 1;
        }
        .cfg-photo-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 12px;
          color: #94a3b8;
        }
        .cfg-photo-empty svg { opacity: 0.4; }
        .cfg-photo-empty p { font-size: 13px; font-weight: 600; }

        /* Summary bar */
        .cfg-summary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: #e2e8f0;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
        }
        .cfg-summary-item {
          background: white;
          padding: 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .cfg-summary-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94a3b8;
        }
        .cfg-summary-value {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          text-transform: capitalize;
        }

        /* ── RIGHT (Config) ── */
        .cfg-right {
          padding: 40px 36px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .cfg-right-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .cfg-step-badge {
          padding: 8px 16px;
          background: #2563eb;
          color: white;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          border-radius: 10px;
        }
        .cfg-step-title {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }

        /* Section label */
        .cfg-section-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94a3b8;
          margin-bottom: 12px;
        }

        /* Preset grid */
        .preset-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .preset-card {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px 16px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .preset-card:hover {
          border-color: rgba(37,99,235,0.4);
          box-shadow: 0 4px 12px rgba(37,99,235,0.1);
        }
        .preset-card.active {
          border-color: #2563eb;
          background: #eff6ff;
          box-shadow: 0 4px 16px rgba(37,99,235,0.15);
        }
        .preset-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .preset-name {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }
        .preset-check {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #2563eb;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
          flex-shrink: 0;
        }
        .preset-size {
          font-size: 11px;
          font-weight: 800;
          color: #2563eb;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .preset-note {
          font-size: 12px;
          color: #64748b;
          line-height: 1.4;
          font-weight: 500;
          margin-top: 4px;
        }

        /* Two-column options row */
        .cfg-options-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 600px) {
          .cfg-options-row { grid-template-columns: 1fr; }
        }

        /* BG color buttons */
        .bg-btns {
          display: flex;
          gap: 8px;
        }
        .bg-btn {
          flex: 1;
          height: 52px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.2s;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .bg-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .bg-btn.active { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }

        /* Copy count buttons */
        .copy-btns {
          display: flex;
          gap: 8px;
        }
        .copy-btn {
          flex: 1;
          height: 52px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          background: white;
          cursor: pointer;
          font-size: 16px;
          font-weight: 800;
          color: #94a3b8;
          transition: all 0.2s;
        }
        .copy-btn:hover { border-color: rgba(37,99,235,0.4); color: #2563eb; }
        .copy-btn.active {
          border-color: #2563eb;
          background: #eff6ff;
          color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
        }

        /* Action buttons */
        .cfg-actions {
          display: flex;
          gap: 12px;
          margin-top: 4px;
        }
        .cfg-btn-back {
          flex: 1;
          padding: 14px;
          background: white;
          color: #334155;
          font-size: 14px;
          font-weight: 700;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cfg-btn-back:hover { background: #f8fafc; border-color: #cbd5e1; }
        .cfg-btn-generate {
          flex: 2;
          padding: 14px;
          background: #2563eb;
          color: white;
          font-size: 14px;
          font-weight: 700;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(37,99,235,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .cfg-btn-generate:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(37,99,235,0.35);
        }

        /* Info notice */
        .cfg-notice {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px 20px;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          border-radius: 14px;
        }
        .cfg-notice-icon {
          width: 32px; height: 32px;
          border-radius: 10px;
          background: #ffedd5;
          color: #ea580c;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cfg-notice p {
          font-size: 13px;
          color: #9a3412;
          line-height: 1.6;
          font-weight: 500;
        }
        .cfg-notice strong { font-weight: 700; }
      `}</style>

      <div className="cfg-grid">

        {/* ── LEFT: Source Preview ── */}
        <div className="cfg-left">
          <div>
            <div className="cfg-eyebrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              Studio Preview
            </div>
            <h2 className="cfg-heading" style={{ marginTop: 12 }}>
              Review your <span>source portrait.</span>
            </h2>
            <p className="cfg-desc" style={{ marginTop: 8 }}>
              Ensure the head and shoulders are fully visible. The AI will crop precisely based on your chosen preset.
            </p>
          </div>

          <div className="cfg-photo-frame">
            {sourcePreview ? (
              <>
                <Image
                  src={sourcePreview}
                  alt="Source portrait"
                  fill
                  style={{ objectFit: "cover" }}
                />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.15), transparent)",
                  pointerEvents: "none"
                }} />
              </>
            ) : (
              <div className="cfg-photo-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
                <p>No image available</p>
              </div>
            )}
          </div>

          <div className="cfg-summary">
            <div className="cfg-summary-item">
              <span className="cfg-summary-label">Format</span>
              <span className="cfg-summary-value">
                {PRESETS.find(p => p.value === config.countryPreset)?.label}
                {" — "}
                {PRESETS.find(p => p.value === config.countryPreset)?.detail}
              </span>
            </div>
            <div className="cfg-summary-item">
              <span className="cfg-summary-label">Backdrop</span>
              <span className="cfg-summary-value">{config.bgColor.replace("_", " ")}</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Config Panel ── */}
        <div className="cfg-right">
          <div className="cfg-right-header">
            <div className="cfg-step-badge">STEP 02</div>
            <span className="cfg-step-title">Configure Output</span>
          </div>

          {/* Country Preset */}
          <div>
            <p className="cfg-section-label">Country Preset</p>
            <div className="preset-grid">
              {PRESETS.map((preset) => {
                const isActive = config.countryPreset === preset.value;
                return (
                  <button
                    key={preset.value}
                    onClick={() => update("countryPreset", preset.value)}
                    className={`preset-card${isActive ? " active" : ""}`}
                  >
                    <div className="preset-card-top">
                      <span className="preset-name">{preset.label}</span>
                      {isActive && <span className="preset-check">✓</span>}
                    </div>
                    <span className="preset-size">{preset.detail}</span>
                    <span className="preset-note">{preset.note}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Backdrop + Density */}
          <div className="cfg-options-row">
            <div>
              <p className="cfg-section-label">Backdrop Color</p>
              <div className="bg-btns">
                {BG_OPTIONS.map((opt) => {
                  const isActive = config.bgColor === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => update("bgColor", opt.value)}
                      className={`bg-btn${isActive ? " active" : ""}`}
                      style={{
                        background: opt.color,
                        color: opt.value === "white" ? "#0f172a" : "#1e3a5f",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="cfg-section-label">Sheet Density (copies)</p>
              <div className="copy-btns">
                {COPY_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => update("copies", n)}
                    className={`copy-btn${config.copies === n ? " active" : ""}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="cfg-actions">
            <button className="cfg-btn-back" onClick={onBack}>
              ← Start Over
            </button>
            <button className="cfg-btn-generate" onClick={onProcess}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Generate Passport Sheet
            </button>
          </div>

          {/* Notice */}
          <div className="cfg-notice">
            <div className="cfg-notice-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
              </svg>
            </div>
            <p>
              <strong>Note:</strong> Generating the sheet may take 5–10 seconds as our AI models prepare the crops and build the high-resolution PDF.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
