import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Loader2,
  RotateCcw,
  Share2,
  Swords,
  Target,
  Timer,
  Trophy,
  XCircle,
} from "lucide-react";
import {
  ZAMBIAN_SUBJECTS_BY_GRADE,
  type LearnerProfile,
  type QuizQuestion,
  type WeaknessItem,
} from "../data/curriculum";
import { readJson } from "../utils/readJson";
import {
  buildChallengeUrl,
  copyText,
  firstName,
  pickQuestions,
  whatsappShareUrl,
  type Challenge,
} from "../utils/challenge";

interface ExamQuestion extends QuizQuestion {
  topic: string;
}

interface ExamPanelProps {
  profile: LearnerProfile;
  weaknesses: WeaknessItem[];
  onRecordQuizAnswer: (isCorrect: boolean, question?: QuizQuestion) => void;
  onAskTutorText: (prompt: string) => void;
  /** A challenge opened from a friend's WhatsApp link. */
  incomingChallenge?: Challenge | null;
  onChallengeHandled?: () => void;
}

type Mode = "mock" | "weak" | "challenge-send" | "challenge-play";

interface ChallengeMeta {
  from: string;
  score: number;
  total: number;
}
type Phase = "menu" | "loading" | "exam" | "results" | "error";

const RUN_KEY = "kasukulu_exam_run_v1";
const HISTORY_KEY = "kasukulu_exam_history_v1";

interface SavedRun {
  mode: Mode;
  subject: string;
  questions: ExamQuestion[];
  answers: Record<number, number>;
  endsAt: number | null; // epoch ms; null for untimed practice
  challenge?: ChallengeMeta | null;
}

interface HistoryItem {
  date: string;
  subject: string;
  mode: Mode;
  percentage: number;
  at?: number;
}

function loadRun(): SavedRun | null {
  try {
    const raw = localStorage.getItem(RUN_KEY);
    if (!raw) return null;
    const r = JSON.parse(raw) as SavedRun;
    if (!r || !Array.isArray(r.questions) || r.questions.length === 0) return null;
    return r;
  } catch {
    return null;
  }
}

function saveRun(run: SavedRun | null): void {
  try {
    if (run) localStorage.setItem(RUN_KEY, JSON.stringify(run));
    else localStorage.removeItem(RUN_KEY);
  } catch {
    // storage blocked: the exam still works, it just cannot be resumed
  }
}

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const list = raw ? (JSON.parse(raw) as HistoryItem[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function pushHistory(item: HistoryItem): HistoryItem[] {
  const next = [item, ...loadHistory()].slice(0, 10);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

function shuffleQuestion(q: ExamQuestion): ExamQuestion {
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    ...q,
    options: order.map((i) => q.options[i]),
    correctIndex: order.indexOf(q.correctIndex),
  };
}

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function verdict(pct: number): { label: string; tone: string } {
  if (pct >= 80) return { label: "Excellent work!", tone: "text-emerald-700" };
  if (pct >= 60) return { label: "Good effort. Keep going!", tone: "text-emerald-700" };
  if (pct >= 40) return { label: "You are getting there.", tone: "text-amber-700" };
  return { label: "Keep practising, you can improve.", tone: "text-red-700" };
}

export function ExamPanel({
  profile,
  weaknesses,
  onRecordQuizAnswer,
  onAskTutorText,
  incomingChallenge = null,
  onChallengeHandled,
}: ExamPanelProps) {
  const subjects = ZAMBIAN_SUBJECTS_BY_GRADE[profile.grade] ?? [];
  const [subject, setSubject] = useState<string>(subjects[0] ?? "");
  const [phase, setPhase] = useState<Phase>("menu");
  const [mode, setMode] = useState<Mode>("mock");
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory());
  const [resumable, setResumable] = useState<SavedRun | null>(() => loadRun());
  const [timedOut, setTimedOut] = useState(false);
  const [runLabel, setRunLabel] = useState<string>("");
  const [activeChallenge, setActiveChallenge] = useState<ChallengeMeta | null>(null);
  const [copied, setCopied] = useState(false);
  const submittedRef = useRef(false);
  const nextVariantRef = useRef(Math.floor(Math.random() * 3));

  // A learner who switches grade needs a subject from the new grade's list.
  useEffect(() => {
    if (!subjects.includes(subject)) setSubject(subjects[0] ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.grade]);

  // Keep the saved run up to date so a refresh does not lose the exam.
  useEffect(() => {
    if (phase !== "exam") return;
    saveRun({ mode, subject: runLabel, questions, answers, endsAt, challenge: activeChallenge });
  }, [phase, mode, runLabel, questions, answers, endsAt, activeChallenge]);

  const submit = (auto = false) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setTimedOut(auto);
    questions.forEach((q, i) => {
      const picked = answers[i];
      if (picked === undefined) return;
      onRecordQuizAnswer(picked === q.correctIndex, q);
    });
    const correct = questions.filter((q, i) => answers[i] === q.correctIndex).length;
    const pct = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    setHistory(
      pushHistory({
        date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        subject:
          mode === "weak"
            ? "Weak spots"
            : mode === "mock"
            ? runLabel
            : `Challenge: ${runLabel}`,
        mode,
        percentage: pct,
        at: Date.now(),
      })
    );
    saveRun(null);
    setResumable(null);
    setPhase("results");
  };

  // Countdown for timed papers. Uses the end time, so it stays right after a refresh.
  useEffect(() => {
    if (phase !== "exam" || endsAt === null) return;
    const tick = () => {
      const left = Math.round((endsAt - Date.now()) / 1000);
      setSecondsLeft(Math.max(0, left));
      if (left <= 0) submit(true);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, endsAt, questions, answers]);

  const begin = (
    nextMode: Mode,
    qs: ExamQuestion[],
    minutes: number | null,
    forSubject: string,
    challenge: ChallengeMeta | null = null
  ) => {
    submittedRef.current = false;
    setMode(nextMode);
    setRunLabel(nextMode === "weak" ? "Practice" : forSubject);
    setActiveChallenge(challenge);
    setCopied(false);
    if (nextMode === "mock" || nextMode === "challenge-send") setSubject(forSubject);
    setQuestions(qs);
    setAnswers({});
    setTimedOut(false);
    setEndsAt(minutes ? Date.now() + minutes * 60 * 1000 : null);
    setPhase("exam");
  };

  const startMock = async () => {
    if (!subject) return;
    setPhase("loading");
    setError(null);
    const variant = nextVariantRef.current;
    nextVariantRef.current = (variant + 1) % 3;
    try {
      const res = await fetch("/api/tutor/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, subject, variant }),
      });
      const data = await readJson(res);
      if (!res.ok || data?.error || !Array.isArray(data?.questions)) {
        throw new Error(data?.error || "The exam paper could not be prepared.");
      }
      begin(
        "mock",
        (data.questions as ExamQuestion[]).map(shuffleQuestion),
        Number(data.durationMinutes) || 20,
        subject
      );
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Could not reach Kasukulu. Check your connection and try again."
      );
      setPhase("error");
    }
  };

  // Make a 5-question challenge from a shared mock paper (costs nothing extra).
  const startChallengeSend = async () => {
    if (!subject) return;
    setPhase("loading");
    setError(null);
    try {
      const res = await fetch("/api/tutor/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, subject, variant: Math.floor(Math.random() * 3) }),
      });
      const data = await readJson(res);
      if (!res.ok || data?.error || !Array.isArray(data?.questions)) {
        throw new Error(data?.error || "The challenge could not be prepared.");
      }
      const five = pickQuestions(data.questions as ExamQuestion[], 5).map(shuffleQuestion);
      begin("challenge-send", five, null, subject);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Could not reach Kasukulu. Check your connection and try again."
      );
      setPhase("error");
    }
  };

  const acceptChallenge = () => {
    if (!incomingChallenge) return;
    const qs: ExamQuestion[] = incomingChallenge.questions.map((q) => ({
      ...q,
      explanation: "",
      topic: incomingChallenge.subject,
    }));
    begin("challenge-play", qs, null, incomingChallenge.subject, {
      from: incomingChallenge.from,
      score: incomingChallenge.score,
      total: incomingChallenge.total,
    });
    onChallengeHandled?.();
  };

  const startWeak = async () => {
    if (weaknesses.length === 0) return;
    setPhase("loading");
    setError(null);
    try {
      const res = await fetch("/api/tutor/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          items: weaknesses.slice(0, 8).map((w) => ({ title: w.title, prompt: w.prompt })),
        }),
      });
      const data = await readJson(res);
      if (!res.ok || data?.error || !Array.isArray(data?.questions)) {
        throw new Error(data?.error || "The practice set could not be prepared.");
      }
      begin("weak", (data.questions as ExamQuestion[]).map(shuffleQuestion), null, "Weak spots");
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Could not reach Kasukulu. Check your connection and try again."
      );
      setPhase("error");
    }
  };

  const resume = () => {
    if (!resumable) return;
    submittedRef.current = false;
    setMode(resumable.mode);
    setRunLabel(resumable.subject);
    setActiveChallenge(resumable.challenge ?? null);
    if (resumable.mode === "mock" || resumable.mode === "challenge-send") setSubject(resumable.subject);
    setQuestions(resumable.questions);
    setAnswers(resumable.answers ?? {});
    setEndsAt(resumable.endsAt);
    setTimedOut(false);
    setPhase("exam");
  };

  const answeredCount = Object.keys(answers).length;
  const correctCount = useMemo(
    () => questions.filter((q, i) => answers[i] === q.correctIndex).length,
    [questions, answers]
  );
  const pct = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;

  const byTopic = useMemo(() => {
    const map = new Map<string, { right: number; total: number }>();
    questions.forEach((q, i) => {
      const key = q.topic || "General";
      const row = map.get(key) ?? { right: 0, total: 0 };
      row.total += 1;
      if (answers[i] === q.correctIndex) row.right += 1;
      map.set(key, row);
    });
    return [...map.entries()]
      .map(([topic, v]) => ({ topic, ...v }))
      .sort((a, b) => a.right / a.total - b.right / b.total);
  }, [questions, answers]);

  // ---------------- Menu ----------------
  if (phase === "menu" || phase === "error") {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Exams &amp; practice</h2>
          <p className="mt-1 text-xs text-slate-600">
            Sit a timed mock paper, or practise the questions you keep getting wrong.
          </p>
        </div>

        {phase === "error" && error && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {incomingChallenge && (
          <section className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <Swords className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-950">
                  {incomingChallenge.from} challenged you!
                </h3>
                <p className="text-xs text-emerald-900 mt-0.5">
                  {incomingChallenge.subject}: {incomingChallenge.total} questions. Can you beat{" "}
                  {incomingChallenge.from}&apos;s score of {incomingChallenge.score}/{incomingChallenge.total}?
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={acceptChallenge}
              className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold cursor-pointer min-h-[48px]"
            >
              Accept the challenge
            </button>
          </section>
        )}

        {resumable && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-amber-900">
              You have an unfinished{" "}
              {resumable.mode === "weak"
                ? "practice set"
                : resumable.mode === "mock"
                ? "mock exam"
                : "challenge"}
              {resumable.mode !== "weak" ? ` in ${resumable.subject}` : ""}.
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={resume} className="px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold cursor-pointer min-h-[40px]">
                Continue
              </button>
              <button
                type="button"
                onClick={() => {
                  saveRun(null);
                  setResumable(null);
                }}
                className="px-4 py-2 rounded-lg bg-white border border-amber-300 text-amber-900 text-xs font-medium cursor-pointer min-h-[40px]"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Timed mock exam</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                15 multiple-choice questions across the whole subject in 20 minutes. You see your
                score and which topics to revise at the end.
              </p>
            </div>
          </div>
          <label className="block text-xs font-medium text-slate-700" htmlFor="exam-subject">
            Subject
          </label>
          <select
            id="exam-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void startMock()}
            disabled={!subject}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-sm font-semibold cursor-pointer min-h-[48px]"
          >
            <Timer className="w-4 h-4" />
            Start mock exam
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Practise my weak spots</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {weaknesses.length > 0
                  ? `8 fresh questions on topics you missed, like ${[...new Set(weaknesses.slice(0, 3).map((w) => w.title))].join(", ")}. No timer.`
                  : "Answer some quiz or lesson questions first. The ones you miss will appear here for practice."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void startWeak()}
            disabled={weaknesses.length === 0}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-sm font-semibold cursor-pointer min-h-[48px]"
          >
            <Target className="w-4 h-4" />
            Start practice
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Challenge a friend</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Answer 5 questions in {subject || "a subject"}, then send your score to a friend on
                WhatsApp. Can they beat you?
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void startChallengeSend()}
            disabled={!subject}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-sky-700 hover:bg-sky-800 disabled:opacity-40 text-white text-sm font-semibold cursor-pointer min-h-[48px]"
          >
            <Swords className="w-4 h-4" />
            Start a challenge
          </button>
        </section>

        {history.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-900">Recent results</h3>
            <ul className="mt-2 divide-y divide-slate-100">
              {history.map((h, i) => (
                <li key={i} className="flex items-center justify-between py-2 text-xs">
                  <span className="text-slate-700">
                    {h.subject} <span className="text-slate-400">· {h.date}</span>
                  </span>
                  <span className="font-bold tabular-nums text-slate-900">{h.percentage}%</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  // ---------------- Loading ----------------
  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 gap-3" role="status">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
        <p className="text-sm font-semibold text-slate-900">Preparing your paper…</p>
        <p className="text-xs text-slate-600 max-w-xs">
          The first time can take up to a minute while the tutor writes the questions.
        </p>
      </div>
    );
  }

  // ---------------- Exam ----------------
  if (phase === "exam") {
    const lowTime = endsAt !== null && secondsLeft <= 60;
    return (
      <div className="space-y-4">
        <div className="sticky top-0 z-10 -mx-1 px-1 py-2 bg-white/95 backdrop-blur border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-700">
            <span className="font-bold text-slate-900">{runLabel}</span>
            <span className="text-slate-500"> · {answeredCount}/{questions.length} answered</span>
          </div>
          {endsAt !== null && (
            <div
              aria-live="off"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold tabular-nums ${
                lowTime ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-900"
              }`}
            >
              <Timer className="w-4 h-4" />
              {formatClock(secondsLeft)}
            </div>
          )}
        </div>

        <ol className="space-y-5">
          {questions.map((q, qi) => (
            <li key={qi} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">
                <span className="text-slate-400 mr-1">{qi + 1}.</span>
                {q.question}
              </p>
              <div role="radiogroup" aria-label={`Question ${qi + 1}`} className="mt-3 space-y-2">
                {q.options.map((opt, oi) => {
                  const picked = answers[qi] === oi;
                  return (
                    <button
                      key={oi}
                      type="button"
                      role="radio"
                      aria-checked={picked}
                      onClick={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                      className={`w-full text-left px-3.5 py-3 rounded-xl border text-sm cursor-pointer min-h-[44px] transition-colors ${
                        picked
                          ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-medium"
                          : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-bold mr-2 text-slate-500">{"ABCD"[oi]}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-700">
            {answeredCount < questions.length
              ? `${questions.length - answeredCount} question${questions.length - answeredCount === 1 ? "" : "s"} still unanswered.`
              : "All questions answered."}
          </p>
          <button
            type="button"
            onClick={() => {
              if (
                answeredCount < questions.length &&
                !window.confirm(
                  `You have ${questions.length - answeredCount} unanswered question(s). Submit anyway?`
                )
              ) {
                return;
              }
              submit(false);
            }}
            className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold cursor-pointer min-h-[48px]"
          >
            Submit answers
          </button>
        </div>
      </div>
    );
  }

  // ---------------- Results ----------------
  const v = verdict(pct);
  const hasWeak = weaknesses.length > 0;
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <Trophy className="w-6 h-6" />
        </div>
        {timedOut && (
          <p className="text-xs font-semibold text-red-700">Time is up. Your answers were submitted.</p>
        )}
        <div className="text-4xl font-extrabold text-slate-900 tabular-nums">{pct}%</div>
        <div className="text-sm text-slate-700">
          {correctCount} of {questions.length} correct
        </div>
        <div className={`text-sm font-semibold ${v.tone}`}>{v.label}</div>
      </section>

      {(mode === "challenge-send" || mode === "challenge-play") && (() => {
        const mine = firstName(profile.name);
        const challengeToSend: Challenge = {
          from: mine,
          subject: runLabel,
          score: correctCount,
          total: questions.length,
          questions: questions.map((q) => ({
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
          })),
        };
        const link = buildChallengeUrl(challengeToSend, window.location.origin);
        const theirs = activeChallenge;
        const text =
          mode === "challenge-play" && theirs
            ? `🎯 I took ${theirs.from}'s ${runLabel} challenge on Kasukulu and scored ${correctCount}/${questions.length}. ${theirs.from} got ${theirs.score}/${theirs.total}. Think you can beat me? ${link}`
            : `🏆 I scored ${correctCount}/${questions.length} in ${runLabel} on Kasukulu! Can you beat me? Take my challenge: ${link}`;
        let headline = "Now challenge a friend!";
        if (mode === "challenge-play" && theirs) {
          headline =
            correctCount > theirs.score
              ? `You beat ${theirs.from}! 🎉 (${correctCount} to ${theirs.score})`
              : correctCount === theirs.score
              ? `It's a draw with ${theirs.from}! 🤝 (${correctCount} each)`
              : `${theirs.from} wins this time (${theirs.score} to ${correctCount}). Try again!`;
        }
        return (
          <section className="rounded-2xl border-2 border-sky-300 bg-sky-50 p-5 space-y-3">
            <h3 className="text-sm font-bold text-sky-950">{headline}</h3>
            <div className="flex flex-wrap gap-2">
              <a
                href={whatsappShareUrl(text)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold min-h-[48px]"
              >
                <Share2 className="w-4 h-4" />
                {mode === "challenge-play" ? "Challenge back on WhatsApp" : "Send on WhatsApp"}
              </a>
              <button
                type="button"
                onClick={async () => {
                  const done = await copyText(text);
                  setCopied(done);
                }}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-sky-300 text-sky-900 text-sm font-semibold hover:bg-sky-100 cursor-pointer min-h-[48px]"
              >
                <Copy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy message"}
              </button>
            </div>
          </section>
        );
      })()}

      {byTopic.length > 1 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-bold text-slate-900">By topic (weakest first)</h3>
          <ul className="mt-3 space-y-3">
            {byTopic.map((t) => {
              const share = Math.round((t.right / t.total) * 100);
              return (
                <li key={t.topic}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-800">{t.topic}</span>
                    <span className="tabular-nums text-slate-600">
                      {t.right}/{t.total}
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${share >= 60 ? "bg-emerald-600" : "bg-amber-500"}`}
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        {mode === "mock" && (
          <button
            type="button"
            onClick={() => setPhase("menu")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer min-h-[44px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Try another paper
          </button>
        )}
        {hasWeak && (
          <button
            type="button"
            onClick={() => void startWeak()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer min-h-[44px]"
          >
            <Target className="w-3.5 h-3.5" />
            Practise my weak spots
          </button>
        )}
        <button
          type="button"
          onClick={() => setPhase("menu")}
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-medium cursor-pointer min-h-[44px]"
        >
          Back to exams
        </button>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Review your answers</h3>
        {questions.map((q, qi) => {
          const picked = answers[qi];
          const right = picked === q.correctIndex;
          return (
            <article key={qi} className={`rounded-2xl border p-4 ${right ? "border-emerald-200 bg-emerald-50/40" : "border-red-200 bg-red-50/40"}`}>
              <div className="flex items-start gap-2">
                {right ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                )}
                <p className="text-sm font-semibold text-slate-900">
                  {qi + 1}. {q.question}
                </p>
              </div>
              <div className="mt-2 text-xs space-y-1 pl-6">
                <p className="text-slate-700">
                  Your answer:{" "}
                  <span className="font-semibold">
                    {picked === undefined ? "Not answered" : q.options[picked]}
                  </span>
                </p>
                {!right && (
                  <p className="text-emerald-800">
                    Correct answer: <span className="font-semibold">{q.options[q.correctIndex]}</span>
                  </p>
                )}
                {q.explanation && <p className="text-slate-600">{q.explanation}</p>}
                {!right && (
                  <button
                    type="button"
                    onClick={() =>
                      onAskTutorText(
                        `Please explain this exam question step by step and help me understand it: "${q.question}" The correct answer is "${q.options[q.correctIndex]}".`
                      )
                    }
                    className="mt-1 text-emerald-800 underline font-semibold cursor-pointer"
                  >
                    Ask my tutor to explain
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
