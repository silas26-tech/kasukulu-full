import { useEffect, useRef, useState } from "react";
import { calculate, type AngleMode } from "../utils/calcEngine";
import { insertIntoAnswerField, installAnswerFieldTracking } from "../utils/answerField";

type Key = { label: string; insert?: string; action?: string; wide?: boolean; tone?: "num" | "op" | "fn" | "eq" | "clear" };

const ROWS: Key[][] = [
  [
    { label: "sin", insert: "sin(", tone: "fn" },
    { label: "cos", insert: "cos(", tone: "fn" },
    { label: "tan", insert: "tan(", tone: "fn" },
    { label: "DEG", action: "mode", tone: "fn" },
    { label: "AC", action: "clear", tone: "clear" },
  ],
  [
    { label: "sin⁻¹", insert: "asin(", tone: "fn" },
    { label: "cos⁻¹", insert: "acos(", tone: "fn" },
    { label: "tan⁻¹", insert: "atan(", tone: "fn" },
    { label: "log", insert: "log(", tone: "fn" },
    { label: "ln", insert: "ln(", tone: "fn" },
  ],
  [
    { label: "x²", insert: "²", tone: "fn" },
    { label: "xʸ", insert: "^", tone: "fn" },
    { label: "√", insert: "√(", tone: "fn" },
    { label: "(", insert: "(", tone: "fn" },
    { label: ")", insert: ")", tone: "fn" },
  ],
  [
    { label: "7", insert: "7", tone: "num" },
    { label: "8", insert: "8", tone: "num" },
    { label: "9", insert: "9", tone: "num" },
    { label: "÷", insert: "÷", tone: "op" },
    { label: "⌫", action: "back", tone: "clear" },
  ],
  [
    { label: "4", insert: "4", tone: "num" },
    { label: "5", insert: "5", tone: "num" },
    { label: "6", insert: "6", tone: "num" },
    { label: "×", insert: "×", tone: "op" },
    { label: "π", insert: "π", tone: "fn" },
  ],
  [
    { label: "1", insert: "1", tone: "num" },
    { label: "2", insert: "2", tone: "num" },
    { label: "3", insert: "3", tone: "num" },
    { label: "−", insert: "−", tone: "op" },
    { label: "Ans", insert: "Ans", tone: "fn" },
  ],
  [
    { label: "0", insert: "0", tone: "num" },
    { label: ".", insert: ".", tone: "num" },
    { label: "%", insert: "%", tone: "fn" },
    { label: "+", insert: "+", tone: "op" },
    { label: "=", action: "equals", tone: "eq" },
  ],
];

const TONE: Record<NonNullable<Key["tone"]>, string> = {
  num: "bg-white text-slate-900 border-slate-300 hover:bg-slate-100",
  op: "bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200 font-bold",
  fn: "bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200 text-[13px]",
  eq: "bg-emerald-700 text-white border-emerald-800 hover:bg-emerald-800 font-bold",
  clear: "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 font-bold",
};

const OPERATORS = ["+", "−", "×", "÷", "^"];

export function Calculator({ compact = false }: { compact?: boolean }) {
  const [expr, setExpr] = useState("");
  const [mode, setMode] = useState<AngleMode>("DEG");
  const [ans, setAns] = useState(0);
  const [shown, setShown] = useState<string | null>(null); // result after pressing =
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ e: string; r: string }>>([]);
  const boxRef = useRef<HTMLDivElement>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    installAnswerFieldTracking();
  }, []);

  const live = expr ? calculate(expr, mode, ans) : null;

  const insert = (text: string) => {
    setError(null);
    setExpr((prev) => {
      // After "=" a number starts a new sum; an operator continues from the answer.
      if (shown !== null) {
        setShown(null);
        if (OPERATORS.includes(text) || text === "²" || text === "%" || text === "^") return "Ans" + text;
        return text;
      }
      return prev + text;
    });
  };

  const press = (k: Key) => {
    if (k.insert !== undefined) return insert(k.insert);
    if (k.action === "clear") {
      setExpr("");
      setShown(null);
      setError(null);
    } else if (k.action === "back") {
      setError(null);
      if (shown !== null) {
        setShown(null);
        setExpr("");
        return;
      }
      setExpr((p) => {
        const m = /(asin\(|acos\(|atan\(|sin\(|cos\(|tan\(|log\(|ln\(|√\(|Ans)$/.exec(p);
        return m ? p.slice(0, -m[0].length) : p.slice(0, -1);
      });
    } else if (k.action === "mode") {
      setMode((m) => (m === "DEG" ? "RAD" : "DEG"));
    } else if (k.action === "equals") {
      if (!expr.trim()) return;
      const r = calculate(expr, mode, ans);
      if (r.ok) {
        setAns(r.value);
        setShown(r.text);
        setError(null);
        setHistory((h) => [{ e: expr, r: r.text }, ...h].slice(0, 5));
      } else {
        setError(r.error || "Syntax error");
      }
    }
  };

  // Desktop keyboard
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
      const k = ev.key;
      const map: Record<string, Key | undefined> = {};
      for (const row of ROWS) for (const key of row) map[key.label] = key;
      if (/^[0-9.]$/.test(k)) insert(k);
      else if (k === "+") insert("+");
      else if (k === "-") insert("−");
      else if (k === "*" || k === "x") insert("×");
      else if (k === "/") insert("÷");
      else if (k === "^") insert("^");
      else if (k === "(" || k === ")") insert(k);
      else if (k === "%") insert("%");
      else if (k === "!") insert("!");
      else if (k === "Enter" || k === "=") press({ label: "=", action: "equals" });
      else if (k === "Backspace") press({ label: "⌫", action: "back" });
      else if (k === "Escape") press({ label: "AC", action: "clear" });
      else return;
      ev.preventDefault();
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  });

  const mainText = shown !== null ? shown : expr || "0";

  return (
    <div
      ref={boxRef}
      tabIndex={0}
      aria-label="Scientific calculator"
      className={`rounded-2xl border border-slate-300 bg-slate-50 p-3 space-y-2.5 outline-none focus:ring-2 focus:ring-emerald-500 ${
        compact ? "max-w-xs" : "max-w-sm"
      } w-full`}
    >
      <div className="rounded-xl bg-white border border-slate-300 px-3 py-2.5 min-h-[84px] flex flex-col justify-between" aria-live="polite">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-semibold">{mode}</span>
          <span>{shown !== null ? expr : ""}</span>
        </div>
        <div className="text-right text-2xl font-semibold text-slate-900 break-all tabular-nums leading-tight">{mainText}</div>
        <div className={`text-right text-sm tabular-nums h-5 ${error ? "text-red-700 font-semibold" : "text-slate-500"}`}>
          {error ? error : shown === null && live && live.ok ? `= ${live.text}` : ""}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {ROWS.flat().map((k, i) => (
          <button
            key={i}
            type="button"
            onClick={() => press(k)}
            aria-label={k.label === "⌫" ? "Delete" : k.label === "AC" ? "Clear all" : k.label}
            className={`min-h-[44px] rounded-lg border text-base cursor-pointer select-none active:scale-95 transition-transform ${TONE[k.tone ?? "num"]}`}
          >
            {k.action === "mode" ? mode : k.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: "e", insert: "e" },
          { label: "n!", insert: "!" },
          { label: "EXP", insert: "E" },
          { label: "Ans", insert: "Ans" },
        ].map((k) => (
          <button
            key={k.label}
            type="button"
            onClick={() => insert(k.insert)}
            className={`min-h-[40px] rounded-lg border text-[13px] cursor-pointer select-none ${TONE.fn}`}
          >
            {k.label}
          </button>
        ))}
      </div>

      {shown !== null && (
        <div className="space-y-1">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const text = shown.replace("×10^", "E");
              setNote(insertIntoAnswerField(text) ? `${shown} added to your answer pad.` : "Tap inside your answer box first, then press this button.");
            }}
            className="w-full min-h-[44px] rounded-lg border border-emerald-700 bg-white text-emerald-800 text-sm font-semibold hover:bg-emerald-50 cursor-pointer"
          >
            Put {shown} in my answer pad
          </button>
          {note && (
            <p role="status" className="text-[11px] text-slate-600">
              {note}
            </p>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-slate-500">Recent</div>
          {history.map((h, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setShown(null);
                setExpr(h.r);
              }}
              className="w-full text-left text-xs text-slate-700 bg-white border border-slate-200 rounded-md px-2.5 py-1.5 hover:bg-slate-100 cursor-pointer flex justify-between gap-2"
            >
              <span className="truncate">{h.e}</span>
              <span className="font-semibold tabular-nums shrink-0">= {h.r}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
