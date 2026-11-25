import { useEffect, useMemo, useState } from "react";
import { Copy, FileText, Share2, X } from "lucide-react";
import type { LearnerProfile, StudyProgress } from "../data/curriculum";
import { copyText, whatsappShareUrl } from "../utils/challenge";
import {
  PARENT_PHONE_KEY,
  buildReportText,
  buildWeeklyReport,
  normalizeZambianPhone,
  readExamHistory,
} from "../utils/parentReport";

interface ParentReportCardProps {
  profile: LearnerProfile;
  progress: StudyProgress;
}

function loadPhone(): string {
  try {
    return localStorage.getItem(PARENT_PHONE_KEY) ?? "";
  } catch {
    return "";
  }
}

function savePhone(value: string): void {
  try {
    if (value) localStorage.setItem(PARENT_PHONE_KEY, value);
    else localStorage.removeItem(PARENT_PHONE_KEY);
  } catch {
    // ignore
  }
}

export function ParentReportCard({ profile, progress }: ParentReportCardProps) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(loadPhone);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const report = useMemo(
    () => (open ? buildWeeklyReport(profile, progress, readExamHistory()) : null),
    [open, profile, progress]
  );
  const text = report ? buildReportText(report, window.location.origin) : "";
  const normalized = phone.trim() ? normalizeZambianPhone(phone) : null;
  const phoneInvalid = phone.trim().length > 0 && !normalized;

  return (
    <>
      <section
        aria-label="Share with your parent"
        className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-wrap items-center justify-between gap-3 shadow-2xs"
      >
        <div>
          <h2 className="text-sm font-bold text-slate-900">Show your parent your progress</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Send a short weekly report on WhatsApp. Parents love to see you studying.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer min-h-[44px]"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>My weekly report</span>
        </button>
      </section>

      {open && report && (
        <div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Weekly report for my parent"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white w-full sm:max-w-lg max-h-[92vh] sm:max-h-[88vh] rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 p-5 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">My weekly report</h2>
                <p className="text-xs text-slate-500 mt-0.5">{report.rangeLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Days studied", value: `${report.daysStudied}/7` },
                  { label: "Questions", value: String(report.questions) },
                  { label: "Correct", value: report.accuracy === null ? "-" : `${report.accuracy}%` },
                ].map((c) => (
                  <div key={c.label} className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <div className="text-lg font-bold text-slate-900 tabular-nums">{c.value}</div>
                    <div className="text-[11px] text-slate-500">{c.label}</div>
                  </div>
                ))}
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-700 mb-1.5">Message to send</div>
                <pre className="whitespace-pre-wrap break-words text-xs text-slate-800 bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 font-sans leading-relaxed">
                  {text}
                </pre>
              </div>

              <div>
                <label htmlFor="parent-phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Parent&apos;s WhatsApp number (optional)
                </label>
                <input
                  id="parent-phone"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0977 123 456"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {phoneInvalid
                    ? "That number does not look right. Use a Zambian mobile number like 0977 123 456."
                    : "Saved only on this phone. Leave it empty to choose who to send to in WhatsApp."}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex flex-wrap gap-2">
              <a
                href={whatsappShareUrl(text, normalized)}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={phoneInvalid}
                onClick={(e) => {
                  if (phoneInvalid) {
                    e.preventDefault();
                    return;
                  }
                  savePhone(normalized ?? "");
                }}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold min-h-[48px] ${
                  phoneInvalid ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                <Share2 className="w-4 h-4" />
                Send on WhatsApp
              </a>
              <button
                type="button"
                onClick={async () => setCopied(await copyText(text))}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm font-semibold hover:bg-slate-50 cursor-pointer min-h-[48px]"
              >
                <Copy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy message"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
