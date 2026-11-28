import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BadgeCheck, CheckCircle2, Loader2, Target, Trophy } from "lucide-react";
import { ECZ_TOPICS, type LearnerProfile, type SyllabusTopic } from "../data/curriculum";
import { readJsonLoose } from "../utils/readJson";
import { SymbolBar } from "./SymbolBar";

const MASTERY_KEY = "kasukulu_topic_mastery_v1";
const PASSES_NEEDED = 3;

interface Mastery {
  mastered: boolean;
  attempts: number;
  best: number;
}

function loadMastery(): Record<string, Mastery> {
  try {
    return JSON.parse(localStorage.getItem(MASTERY_KEY) ?? "{}") ?? {};
  } catch {
    return {};
  }
}

function saveMastery(m: Record<string, Mastery>) {
  try {
    localStorage.setItem(MASTERY_KEY, JSON.stringify(m));
  } catch {
    // ignore
  }
}

interface DrillQuestion {
  stem: string;
  parts: Array<{ label: string; text: string; marks: number }>;
  totalMarks: number;
}

interface DrillResult {
  score: number;
  outOf: number;
  feedback: string;
  steps: string[];
  tip: string;
}

export function TopicDrill({ profile }: { profile: LearnerProfile }) {
  const gradeTopics = useMemo(
    () => ECZ_TOPICS.filter((t) => t.grade === profile.grade),
    [profile.grade]
  );
  const subjects = useMemo(() => Array.from(new Set(gradeTopics.map((t) => t.subject))), [gradeTopics]);
  const [subject, setSubject] = useState<string>(
    () => subjects.find((s) => /^mathematics$/i.test(s)) ?? subjects[0] ?? ""
  );
  const [mastery, setMastery] = useState(loadMastery);
  const [topic, setTopic] = useState<SyllabusTopic | null>(null);

  if (topic) {
    return (
      <DrillSession
        key={topic.id}
        topic={topic}
        profile={profile}
        onExit={() => {
          setMastery(loadMastery());
          setTopic(null);
        }}
      />
    );
  }

  const topics = gradeTopics.filter((t) => t.subject === subject);

  return (
    <section
      aria-label="Topic practice"
      className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 space-y-3.5"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
          <Target className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-900">Topic practice, one topic at a time</h2>
          <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
            Pick ONE topic, for example Quadratic equations. You get one exam-style question at a time, only
            from that topic. Pass {PASSES_NEEDED} in a row to master it.
          </p>
        </div>
      </div>

      {subjects.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {subjects.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSubject(s)}
              className={`px-3 py-2 rounded-full text-xs font-semibold min-h-[36px] cursor-pointer border ${
                s === subject
                  ? "bg-emerald-700 text-white border-emerald-700"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <ul className="grid gap-2 sm:grid-cols-2">
        {topics.map((t) => {
          const m = mastery[t.id];
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setTopic(t)}
                className="w-full text-left rounded-xl border border-slate-200 bg-white px-3.5 py-3 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer min-h-[56px]"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900 leading-snug">{t.title}</span>
                  {m?.mastered && (
                    <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 rounded-full px-2 py-0.5">
                      <BadgeCheck className="w-3.5 h-3.5" /> Mastered
                    </span>
                  )}
                </div>
                {m && !m.mastered && (
                  <div className="text-[11px] text-slate-500 mt-1">{m.attempts} tried so far</div>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function DrillSession({
  topic,
  profile,
  onExit,
}: {
  topic: SyllabusTopic;
  profile: LearnerProfile;
  onExit: () => void;
}) {
  const [question, setQuestion] = useState<DrillQuestion | null>(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<DrillResult | null>(null);
  const [loading, setLoading] = useState<"ask" | "check" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passes, setPasses] = useState(0);
  const [level, setLevel] = useState(1);
  const [mastered, setMastered] = useState(false);
  const previous = useRef<string[]>([]);
  const started = useRef(false);

  const post = async (payload: Record<string, unknown>) => {
    const res = await fetch("/api/tutor/topic-drill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, topicId: topic.id, ...payload }),
    });
    const data = await readJsonLoose(res);
    if (!res.ok || data?.error) throw new Error(data?.error || "The tutor is busy. Please try again.");
    return data;
  };

  const ask = async (nextLevel: number) => {
    setError(null);
    setLoading("ask");
    setResult(null);
    setAnswer("");
    try {
      const q = (await post({ mode: "ask", level: nextLevel, previous: previous.current })) as DrillQuestion;
      previous.current = [...previous.current, (q.parts[0]?.text ?? q.stem).slice(0, 150)];
      setQuestion(q);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void ask(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const check = async () => {
    if (!question || !answer.trim() || loading) return;
    setError(null);
    setLoading("check");
    try {
      const text =
        (question.stem ? question.stem + "\n" : "") +
        question.parts.map((p) => `${p.label} ${p.text} [${p.marks}]`).join("\n");
      const r = (await post({
        mode: "check",
        question: text,
        totalMarks: question.totalMarks,
        answer,
      })) as DrillResult;
      setResult(r);
      const passed = r.score / Math.max(1, r.outOf) >= 0.7;
      const nextPasses = passed ? passes + 1 : 0;
      setPasses(nextPasses);
      setLevel(passed ? Math.min(3, level + 1) : Math.max(1, level - 1));
      const all = loadMastery();
      const prev = all[topic.id] ?? { mastered: false, attempts: 0, best: 0 };
      const done = prev.mastered || nextPasses >= PASSES_NEEDED;
      all[topic.id] = {
        mastered: done,
        attempts: prev.attempts + 1,
        best: Math.max(prev.best, Math.round((r.score / Math.max(1, r.outOf)) * 100)),
      };
      saveMastery(all);
      if (nextPasses >= PASSES_NEEDED) setMastered(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const passed = result ? result.score / Math.max(1, result.outOf) >= 0.7 : false;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4" aria-label="Topic practice session">
      <button
        type="button"
        onClick={onExit}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer min-h-[36px]"
      >
        <ArrowLeft className="w-4 h-4" />
        Choose another topic
      </button>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900">{topic.title}</h3>
        <div className="flex items-center gap-1.5" aria-label={`${passes} of ${PASSES_NEEDED} passed in a row`}>
          {Array.from({ length: PASSES_NEEDED }).map((_, i) => (
            <span
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                i < passes ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
              }`}
            >
              {i < passes ? "✓" : i + 1}
            </span>
          ))}
          <span className="text-[11px] text-slate-500 ml-1">in a row · level {level}</span>
        </div>
      </div>

      {loading === "ask" && (
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Loader2 className="w-4 h-4 animate-spin" /> Preparing your question…
        </div>
      )}

      {question && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
          {question.stem && <p className="text-sm text-slate-800 leading-relaxed">{question.stem}</p>}
          {question.parts.map((p, i) => (
            <p key={i} className="text-sm text-slate-900 leading-relaxed">
              <span className="font-semibold text-slate-600">{p.label} </span>
              {p.text} <span className="text-[11px] text-slate-500">[{p.marks}]</span>
            </p>
          ))}
          <p className="text-[11px] text-slate-500">Total: {question.totalMarks} marks</p>
        </div>
      )}

      {question && !result && (
        <div className="space-y-2.5">
          <label htmlFor="drill-answer" className="text-xs font-semibold text-slate-700">
            Write your working and answers. Put each step on a new line.
          </label>
          <SymbolBar subject={topic.subject} />
          <textarea
            id="drill-answer"
            data-answer-field="true"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={6}
            maxLength={1800}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-600"
            placeholder={"(a) x² − 5x + 6 = 0\n(x − 2)(x − 3) = 0\nx = 2 or x = 3"}
          />
          <button
            type="button"
            onClick={() => void check()}
            disabled={!answer.trim() || loading !== null}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold min-h-[44px] disabled:opacity-50 cursor-pointer"
          >
            {loading === "check" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {loading === "check" ? "Marking…" : "Check my work"}
          </button>
        </div>
      )}

      {result && (
        <div className="space-y-3" aria-live="polite">
          <div
            className={`rounded-xl px-4 py-3 border ${
              passed ? "bg-emerald-50 border-emerald-200 text-emerald-950" : "bg-amber-50 border-amber-200 text-amber-950"
            }`}
          >
            <div className="text-sm font-bold">
              {result.score} out of {result.outOf} marks. {passed ? "Good work!" : "Not yet. You can do this."}
            </div>
            <p className="text-sm leading-relaxed mt-1">{result.feedback}</p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-800">Worked solution</div>
            <ol className="space-y-1.5">
              {result.steps.map((line, i) => (
                <li key={i} className="flex items-start gap-2.5 rounded-lg bg-white/80 border border-amber-200 px-3 py-2">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center tabular-nums">
                    {i + 1}
                  </span>
                  <span className="text-sm text-amber-950 leading-relaxed break-words min-w-0">
                    {line.replace(/^\s*(step\s*\d+\s*[:.)-]?|\d+[.)])\s*/i, "")}
                  </span>
                </li>
              ))}
            </ol>
            {result.tip && (
              <p className="text-xs text-amber-950 leading-relaxed pt-1">
                <strong className="font-semibold">Exam tip: </strong>
                {result.tip}
              </p>
            )}
          </div>

          {mastered ? (
            <div className="rounded-xl bg-emerald-700 text-white px-4 py-4 flex items-center gap-3">
              <Trophy className="w-6 h-6 text-amber-300 shrink-0" />
              <div className="text-sm leading-relaxed">
                <strong className="font-bold">You have mastered {topic.title}!</strong> You passed {PASSES_NEEDED} questions in a row.
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {!mastered && (
              <button
                type="button"
                onClick={() => void ask(passed ? Math.min(3, level) : Math.max(1, level))}
                disabled={loading !== null}
                className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold min-h-[44px] cursor-pointer disabled:opacity-50"
              >
                {passed ? "Next question" : "Try a similar question"}
              </button>
            )}
            <button
              type="button"
              onClick={onExit}
              className="px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50 min-h-[44px] cursor-pointer"
            >
              {mastered ? "Choose the next topic" : "Choose another topic"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 flex items-center justify-between gap-2">
          <span>{error}</span>
          {!question && (
            <button type="button" onClick={() => void ask(level)} className="font-semibold underline cursor-pointer">
              Try again
            </button>
          )}
        </div>
      )}
    </section>
  );
}
