// Makes maths easy to read for learners:
//   12 / 3      -> 12 ÷ 3     (spaced slash = division; fractions like 3/4 are left alone)
//   x^2, 10^-3  -> x², 10⁻³   (powers raised, like in a textbook)
//   2 * 3       -> 2 × 3
//   \times, \div, sqrt(  -> ×, ÷, √(
// No imports, so both the server and the app can use it.

const SUPERSCRIPT: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  "+": "⁺", "-": "⁻", "−": "⁻", "=": "⁼", "(": "⁽", ")": "⁾",
  n: "ⁿ", i: "ⁱ", x: "ˣ", y: "ʸ", a: "ᵃ", b: "ᵇ", c: "ᶜ", d: "ᵈ",
  e: "ᵉ", k: "ᵏ", m: "ᵐ", p: "ᵖ", t: "ᵗ", r: "ʳ", s: "ˢ", z: "ᶻ",
};

function toSuperscript(text: string): string | null {
  let out = "";
  for (const ch of text.toLowerCase()) {
    const sup = SUPERSCRIPT[ch];
    if (!sup) return null;
    out += sup;
  }
  return out;
}

export function tidyMath(input: string): string {
  if (!input) return input;
  let s = input;

  s = s.replace(/\\times\b/g, "×").replace(/\\div\b/g, "÷").replace(/\\cdot\b/g, "×");
  s = s.replace(/\bsqrt\s*\(/g, "√(");

  // Powers: x^2, 10^-3, x^n, x^{n+1}, x^(n+1)
  s = s.replace(
    /\^\{([^}\s]{1,12})\}|\^\(([^)\s]{1,12})\)|\^([-+−]?\d+)|\^([a-z])(?![a-z])/gi,
    (match, braced?: string, paren?: string, digits?: string, letter?: string) => {
      const exponent = braced ?? paren ?? digits ?? letter ?? "";
      return toSuperscript(exponent) ?? match;
    }
  );

  // A slash with spaces on both sides is a division sign.
  s = s.replace(/(\S)[ \t]+\/[ \t]+(?=\S)/g, "$1 ÷ ");

  // Multiplication written with a star between numbers or letters.
  s = s.replace(/(?<=[\d)a-z])[ \t]\*[ \t](?=[\d(a-z])/gi, " × ");
  s = s.replace(/(?<=\d)\*(?=\d)/g, "×");

  return s;
}

/** Applies tidyMath to every string inside an object or array. */
export function tidyDeep<T>(value: T): T {
  if (typeof value === "string") return tidyMath(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => tidyDeep(v)) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = tidyDeep(v);
    }
    return out as T;
  }
  return value;
}

const SUPER_TO_PLAIN: Record<string, string> = Object.fromEntries(
  Object.entries(SUPERSCRIPT).map(([plain, sup]) => [sup, plain])
);

/** Turns symbols into words so the voice reads them properly. */
export function speakableMath(input: string): string {
  let s = input;
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿⁱˣʸᵃᵇᶜᵈᵉᵏᵐᵖᵗʳˢᶻ]+/g, (run) => {
    if (run === "²") return " squared";
    if (run === "³") return " cubed";
    const plain = [...run].map((c) => SUPER_TO_PLAIN[c] ?? "").join("");
    return ` to the power of ${plain.replace(/[-−]/g, "minus ")}`;
  });
  return s
    .replace(/÷/g, " divided by ")
    .replace(/×/g, " times ")
    .replace(/√/g, " square root of ")
    .replace(/\s+/g, " ")
    .trim();
}
