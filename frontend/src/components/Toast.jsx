"use client";

export default function Toast({ type, message }) {
  const isSuccess = type === "success";
  return (
    <>
      <style>{`
        .toast-wrapper {
          position: fixed;
          bottom: 28px;
          right: 24px;
          z-index: 9999;
          animation: toast-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .toast-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px 20px;
          border-radius: 18px;
          background: #0f172a;
          color: white;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          max-width: 360px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .toast-icon {
          width: 32px; height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 16px;
        }
        .toast-icon.success { background: rgba(16,185,129,0.2); color: #10b981; }
        .toast-icon.error   { background: rgba(239,68,68,0.2);  color: #ef4444; }
        .toast-label { font-weight: 700; margin-bottom: 2px; }
        .toast-msg   { font-weight: 500; color: rgba(255,255,255,0.7); font-size: 13px; line-height: 1.4; }
      `}</style>
      <div className="toast-wrapper">
        <div className="toast-box">
          <div className={`toast-icon ${isSuccess ? 'success' : 'error'}`}>
            {isSuccess ? "✓" : "!"}
          </div>
          <div>
            <p className="toast-label">{isSuccess ? "Success" : "Error"}</p>
            <p className="toast-msg">{message}</p>
          </div>
        </div>
      </div>
    </>
  );
}
