"use client";

const STAGES = [
  { label: "Cleaning the source background",   note: "Preparing a clean portrait silhouette.",        threshold: 0  },
  { label: "Detecting the face and landmarks", note: "Reading the head position and alignment.",      threshold: 28 },
  { label: "Building the passport crop",       note: "Adjusting top gap, sides, and shoulder visibility.", threshold: 54 },
  { label: "Arranging the A4 sheet",           note: "Placing every print copy on the page.",        threshold: 74 },
  { label: "Creating the PDF",                 note: "Packaging the final export for download.",      threshold: 88 },
];

export default function ProcessStep({ progress }) {
  const activeIdx = STAGES.reduce(
    (acc, stage, idx) => (progress >= stage.threshold ? idx : acc),
    0
  );

  return (
    <>
      <style>{`
        .proc-shell {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.06);
        }
        .proc-grid {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          min-height: 520px;
        }
        @media (max-width: 860px) {
          .proc-grid { grid-template-columns: 1fr; }
          .proc-left { border-right: none !important; border-bottom: 1px solid #e2e8f0; }
        }

        /* ── LEFT ── */
        .proc-left {
          padding: 44px 36px;
          border-right: 1px solid #e2e8f0;
          background: linear-gradient(160deg, rgba(15,118,110,0.06) 0%, rgba(255,255,255,0) 70%);
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .proc-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
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
        .proc-dot-pulse {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #10b981;
          animation: proc-pulse 1.4s ease-in-out infinite;
        }
        @keyframes proc-pulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.5); opacity: 0.6; }
        }
        .proc-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.22;
          letter-spacing: -0.025em;
        }
        .proc-desc {
          font-size: 14px;
          color: #64748b;
          line-height: 1.7;
          font-weight: 500;
        }

        /* Spinner card */
        .proc-spinner-card {
          background: rgba(255,255,255,0.85);
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
        }
        .proc-spinner-ring {
          width: 72px; height: 72px;
          border-radius: 50%;
          border: 4px solid #e2e8f0;
          border-top-color: #0f766e;
          animation: proc-spin 0.9s linear infinite;
        }
        @keyframes proc-spin { to { transform: rotate(360deg); } }
        .proc-stage-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #0f766e;
        }
        .proc-stage-name {
          font-size: 17px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.3;
        }
        .proc-stage-note {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }

        /* Progress bar */
        .proc-progress-wrap {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .proc-progress-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 700;
          color: #475569;
        }
        .proc-progress-pct { color: #0f766e; }
        .proc-track {
          height: 8px;
          border-radius: 999px;
          background: #e2e8f0;
          overflow: hidden;
        }
        .proc-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #0f766e, #10b981);
          transition: width 0.55s ease;
        }

        /* ── RIGHT ── */
        .proc-right {
          padding: 44px 36px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .proc-stages-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94a3b8;
          margin-bottom: 4px;
        }
        .proc-stages-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* Stage row */
        .proc-stage-row {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 18px;
          border-radius: 14px;
          border: 1.5px solid #e2e8f0;
          background: white;
          transition: all 0.3s ease;
        }
        .proc-stage-row.active {
          border-color: #0f766e;
          background: #f0fdf9;
          box-shadow: 0 4px 14px rgba(15,118,110,0.12);
        }
        .proc-stage-row.done {
          border-color: #d1fae5;
          background: #f0fdf9;
        }

        /* Stage number badge */
        .proc-badge {
          width: 38px; height: 38px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          flex-shrink: 0;
          border: 2px solid #e2e8f0;
          background: white;
          color: #94a3b8;
          transition: all 0.3s;
        }
        .proc-badge.active {
          background: #0f766e;
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(15,118,110,0.3);
        }
        .proc-badge.done {
          background: #d1fae5;
          color: #059669;
          border-color: transparent;
        }
        .proc-stage-text h4 {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 3px;
        }
        .proc-stage-text p {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
          line-height: 1.4;
        }
      `}</style>

      <div className="proc-shell">
        <div className="proc-grid">

          {/* ── LEFT: Info + Spinner ── */}
          <div className="proc-left">
            <div>
              <div className="proc-eyebrow">
                <span className="proc-dot-pulse" />
                Processing
              </div>
              <h2 className="proc-title" style={{ marginTop: 14 }}>
                We are generating your final passport sheet now.
              </h2>
              <p className="proc-desc" style={{ marginTop: 10 }}>
                This stage usually takes a short moment while the app runs the crop logic, composes the print layout, and prepares the PDF export.
              </p>
            </div>

            <div className="proc-spinner-card">
              <div className="proc-spinner-ring" />
              <div>
                <p className="proc-stage-label">Current Stage</p>
                <p className="proc-stage-name" style={{ marginTop: 4 }}>
                  {STAGES[activeIdx]?.label}
                </p>
                <p className="proc-stage-note" style={{ marginTop: 4 }}>
                  {STAGES[activeIdx]?.note}
                </p>
              </div>

              <div className="proc-progress-wrap">
                <div className="proc-progress-row">
                  <span>Overall progress</span>
                  <span className="proc-progress-pct">{progress}%</span>
                </div>
                <div className="proc-track">
                  <div className="proc-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Stages List ── */}
          <div className="proc-right">
            <p className="proc-stages-label">Workflow Stages</p>
            <div className="proc-stages-list">
              {STAGES.map((stage, idx) => {
                const done   = idx < activeIdx || progress === 100;
                const active = idx === activeIdx && progress < 100;
                return (
                  <div
                    key={stage.label}
                    className={`proc-stage-row${done ? " done" : active ? " active" : ""}`}
                  >
                    <div className={`proc-badge${done ? " done" : active ? " active" : ""}`}>
                      {done ? "✓" : `0${idx + 1}`}
                    </div>
                    <div className="proc-stage-text">
                      <h4>{stage.label}</h4>
                      <p>{stage.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
