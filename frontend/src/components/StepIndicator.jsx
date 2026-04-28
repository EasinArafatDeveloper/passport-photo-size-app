const STEPS = [
  { key: "upload", label: "Upload", note: "Add your portrait" },
  { key: "config", label: "Configure", note: "Choose the format" },
  { key: "process", label: "Process", note: "Generate the crop" },
  { key: "result", label: "Download", note: "Get the print PDF" },
];

const ORDER = ["upload", "config", "process", "result"];

export default function StepIndicator({ currentStep }) {
  const currentIdx = ORDER.indexOf(currentStep);

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3">
      {STEPS.map((step, idx) => {
        const status =
          idx < currentIdx ? "done" : idx === currentIdx ? "active" : "pending";

        return (
          <div key={step.key} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <div className="min-w-0 text-center sm:text-left">
              <div className="flex items-center justify-center gap-3 sm:justify-start">
                <div className={`step-dot ${status}`}>
                  {status === "done" ? "OK" : `0${idx + 1}`}
                </div>
                <div className="hidden min-w-0 sm:block">
                  <p
                    className={`text-sm font-extrabold ${
                      status === "active"
                        ? "text-[var(--text)]"
                        : status === "done"
                          ? "text-[var(--accent-strong)]"
                          : "text-[var(--text-soft)]"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="truncate text-xs text-[var(--text-soft)]">{step.note}</p>
                </div>
              </div>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-soft)] sm:hidden">
                {step.label}
              </p>
            </div>

            {idx < STEPS.length - 1 && (
              <div className={`step-link ${idx < currentIdx ? "active" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
