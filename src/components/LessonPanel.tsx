import { useEffect, useRef, useState } from "react";
import { readJsonLoose } from "../utils/readJson";
import { OfflineLessonsCard } from "./OfflineLessonsCard";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  Loader2,
  PenLine,
  RefreshCw,
  Volume2,
  WifiOff,
  XCircle,
} from "lucide-react";
import type {
  LearnerProfile,
  QuizQuestion,
  SyllabusTopic,
  TutorPersona,
} from "../data/curriculum";

interface LessonSection {
  heading: string;
  explanation: string;
  example: string;
  exampleSteps?: string[];
  keyPoint: string;
  checkQuestion?: string;
  checkAnswer?: string;
}

interface WrittenQuestion {
  question: string;
  maxMarks: number;
  markingPoints: string[];
  modelAnswer: string;
}

interface Lesson {
  title: string;
  objective: string;
  introduction: string;
  estimatedMinutes: number;
  sections: LessonSection[];
  summary: string[];
  mustKnow?: string[];
  examTip?: string;
  mcq: QuizQuestion[];
  written: WrittenQuestion[];
}

interface WrittenResult {
  id: string;
  score: number;
  maxMarks: number;
  feedback: string;
  modelAnswer: string;
}

type Phase = "idle" | "loading" | "reading" | "exercise" | "marking" | "results";

interface SavedProgress {
  phase: "reading" | "exercise";
  sectionIndex?: number;
  mcqAnswers: Record<number, number>;
  writtenAnswers: Record<number, string>;
}

interface SavedLesson {
  lesson: Lesson;
  savedAt: number;
  progress: SavedProgress | null;
}

interface LessonPanelProps {
  tutor: TutorPersona;
  profile: LearnerProfile;
  activeTopic: SyllabusTopic | null;
  customTopic: string;
  autoStart: boolean;
  onAutoStartHandled: () => void;
  onChooseAnotherTopic: () => void;
  onAskTutorText: (prompt: string) => void;
  onRecordQuizAnswer: (isCorrect: boolean, question?: QuizQuestion) => void;
  onSpeakText: (text: string, id: string) => void;
  speakingId: string | null;
}

// ---------- On-device storage (so lessons work offline and can be resumed) ----------
const STORE_PREFIX = "kasukulu_lesson_v2:";
const STORE_INDEX = "kasukulu_lesson_index_v2";
const MAX_SAVED_LESSONS = 40;

function isValidLesson(v: unknown): v is Lesson {
  const l = v as Lesson;
  return (
    !!l &&
    typeof l.title === "string" &&
    Array.isArray(l.sections) &&
    l.sections.length > 0 &&
    Array.isArray(l.mcq) &&
    Array.isArray(l.written) &&
    Array.isArray(l.summary)
  );
}

function readSaved(key: string): SavedLesson | null {
  try {
    const raw = localStorage.getItem(STORE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedLesson;
    return isValidLesson(parsed?.lesson) ? parsed : null;
  } catch {
    return null;
  }
}

function writeSaved(key: string, value: SavedLesson): void {
  try {
    localStorage.setItem(STORE_PREFIX + key, JSON.stringify(value));
    const index: string[] = JSON.parse(localStorage.getItem(STORE_INDEX) ?? "[]");
    const next = [key, ...index.filter((k) => k !== key)];
    for (const old of next.slice(MAX_SAVED_LESSONS)) {
      localStorage.removeItem(STORE_PREFIX + old);
    }
    localStorage.setItem(STORE_INDEX, JSON.stringify(next.slice(0, MAX_SAVED_LESSONS)));
  } catch {
    // Storage full or blocked: the lesson still works, it just won't be kept.
  }
}

// Models tend to put the right answer in the same slot. Shuffle so it can't be guessed by position.
function shuffleQuestion(q: QuizQuestion): QuizQuestion {
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

/** Steps for the worked example. New lessons send them; older saved lessons are split into lines. */
function stepsOf(sec: { example: string; exampleSteps?: string[] }): { problem: string; steps: string[] } {
  if (sec.exampleSteps && sec.exampleSteps.length > 0) {
    return { problem: sec.example, steps: sec.exampleSteps };
  }
  const lines = sec.example
    .split(/\n+/)
    .flatMap((l) => l.split(/(?<=[.;:])\s+(?=Step\s*\d|\d+[.)]\s)/i))
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length >= 3) return { problem: "", steps: lines };
  const sentences = sec.example
    .split(/(?<=[.!?])\s+/)
    .map((l) => l.trim())
    .filter(Boolean);
  return sentences.length >= 3
    ? { problem: sentences[0], steps: sentences.slice(1) }
    : { problem: "", steps: sentences.length ? sentences : [sec.example] };
}

function WorkedSteps({ sec }: { sec: { example: string; exampleSteps?: string[] } }) {
  const { problem, steps } = stepsOf(sec);
  return (
    <div className="space-y-2.5 min-w-0">
      {problem && <p className="text-sm font-semibold text-amber-950 leading-relaxed">{problem}</p>}
      <ol className="space-y-1.5">
        {steps.map((line, i) => {
          const text = line.replace(/^\s*(step\s*\d+\s*[:.)-]?|\d+[.)])\s*/i, "");
          return (
            <li key={i} className="flex items-start gap-2.5 rounded-lg bg-white/80 border border-amber-200 px-3 py-2">
              <span className="shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center tabular-nums">
                {i + 1}
              </span>
              <span className="text-sm text-amber-950 leading-relaxed break-words min-w-0">{text}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {text
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className={className ?? "text-sm text-slate-800 leading-relaxed"}>
            {p}
          </p>
        ))}
    </>
  );
}

export function LessonPanel({
  tutor,
  profile,
  activeTopic,
  customTopic,
  autoStart,
  onAutoStartHandled,
  onChooseAnotherTopic,
  onAskTutorText,
  onRecordQuizAnswer,
  onSpeakText,
  speakingId,
}: LessonPanelProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [lesson, setLesson] = useState<Lesson | null>(null);
  // The storage key the current lesson belongs to (so a topic switch can never save it under the wrong topic).
  const [lessonKey, setLessonKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedLesson | null>(null);
  // Taught one part at a time. The learner confirms they understood before moving on.
  const [sectionIndex, setSectionIndex] = useState(0);
  const [showCheckAnswer, setShowCheckAnswer] = useState(false);
  const readingTopRef = useRef<HTMLDivElement | null>(null);

  const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>({});
  const [writtenAnswers, setWrittenAnswers] = useState<Record<number, string>>({});
  const [confirmBlank, setConfirmBlank] = useState(false);

  const [writtenResults, setWrittenResults] = useState<WrittenResult[] | null>(null);
  const [markError, setMarkError] = useState<string | null>(null);
  const [submittedMcq, setSubmittedMcq] = useState<Record<number, number>>({});
  const [submittedWritten, setSubmittedWritten] = useState<Record<number, string>>({});

  const topicTitle =
    customTopic.trim() || activeTopic?.title || tutor.subjectFocus;
  const topicKey = `${activeTopic?.id ?? ""}|${customTopic.trim()}`;
  const storageKey = `${profile.grade}|${profile.languageAid ?? ""}|${topicKey}`;

  // A different topic means the old lesson no longer applies.
  useEffect(() => {
    setPhase("idle");
    setLesson(null);
    setError(null);
    setNotice(null);
    setSaved(readSaved(storageKey));
  }, [storageKey]);

  // Keep the lesson and the learner's unfinished work on the device.
  useEffect(() => {
    if (!lesson || !lessonKey) return;
    const progress: SavedProgress | null =
      phase === "reading" || phase === "exercise"
        ? { phase, sectionIndex, mcqAnswers, writtenAnswers }
        : null;
    writeSaved(lessonKey, { lesson, savedAt: Date.now(), progress });
  }, [lesson, lessonKey, phase, sectionIndex, mcqAnswers, writtenAnswers]);

  const clearAnswers = () => {
    setSectionIndex(0);
    setShowCheckAnswer(false);
    setMcqAnswers({});
    setWrittenAnswers({});
    setConfirmBlank(false);
    setWrittenResults(null);
    setMarkError(null);
  };

  const openSaved = (entry: SavedLesson, resume: boolean) => {
    clearAnswers();
    setLesson(entry.lesson);
    setLessonKey(storageKey);
    setError(null);
    if (resume && entry.progress) {
      setMcqAnswers(entry.progress.mcqAnswers ?? {});
      setWrittenAnswers(entry.progress.writtenAnswers ?? {});
      setSectionIndex(
        Math.max(0, Math.min(entry.progress.sectionIndex ?? 0, entry.lesson.sections.length))
      );
      setPhase(entry.progress.phase);
    } else {
      setPhase("reading");
    }
  };

  const startLesson = async () => {
    setPhase("loading");
    setError(null);
    setNotice(null);
    clearAnswers();
    // No internet: open the copy saved on this phone straight away instead of waiting for a failure.
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      const offlineNow = readSaved(storageKey);
      if (offlineNow) {
        openSaved(offlineNow, false);
        setNotice("You are offline, so this is the lesson saved on your phone.");
        return;
      }
      setError(
        "You are offline and this lesson is not saved on your phone. Connect to the internet, or pick a topic you downloaded."
      );
      setPhase("idle");
      return;
    }
    try {
      const res = await fetch("/api/tutor/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId: tutor.id,
          profile,
          topicId: customTopic.trim() ? null : activeTopic?.id ?? null,
          customTopic: customTopic.trim(),
        }),
      });
      const data = await readJsonLoose(res);
      if (!res.ok || data?.error || !Array.isArray(data?.mcq)) {
        throw new Error(
          data?.error || "The lesson could not be prepared. Please try again."
        );
      }
      const ready: Lesson = {
        ...data,
        mcq: (data.mcq as QuizQuestion[]).map(shuffleQuestion),
      };
      setLesson(ready);
      setLessonKey(storageKey);
      setPhase("reading");
    } catch (err) {
      const offlineCopy = readSaved(storageKey);
      if (offlineCopy) {
        openSaved(offlineCopy, false);
        setNotice(
          "You're offline or the tutor is busy, so here is the lesson you saved earlier."
        );
        return;
      }
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Could not reach Kasukulu. Check your connection and try again."
      );
      setPhase("idle");
    }
  };

  // The Topics tab's "Start lesson" button asks for an immediate start.
  useEffect(() => {
    if (autoStart) {
      onAutoStartHandled();
      void startLesson();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  const markWritten = async (
    forLesson: Lesson,
    answers: Record<number, string>
  ) => {
    setMarkError(null);
    setWrittenResults(null);
    try {
      const res = await fetch("/api/tutor/lesson/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId: tutor.id,
          profile,
          lessonTitle: forLesson.title,
          takeaways: forLesson.summary,
          items: forLesson.written.map((w, i) => ({
            id: `w${i}`,
            question: w.question,
            maxMarks: w.maxMarks,
            markingPoints: w.markingPoints,
            answer: answers[i] ?? "",
          })),
        }),
      });
      const data = await readJsonLoose(res);
      if (!res.ok || data?.error || !Array.isArray(data?.results)) {
        throw new Error(data?.error || "Marking failed. Please try again.");
      }
      setWrittenResults(data.results as WrittenResult[]);
    } catch (err) {
      setMarkError(
        err instanceof Error && err.message
          ? err.message
          : "Could not reach Kasukulu to mark your written answers."
      );
    }
  };

  const totalQuestions = lesson ? lesson.mcq.length + lesson.written.length : 0;
  const answeredCount = lesson
    ? lesson.mcq.filter((_, i) => mcqAnswers[i] !== undefined).length +
      lesson.written.filter((_, i) => (writtenAnswers[i] ?? "").trim().length >= 2).length
    : 0;
  const blankCount = totalQuestions - answeredCount;

  const submitExercise = async () => {
    if (!lesson) return;
    setConfirmBlank(false);
    setSubmittedMcq(mcqAnswers);
    setSubmittedWritten(writtenAnswers);
    lesson.mcq.forEach((q, i) => {
      if (mcqAnswers[i] !== undefined) {
        onRecordQuizAnswer(mcqAnswers[i] === q.correctIndex, q);
      }
    });
    setPhase("marking");
    await markWritten(lesson, writtenAnswers);
    setPhase("results");
  };

  // ---------- Idle / loading ----------
  if (phase === "idle" || phase === "loading") {
    const resumable = saved?.progress ?? null;
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50/60 p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                {profile.grade} · with {tutor.name}
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5 break-words">
                {topicTitle}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                First you read a full lesson with worked examples, about 15 to
                20 minutes. Then you do an exercise with multiple-choice and
                written questions. Your tutor marks it all and shows you how to
                improve.
              </p>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-800 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {saved && phase === "idle" && (
            <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 space-y-2">
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <WifiOff className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  {resumable
                    ? "You have a lesson in progress on this phone. It works without internet."
                    : "You saved this lesson on this phone. It works without internet."}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {resumable && (
                  <button
                    type="button"
                    onClick={() => openSaved(saved, true)}
                    className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold min-h-[40px] cursor-pointer"
                  >
                    Continue where I stopped
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openSaved(saved, false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 min-h-[40px] cursor-pointer"
                >
                  Open saved lesson
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void startLesson()}
              disabled={phase === "loading"}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-colors min-h-[44px] cursor-pointer disabled:opacity-70"
            >
              {phase === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Your tutor is writing the lesson…</span>
                </>
              ) : (
                <>
                  <span>
                    {error ? "Try again" : saved ? "Start a new lesson" : "Start lesson"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onChooseAnotherTopic}
              disabled={phase === "loading"}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 min-h-[44px] cursor-pointer disabled:opacity-60"
            >
              Choose another topic
            </button>
          </div>
          {phase === "loading" && (
            <p className="text-xs text-slate-500">
              Your lesson takes up to a minute to prepare. Please wait.
            </p>
          )}
        </div>
        <OfflineLessonsCard
          tutor={tutor}
          profile={profile}
          onChanged={() => setSaved(readSaved(storageKey))}
        />
      </div>
    );
  }

  if (!lesson) return null;

  const noticeBar = notice ? (
    <div
      role="status"
      className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900 flex items-start gap-2"
    >
      <WifiOff className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{notice}</span>
    </div>
  ) : null;

  // ---------- Reading the lesson ----------
  if (phase === "reading") {
    const totalParts = lesson.sections.length;
    const finished = sectionIndex >= totalParts;
    const goToPart = (next: number) => {
      setSectionIndex(next);
      setShowCheckAnswer(false);
      window.setTimeout(() => {
        readingTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 30);
    };
    return (
      <div ref={readingTopRef} className="space-y-5 scroll-mt-20">
        {noticeBar}

        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50/60 p-5 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
            <span>{profile.grade}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              About {lesson.estimatedMinutes} minutes to read
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 leading-snug">
            {lesson.title}
          </h3>
          {lesson.objective && (
            <p className="text-sm text-slate-700 leading-relaxed">
              <strong className="font-semibold">By the end you will: </strong>
              {lesson.objective}
            </p>
          )}
        </div>

        {!finished && sectionIndex === 0 && (lesson.mustKnow?.length ?? 0) > 0 && (
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-950">
              <Lightbulb className="w-4 h-4 text-amber-700" />
              What ECZ expects you to know
            </div>
            <ul className="space-y-1.5">
              {lesson.mustKnow!.map((k, i) => (
                <li key={i} className="text-sm text-slate-800 leading-relaxed flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>{k}</span>
                </li>
              ))}
            </ul>
            {lesson.examTip && (
              <p className="text-xs text-amber-950 leading-relaxed pt-1">
                <strong className="font-semibold">Exam tip: </strong>
                {lesson.examTip}
              </p>
            )}
          </div>
        )}

        {!finished && (
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={totalParts}
            aria-valuenow={sectionIndex + 1}
            aria-label="Lesson progress"
            className="space-y-1.5"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>
                Part {sectionIndex + 1} of {totalParts}
              </span>
              <span>One small idea at a time</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${Math.round(((sectionIndex + 1) / totalParts) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {sectionIndex === 0 && lesson.introduction && (
          <div className="space-y-2">
            <Paragraphs text={lesson.introduction} />
          </div>
        )}

        {!finished && [lesson.sections[sectionIndex]].map((sec) => {
          const i = sectionIndex;
          const speakId = `lesson-section-${i}`;
          return (
            <div key={i} className="space-y-4">
            <article
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3.5"
            >
              <h4 className="text-base font-bold text-slate-900 leading-snug">
                <span className="text-emerald-700 tabular-nums">{i + 1}.</span>{" "}
                {sec.heading}
              </h4>
              <div className="space-y-2.5">
                <Paragraphs text={sec.explanation} />
              </div>

              {sec.example && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-2 min-w-0">
                    <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                      Worked example
                    </div>
                    <WorkedSteps sec={sec} />
                  </div>
                </div>
              )}

              {sec.keyPoint && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-950 leading-relaxed flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-semibold">Remember: </strong>
                    {sec.keyPoint}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onSpeakText(
                      `${sec.heading}. ${sec.explanation}`.slice(0, 1800),
                      speakId
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium min-h-[40px] cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {speakingId === speakId ? "Playing…" : "Listen to this part"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onAskTutorText(
                      `I did not understand this part of the lesson "${lesson.title}": "${sec.heading}". ${sec.explanation} Please explain it again in an even simpler way with a different example.`
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium min-h-[40px] cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  I don't understand
                </button>
              </div>
            </article>

            {sec.checkQuestion && (
              <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wide text-sky-800">
                  Quick check
                </div>
                <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                  {sec.checkQuestion}
                </p>
                {showCheckAnswer ? (
                  <p className="text-sm text-sky-950 leading-relaxed rounded-xl bg-white border border-sky-200 px-3 py-2.5">
                    <strong className="font-semibold">Answer: </strong>
                    {sec.checkAnswer}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCheckAnswer(true)}
                    className="px-4 py-2 rounded-lg bg-white border border-sky-300 text-sky-900 text-xs font-semibold hover:bg-sky-100 min-h-[40px] cursor-pointer"
                  >
                    Think first, then show the answer
                  </button>
                )}
              </div>
            )}

            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-900">
                Did you understand this part?
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => goToPart(i + 1)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold min-h-[44px] cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {i + 1 < totalParts ? "Yes, go to the next part" : "Yes, I'm ready to finish"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onAskTutorText(
                      `I did not understand this part of the lesson "${lesson.title}": "${sec.heading}". ${sec.explanation} Please explain it again in an even simpler way with a different example, then ask me if I understood.`
                    )
                  }
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm font-semibold hover:bg-slate-50 min-h-[44px] cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" />
                  Not yet. Explain it again
                </button>
              </div>
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => goToPart(i - 1)}
                  className="text-xs font-semibold text-slate-600 underline cursor-pointer"
                >
                  Go back to the previous part
                </button>
              )}
            </div>
            </div>
          );
        })}

        {finished && (
          <>

        {(lesson.mustKnow?.length ?? 0) > 0 && (
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-950">
              <Lightbulb className="w-4 h-4 text-amber-700" />
              What ECZ expects you to know
            </div>
            <ul className="space-y-1.5">
              {lesson.mustKnow!.map((k, i) => (
                <li key={i} className="text-sm text-slate-800 leading-relaxed flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>{k}</span>
                </li>
              ))}
            </ul>
            {lesson.examTip && (
              <p className="text-xs text-amber-950 leading-relaxed pt-1">
                <strong className="font-semibold">Exam tip: </strong>
                {lesson.examTip}
              </p>
            )}
          </div>
        )}

        {lesson.summary.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              Summary: remember these
            </div>
            <ul className="space-y-1.5">
              {lesson.summary.map((k, i) => (
                <li
                  key={i}
                  className="text-sm text-slate-800 leading-relaxed flex gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{k}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-5 text-center space-y-3">
          <p className="text-sm text-slate-800 leading-relaxed">
            Finished reading? Do the exercise to test what you learned. There
            are {lesson.mcq.length} multiple-choice and {lesson.written.length}{" "}
            written questions. You will see your marks after you finish.
          </p>
          <button
            type="button"
            onClick={() => {
              setPhase("exercise");
              if (typeof window !== "undefined") window.scrollTo({ top: 0 });
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold min-h-[48px] cursor-pointer"
          >
            I've finished reading. Start the exercise
            <ArrowRight className="w-4 h-4" />
          </button>
          <div>
            <button
              type="button"
              onClick={() => goToPart(totalParts - 1)}
              className="text-xs font-semibold text-slate-600 underline cursor-pointer"
            >
              Go back to the last part
            </button>
          </div>
        </div>
          </>
        )}
      </div>
    );
  }

  // ---------- Exercise (answer everything, then submit) ----------
  if (phase === "exercise") {
    return (
      <div className="space-y-5">
        {noticeBar}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-1.5">
          <h3 className="text-base font-bold text-slate-900">
            Exercise: {lesson.title}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Answer every question on your own. You will see which answers are
            right, with your marks and feedback, after you submit. Your answers
            are saved on this phone as you go.
          </p>
          <div className="text-xs font-semibold text-emerald-800 tabular-nums pt-1">
            Answered {answeredCount} of {totalQuestions}
          </div>
        </div>

        <section aria-label="Part A: multiple choice" className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900">
            Part A: Multiple choice{" "}
            <span className="font-normal text-slate-500">
              (1 mark each, choose one answer)
            </span>
          </h4>
          {lesson.mcq.map((q, qi) => (
            <fieldset
              key={qi}
              className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3"
            >
              <legend className="sr-only">Question {qi + 1}</legend>
              <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                <span className="text-emerald-700 tabular-nums">A{qi + 1}.</span>{" "}
                {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const selected = mcqAnswers[qi] === oi;
                  return (
                    <label
                      key={oi}
                      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm leading-snug cursor-pointer transition-colors min-h-[44px] ${
                        selected
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950"
                          : "border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`mcq-${qi}`}
                        checked={selected}
                        onChange={() => {
                          setMcqAnswers((prev) => ({ ...prev, [qi]: oi }));
                          setConfirmBlank(false);
                        }}
                        className="mt-1 accent-emerald-700 shrink-0"
                      />
                      <span className="font-mono text-xs text-slate-500 mt-0.5 shrink-0">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </section>

        <section aria-label="Part B: written answers" className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <PenLine className="w-4 h-4 text-emerald-700" />
            Part B: Written answers{" "}
            <span className="font-normal text-slate-500">
              (explain in your own words)
            </span>
          </h4>
          {lesson.written.map((w, wi) => (
            <div
              key={wi}
              className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3"
            >
              <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                <span className="text-emerald-700 tabular-nums">B{wi + 1}.</span>{" "}
                {w.question}{" "}
                <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                  [{w.maxMarks} {w.maxMarks === 1 ? "mark" : "marks"}]
                </span>
              </p>
              <label htmlFor={`written-${wi}`} className="sr-only">
                Your answer to question B{wi + 1}
              </label>
              <textarea
                id={`written-${wi}`}
                value={writtenAnswers[wi] ?? ""}
                onChange={(e) => {
                  setWrittenAnswers((prev) => ({ ...prev, [wi]: e.target.value }));
                  setConfirmBlank(false);
                }}
                maxLength={1500}
                rows={5}
                placeholder="Write your answer here. Show your working if you calculate."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          ))}
        </section>

        {confirmBlank && blankCount > 0 && (
          <div
            role="alert"
            className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 space-y-2.5"
          >
            <p>
              You have {blankCount} unanswered{" "}
              {blankCount === 1 ? "question" : "questions"}. Submit anyway?
              Unanswered questions get 0 marks.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setConfirmBlank(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 min-h-[40px] cursor-pointer"
              >
                Keep working
              </button>
              <button
                type="button"
                onClick={() => void submitExercise()}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold min-h-[40px] cursor-pointer"
              >
                Submit anyway
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setPhase("reading")}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 min-h-[44px] cursor-pointer"
          >
            Back to the lesson
          </button>
          <button
            type="button"
            onClick={() => {
              if (blankCount > 0) setConfirmBlank(true);
              else void submitExercise();
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold min-h-[48px] cursor-pointer"
          >
            Submit for marking
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ---------- Marking ----------
  if (phase === "marking") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8 text-center space-y-3">
        <Loader2 className="w-7 h-7 text-emerald-700 mx-auto animate-spin" />
        <div className="text-sm font-semibold text-slate-900">
          {tutor.name} is marking your work…
        </div>
        <p className="text-xs text-slate-600">
          Reading your written answers carefully. This can take up to a minute.
        </p>
      </div>
    );
  }

  // ---------- Results ----------
  const mcqScore = lesson.mcq.filter(
    (q, i) => submittedMcq[i] === q.correctIndex
  ).length;
  const writtenMax = lesson.written.reduce((n, w) => n + w.maxMarks, 0);
  const writtenScore = writtenResults
    ? writtenResults.reduce((n, r) => n + r.score, 0)
    : 0;
  const writtenPending = writtenResults === null;
  const gotMax = lesson.mcq.length + (writtenPending ? 0 : writtenMax);
  const gotScore = mcqScore + writtenScore;
  const pct = gotMax > 0 ? Math.round((gotScore / gotMax) * 100) : 0;
  const strong = pct >= 70;

  const mistakes: string[] = [
    ...lesson.mcq
      .filter((q, i) => submittedMcq[i] !== q.correctIndex)
      .map((q) => q.question),
    ...lesson.written
      .filter((w, i) => {
        const r = writtenResults?.find((x) => x.id === `w${i}`);
        return r ? r.score < r.maxMarks : false;
      })
      .map((w) => w.question),
  ];

  return (
    <div className="space-y-5">
      <div
        className={`rounded-2xl border p-5 text-center space-y-2 ${
          strong
            ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-white"
            : "border-amber-300 bg-gradient-to-br from-amber-50 to-white"
        }`}
      >
        <div className="text-3xl font-bold text-slate-900 tabular-nums">
          {gotScore} / {gotMax}
          <span className="text-base text-slate-500 font-semibold"> · {pct}%</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-700 tabular-nums">
          <span>
            Multiple choice: {mcqScore} / {lesson.mcq.length}
          </span>
          <span>
            Written: {writtenPending ? "not marked yet" : `${writtenScore} / ${writtenMax}`}
          </span>
        </div>
        <div className="text-sm font-semibold text-slate-900">
          {strong
            ? "Well done! You understood this lesson. 🎉"
            : "Good effort. Read the feedback below and review the lesson."}
        </div>
      </div>

      {writtenPending && (
        <div
          role="alert"
          className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 space-y-2"
        >
          <p>
            {markError ??
              "Your written answers could not be marked yet."}{" "}
            Your multiple-choice marks are shown. Your answers are safe.
          </p>
          <button
            type="button"
            onClick={() => {
              setPhase("marking");
              void markWritten(lesson, submittedWritten).then(() =>
                setPhase("results")
              );
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold min-h-[40px] cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try marking again
          </button>
        </div>
      )}

      <section aria-label="Multiple choice review" className="space-y-3">
        <h4 className="text-sm font-bold text-slate-900">
          Part A: Multiple choice
        </h4>
        {lesson.mcq.map((q, i) => {
          const chosen = submittedMcq[i];
          const right = chosen === q.correctIndex;
          return (
            <div
              key={i}
              className={`rounded-2xl border p-4 space-y-2 ${
                right
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-red-200 bg-red-50/40"
              }`}
            >
              <div className="flex items-start gap-2">
                {right ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                  A{i + 1}. {q.question}
                </p>
              </div>
              <p className="text-xs text-slate-700 pl-6">
                Your answer:{" "}
                <strong className="font-semibold">
                  {chosen === undefined ? "No answer" : q.options[chosen]}
                </strong>
              </p>
              {!right && (
                <p className="text-xs text-emerald-900 pl-6">
                  Correct answer:{" "}
                  <strong className="font-semibold">
                    {q.options[q.correctIndex]}
                  </strong>
                </p>
              )}
              <p className="text-xs text-slate-700 leading-relaxed pl-6">
                {q.explanation}
              </p>
            </div>
          );
        })}
      </section>

      <section aria-label="Written answers review" className="space-y-3">
        <h4 className="text-sm font-bold text-slate-900">Part B: Written answers</h4>
        {lesson.written.map((w, i) => {
          const r = writtenResults?.find((x) => x.id === `w${i}`);
          const mine = (submittedWritten[i] ?? "").trim();
          return (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5"
            >
              <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                B{i + 1}. {w.question}
              </p>
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Your answer
                </div>
                {mine || "No answer written."}
              </div>
              {r ? (
                <div
                  className={`rounded-xl border px-3.5 py-3 text-sm leading-relaxed space-y-2 ${
                    r.score >= r.maxMarks
                      ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                      : "border-amber-200 bg-amber-50 text-amber-950"
                  }`}
                >
                  <div className="font-bold tabular-nums">
                    {r.score} / {r.maxMarks} marks
                  </div>
                  <p>{r.feedback}</p>
                  {(r.modelAnswer || w.modelAnswer) && (
                    <p className="text-xs border-t border-black/10 pt-2">
                      <strong className="font-semibold">A good answer: </strong>
                      {r.modelAnswer || w.modelAnswer}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-500">Waiting to be marked.</div>
              )}
            </div>
          );
        })}
      </section>

      <div className="flex flex-wrap items-center gap-2">
        {mistakes.length > 0 && (
          <button
            type="button"
            onClick={() =>
              onAskTutorText(
                `I just finished the lesson "${lesson.title}" and lost marks on these questions: ${mistakes
                  .map((m) => `"${m}"`)
                  .join("; ")}. Please explain each one simply and step by step.`
              )
            }
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold min-h-[44px] cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            Ask {tutor.name} about my mistakes
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setPhase("reading");
            if (typeof window !== "undefined") window.scrollTo({ top: 0 });
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 min-h-[44px] cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          Read the lesson again
        </button>
        <button
          type="button"
          onClick={() => {
            clearAnswers();
            setPhase("exercise");
            if (typeof window !== "undefined") window.scrollTo({ top: 0 });
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 min-h-[44px] cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Try the exercise again
        </button>
        <button
          type="button"
          onClick={onChooseAnotherTopic}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold min-h-[44px] cursor-pointer"
        >
          Next topic
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
