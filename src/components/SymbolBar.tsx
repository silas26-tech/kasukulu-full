import { useEffect, useState } from "react";
import { insertIntoAnswerField, installAnswerFieldTracking } from "../utils/answerField";

const MATHS = ["÷", "×", "−", "±", "√", "π", "²", "³", "^", "⁻¹", "°", "≤", "≥", "≠", "≈", "∠", "θ", "Δ", "∞", "½", "¼", "∴", "→", "(", ")"];
const SCIENCE = ["°C", "Ω", "µ", "Δ", "λ", "ρ", "→", "⇌", "⁺", "⁻", "²", "³", "₂", "₃", "₄", "×", "÷", "±", "π", "θ", "√"];

const SCIENCE_WORDS = /physic|chemist|biolog|science/i;

export function SymbolBar({ subject = "" }: { subject?: string }) {
  const [tab, setTab] = useState<"maths" | "science">(SCIENCE_WORDS.test(subject) ? "science" : "maths");
  const [hint, setHint] = useState(false);

  useEffect(() => {
    installAnswerFieldTracking();
  }, []);

  const symbols = tab === "maths" ? MATHS : SCIENCE;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5" role="group" aria-label="Symbols for your answer">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {(["maths", "science"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setTab(t)}
            className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer min-h-[36px] ${
              tab === t ? "bg-emerald-700 text-white" : "bg-white text-slate-600 border border-slate-300"
            }`}
          >
            {t === "maths" ? "Maths" : "Science"}
          </button>
        ))}
        <span className="shrink-0 w-px h-6 bg-slate-300 mx-0.5" aria-hidden="true" />
        {symbols.map((s) => (
          <button
            key={s}
            type="button"
            aria-label={`Insert ${s}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setHint(!insertIntoAnswerField(s))}
            className="shrink-0 min-w-[40px] min-h-[40px] px-2 rounded-lg bg-white border border-slate-300 text-base font-semibold text-slate-900 hover:bg-emerald-50 hover:border-emerald-500 cursor-pointer select-none"
          >
            {s}
          </button>
        ))}
      </div>
      {hint && (
        <p role="status" className="text-[11px] text-amber-800 mt-1">
          Tap inside your answer box first, then tap a symbol.
        </p>
      )}
    </div>
  );
}
