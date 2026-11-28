// A small, safe calculator engine (no eval). Used by the Calculator screen.

export type AngleMode = "DEG" | "RAD";

type Tok =
  | { t: "num"; v: number }
  | { t: "op"; v: "+" | "-" | "*" | "/" | "^" }
  | { t: "lp" }
  | { t: "rp" }
  | { t: "fn"; v: string }
  | { t: "const"; v: number }
  | { t: "post"; v: "!" | "%" | "²" }
  | { t: "sqrt" };

const FUNCS = ["asin", "acos", "atan", "sin", "cos", "tan", "log", "ln", "sqrt"];

function tokenize(src: string, ans: number): Tok[] {
  const s = src.replace(/\s+/g, "");
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const raw = s.slice(i, j);
      if ((raw.match(/\./g) ?? []).length > 1 || raw === ".") throw new Error("Syntax error");
      let v = parseFloat(raw);
      // scientific notation like 3E4 (only when E is followed by digits or a sign and digits)
      const m = /^[eE]([+-]?\d+)/.exec(s.slice(j));
      if (m && s[j] === "E") {
        v = v * Math.pow(10, parseInt(m[1], 10));
        j += m[0].length;
      }
      out.push({ t: "num", v });
      i = j;
      continue;
    }
    if (c === "+") out.push({ t: "op", v: "+" });
    else if (c === "-" || c === "−" || c === "–") out.push({ t: "op", v: "-" });
    else if (c === "×" || c === "*" || c === "x" || c === "X") out.push({ t: "op", v: "*" });
    else if (c === "÷" || c === "/") out.push({ t: "op", v: "/" });
    else if (c === "^") out.push({ t: "op", v: "^" });
    else if (c === "(") out.push({ t: "lp" });
    else if (c === ")") out.push({ t: "rp" });
    else if (c === "!") out.push({ t: "post", v: "!" });
    else if (c === "%") out.push({ t: "post", v: "%" });
    else if (c === "²") out.push({ t: "post", v: "²" });
    else if (c === "π") out.push({ t: "const", v: Math.PI });
    else if (c === "√") out.push({ t: "sqrt" });
    else {
      const rest = s.slice(i).toLowerCase();
      const fn = FUNCS.find((f) => rest.startsWith(f));
      if (fn) {
        out.push(fn === "sqrt" ? { t: "sqrt" } : { t: "fn", v: fn });
        i += fn.length;
        continue;
      }
      if (rest.startsWith("ans")) {
        out.push({ t: "const", v: ans });
        i += 3;
        continue;
      }
      if (rest.startsWith("pi")) {
        out.push({ t: "const", v: Math.PI });
        i += 2;
        continue;
      }
      if (c === "e" || c === "E") out.push({ t: "const", v: Math.E });
      else throw new Error("Syntax error");
    }
    i++;
  }
  return out;
}

function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0 || n > 170) throw new Error("Math error");
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}

export function evaluate(src: string, mode: AngleMode, ans = 0): number {
  // Close any open brackets automatically.
  let open = 0;
  for (const ch of src) {
    if (ch === "(") open++;
    else if (ch === ")") open = Math.max(0, open - 1);
  }
  const toks = tokenize(src + ")".repeat(open), ans);
  let p = 0;
  const toRad = (x: number) => (mode === "DEG" ? (x * Math.PI) / 180 : x);
  const fromRad = (x: number) => (mode === "DEG" ? (x * 180) / Math.PI : x);

  const startsFactor = (t?: Tok) =>
    !!t && (t.t === "num" || t.t === "lp" || t.t === "fn" || t.t === "const" || t.t === "sqrt");

  function expr(): number {
    let v = term();
    while (toks[p] && toks[p].t === "op" && ((toks[p] as any).v === "+" || (toks[p] as any).v === "-")) {
      const op = (toks[p++] as any).v;
      const r = term();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }
  function term(): number {
    let v = unary();
    for (;;) {
      const t = toks[p];
      if (t && t.t === "op" && (t.v === "*" || t.v === "/")) {
        p++;
        const r = unary();
        if (t.v === "/") {
          if (r === 0) throw new Error("Math error");
          v = v / r;
        } else v = v * r;
      } else if (startsFactor(t)) {
        v = v * unary(); // implicit multiplication: 2π, 3(4+1)
      } else break;
    }
    return v;
  }
  function unary(): number {
    const t = toks[p];
    if (t && t.t === "op" && (t.v === "-" || t.v === "+")) {
      p++;
      const v = unary();
      return t.v === "-" ? -v : v;
    }
    return power();
  }
  function power(): number {
    const base = postfix();
    const t = toks[p];
    if (t && t.t === "op" && t.v === "^") {
      p++;
      const e = unary();
      return Math.pow(base, e);
    }
    return base;
  }
  function postfix(): number {
    let v = primary();
    for (;;) {
      const t = toks[p];
      if (t && t.t === "post") {
        p++;
        if (t.v === "!") v = factorial(v);
        else if (t.v === "%") v = v / 100;
        else v = v * v;
      } else break;
    }
    return v;
  }
  function primary(): number {
    const t = toks[p++];
    if (!t) throw new Error("Syntax error");
    if (t.t === "num" || t.t === "const") return t.v;
    if (t.t === "lp") {
      const v = expr();
      if (!toks[p] || toks[p].t !== "rp") throw new Error("Syntax error");
      p++;
      return v;
    }
    if (t.t === "sqrt") {
      const v = toks[p] && toks[p].t === "lp" ? primary() : postfixNoPower();
      if (v < 0) throw new Error("Math error");
      return Math.sqrt(v);
    }
    if (t.t === "fn") {
      if (!toks[p] || toks[p].t !== "lp") throw new Error("Syntax error");
      p++;
      const a = expr();
      if (!toks[p] || toks[p].t !== "rp") throw new Error("Syntax error");
      p++;
      switch (t.v) {
        case "sin": return Math.sin(toRad(a));
        case "cos": return Math.cos(toRad(a));
        case "tan": {
          const cosv = Math.cos(toRad(a));
          if (Math.abs(cosv) < 1e-12) throw new Error("Math error");
          return Math.tan(toRad(a));
        }
        case "asin": if (a < -1 || a > 1) throw new Error("Math error"); return fromRad(Math.asin(a));
        case "acos": if (a < -1 || a > 1) throw new Error("Math error"); return fromRad(Math.acos(a));
        case "atan": return fromRad(Math.atan(a));
        case "log": if (a <= 0) throw new Error("Math error"); return Math.log10(a);
        case "ln": if (a <= 0) throw new Error("Math error"); return Math.log(a);
      }
    }
    throw new Error("Syntax error");
  }
  function postfixNoPower(): number {
    return primary();
  }

  const result = expr();
  if (p !== toks.length) throw new Error("Syntax error");
  if (!Number.isFinite(result)) throw new Error("Math error");
  return result;
}

/** Round to 12 significant digits to hide floating-point dust (sin 30 = 0.5). */
export function cleanNumber(n: number): number {
  if (n === 0) return 0;
  return parseFloat(n.toPrecision(12));
}

export function formatResult(n: number): string {
  const v = cleanNumber(n);
  const abs = Math.abs(v);
  if (abs !== 0 && (abs >= 1e12 || abs < 1e-9)) {
    const [m, e] = v.toExponential(9).split("e");
    return `${parseFloat(m)}×10^${parseInt(e, 10)}`;
  }
  return String(v);
}

/** Returns the formatted answer, or an error message. */
export function calculate(
  src: string,
  mode: AngleMode,
  ans = 0
): { ok: true; value: number; text: string } | { ok: false; error: string } {
  try {
    if (!src.trim()) return { ok: false, error: "" };
    const value = cleanNumber(evaluate(src, mode, ans));
    return { ok: true, value, text: formatResult(value) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Syntax error" };
  }
}
