import { useEffect, useState } from "react";
import { ShieldCheck, X } from "lucide-react";
import {
  ECZ_DISCLAIMER_SHORT,
  LEGAL,
  PRIVACY_SECTIONS,
  TERMS_SECTIONS,
  type LegalSection,
} from "../data/legal";

export type LegalTab = "privacy" | "terms";

interface LegalModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

function Sections({ sections }: { sections: LegalSection[] }) {
  return (
    <div className="space-y-5">
      {sections.map((s) => (
        <section key={s.heading}>
          <h3 className="text-sm font-bold text-slate-900">{s.heading}</h3>
          {s.paragraphs?.map((p, i) => (
            <p key={i} className="text-sm text-slate-700 leading-relaxed mt-1.5">
              {p}
            </p>
          ))}
          {s.bullets && (
            <ul className="mt-1.5 space-y-1.5 list-disc pl-5 text-sm text-slate-700 leading-relaxed">
              {s.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

export function LegalModal({ open, onClose, initialTab = "privacy" }: LegalModalProps) {
  const [tab, setTab] = useState<LegalTab>(initialTab);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Privacy Policy and Terms"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-5 border-b border-slate-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {tab === "privacy" ? "Privacy Policy" : "Terms of Use"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Last updated {LEGAL.lastUpdated}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pt-4">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
            {(["privacy", "terms"] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tab === t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer min-h-[36px] ${
                  tab === t
                    ? "bg-emerald-700 text-white font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t === "privacy" ? "Privacy Policy" : "Terms of Use"}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed">
            {ECZ_DISCLAIMER_SHORT}
          </p>
        </div>

        <div className="p-5 overflow-y-auto">
          <Sections sections={tab === "privacy" ? PRIVACY_SECTIONS : TERMS_SECTIONS} />
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800 cursor-pointer min-h-[44px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
