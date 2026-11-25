// Friendly challenges: a few quiz questions packed into a link that can be sent on
// WhatsApp. Nothing is stored on a server; the link itself carries the questions.

export interface ChallengeQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Challenge {
  from: string; // first name of the sender
  subject: string;
  score: number;
  total: number;
  questions: ChallengeQuestion[];
}

const MAX_QUESTIONS = 10;

export function firstName(name: string): string {
  const first = (name || "").trim().split(/\s+/)[0] ?? "";
  return first.slice(0, 20) || "A friend";
}

function clean(text: unknown, max: number): string {
  return String(text ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(data: string): string {
  const padded = data.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((data.length + 3) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeChallenge(c: Challenge): string {
  const compact = {
    f: c.from,
    s: c.subject,
    p: c.score,
    t: c.total,
    q: c.questions.map((q) => [q.question, q.options, q.correctIndex]),
  };
  return toBase64Url(JSON.stringify(compact));
}

/** Returns a safe Challenge, or null if the text is not a valid challenge. */
export function decodeChallenge(encoded: string | null | undefined): Challenge | null {
  if (!encoded || encoded.length > 12000) return null;
  try {
    const raw = JSON.parse(fromBase64Url(encoded));
    if (!raw || !Array.isArray(raw.q) || raw.q.length === 0 || raw.q.length > MAX_QUESTIONS) return null;
    const questions: ChallengeQuestion[] = [];
    for (const item of raw.q) {
      if (!Array.isArray(item) || item.length < 3) return null;
      const options = Array.isArray(item[1]) ? item[1].map((o: unknown) => clean(o, 150)) : [];
      const correctIndex = Number(item[2]);
      const question = clean(item[0], 400);
      if (!question || options.length !== 4 || options.some((o) => !o)) return null;
      if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) return null;
      questions.push({ question, options, correctIndex });
    }
    const total = questions.length;
    const score = Math.max(0, Math.min(total, Math.floor(Number(raw.p) || 0)));
    return {
      from: clean(raw.f, 20) || "A friend",
      subject: clean(raw.s, 60) || "Quiz",
      score,
      total,
      questions,
    };
  } catch {
    return null;
  }
}

export function buildChallengeUrl(c: Challenge, origin: string): string {
  return `${origin.replace(/\/$/, "")}/?c=${encodeChallenge(c)}`;
}

/** Reads ?c=... from the address bar (does not change the address). */
export function readChallengeFromUrl(): Challenge | null {
  try {
    return decodeChallenge(new URLSearchParams(window.location.search).get("c"));
  } catch {
    return null;
  }
}

/** Removes ?c=... from the address bar so a refresh does not reopen the challenge. */
export function clearChallengeFromUrl(): void {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has("c")) {
      url.searchParams.delete("c");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
  } catch {
    // ignore
  }
}

/** Picks n random questions (keeps the original order of the picked ones). */
export function pickQuestions<T>(list: T[], n: number): T[] {
  const idx = list.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx
    .slice(0, n)
    .sort((a, b) => a - b)
    .map((i) => list[i]);
}

export function whatsappShareUrl(text: string, phone?: string | null): string {
  const base = phone ? `https://wa.me/${phone}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(text)}`;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}
