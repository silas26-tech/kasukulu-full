import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  Loader2,
  RefreshCw,
  Volume2,
  XCircle,
} from "lucide-react";
import type {
  LearnerProfile,
  QuizQuestion,
  SyllabusTopic,
  TutorPersona,
} from "../data/curriculum";

interface LessonStep {
  heading: string;
  explanation: string;
  example: string;
}

interface Lesson {
  title: string;
  objective: string;
  steps: LessonStep[];
  keyTakeaways: string[];
  exercise: QuizQuestion[];
}

type Phase = "idle" | "loading" | "teaching" | "exercise" | "done";

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
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);

  const topicTitle =
    customTopic.trim() || activeTopic?.title || tutor.subjectFocus;
  const topicKey = `${activeTopic?.id ?? ""}|${customTopic.trim()}`;

  // A different topic means the old lesson no longer applies.
  useEffect(() => {
    setPhase("idle");
    setLesson(null);
    setError(null);
  }, [topicKey]);

  const startLesson = async () => {
    setPhase("loading");
    setError(null);
    setStepIndex(0);
    setQIndex(0);
    setPicked(null);
    setScore(0);
    setMissed([]);
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
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.error || "The lesson could not be prepared. Please try again."
        );
      }
      const ready: Lesson = {
        ...data,
        exercise: (data.exercise as QuizQuestion[]).map(shuffleQuestion),
      };
      setLesson(ready);
      setPhase("teaching");
    } catch (err) {
      setError(
        err instanceof Error
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

  const currentQuestion = useMemo(
    () => lesson?.exercise[qIndex] ?? null,
    [lesson, qIndex]
  );

  const answer = (optionIndex: number) => {
    if (!currentQuestion || picked !== null) return;
    setPicked(optionIndex);
    const correct = optionIndex === currentQuestion.correctIndex;
    if (correct) setScore((s) => s + 1);
    else setMissed((m) => [...m, currentQuestion.question]);
    onRecordQuizAnswer(correct, currentQuestion);
  };

  const nextQuestion = () => {
    if (!lesson) return;
    if (qIndex + 1 >= lesson.exercise.length) {
      setPhase("done");
    } else {
      setQIndex((i) => i + 1);
      setPicked(null);
    }
  };

  // ---------- Idle / loading ----------
  if (phase === "idle" || phase === "loading") {
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
                A short class in easy steps. Each step has an example, and you
                finish with a few questions to check what you understood. It
                takes about 5 to 10 minutes.
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
                  <span>Preparing your class…</span>
                </>
              ) : (
                <>
                  <span>{error ? "Try again" : "Start lesson"}</span>
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
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  // ---------- Teaching ----------
  if (phase === "teaching") {
    const step = lesson.steps[stepIndex];
    const isLast = stepIndex === lesson.steps.length - 1;
    const speakId = `lesson-step-${stepIndex}`;
    const pct = Math.round(((stepIndex + 1) / lesson.steps.length) * 100);

    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-900 truncate">
              {lesson.title}
            </span>
            <span className="text-slate-500 tabular-nums shrink-0">
              Step {stepIndex + 1} of {lesson.steps.length}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={lesson.steps.length}
            aria-valuenow={stepIndex + 1}
            aria-label="Lesson progress"
            className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden"
          >
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {stepIndex === 0 && lesson.objective && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-xs text-emerald-900 leading-relaxed">
            <strong className="font-semibold">By the end you will: </strong>
            {lesson.objective}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {stepIndex + 1}. {step.heading}
          </h3>
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
            {step.explanation}
          </p>
          {step.example && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-950 leading-relaxed whitespace-pre-line">
                <strong className="font-semibold">Example: </strong>
                {step.example}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() =>
                onSpeakText(`${step.heading}. ${step.explanation} Example. ${step.example}`, speakId)
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium min-h-[40px] cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              {speakingId === speakId ? "Playing…" : "Listen"}
            </button>
            <button
              type="button"
              onClick={() =>
                onAskTutorText(
                  `I did not understand this step of "${lesson.title}": "${step.heading}". ${step.explanation} Please explain it again in an even simpler way with a different example.`
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium min-h-[40px] cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              I don't understand
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 min-h-[44px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              if (isLast) {
                setPhase("exercise");
                setQIndex(0);
                setPicked(null);
                setScore(0);
                setMissed([]);
              } else {
                setStepIndex((i) => i + 1);
              }
            }}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold min-h-[44px] cursor-pointer"
          >
            {isLast ? "Check my understanding" : "Next step"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ---------- Exercise ----------
  if (phase === "exercise" && currentQuestion) {
    const answered = picked !== null;
    const isCorrect = picked === currentQuestion.correctIndex;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-900">
            Check your understanding
          </span>
          <span className="text-slate-500 tabular-nums">
            Question {qIndex + 1} of {lesson.exercise.length}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <p className="text-sm font-semibold text-slate-900 leading-relaxed">
            {currentQuestion.question}
          </p>
          <div className="space-y-2" role="group" aria-label="Answer choices">
            {currentQuestion.options.map((opt, i) => {
              const isPicked = picked === i;
              const isRight = i === currentQuestion.correctIndex;
              let style =
                "border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/40";
              if (answered && isRight)
                style = "border-emerald-600 bg-emerald-50 text-emerald-950";
              else if (answered && isPicked)
                style = "border-red-500 bg-red-50 text-red-950";
              else if (answered) style = "border-slate-200 bg-white opacity-70";
              return (
                <button
                  key={i}
                  type="button"
                  disabled={answered}
                  onClick={() => answer(i)}
                  className={`w-full text-left rounded-xl border px-3.5 py-3 text-sm leading-snug transition-colors min-h-[44px] flex items-start gap-2.5 ${style} ${
                    answered ? "cursor-default" : "cursor-pointer"
                  }`}
                >
                  <span className="font-mono text-xs text-slate-500 mt-0.5 shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {answered && isRight && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  )}
                  {answered && isPicked && !isRight && (
                    <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {answered && (
            <div
              role="status"
              className={`rounded-xl border px-3.5 py-3 text-sm leading-relaxed ${
                isCorrect
                  ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                  : "border-amber-200 bg-amber-50 text-amber-950"
              }`}
            >
              <strong className="font-semibold">
                {isCorrect ? "Correct! " : "Not quite. "}
              </strong>
              {currentQuestion.explanation}
            </div>
          )}
        </div>

        {answered && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={nextQuestion}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold min-h-[44px] cursor-pointer"
            >
              {qIndex + 1 >= lesson.exercise.length ? "See my result" : "Next question"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // ---------- Done ----------
  const total = lesson.exercise.length;
  const pct = Math.round((score / total) * 100);
  const strong = pct >= 75;
  return (
    <div className="space-y-4">
      <div
        className={`rounded-2xl border p-5 text-center space-y-2 ${
          strong
            ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-white"
            : "border-amber-300 bg-gradient-to-br from-amber-50 to-white"
        }`}
      >
        <div className="text-3xl font-bold text-slate-900 tabular-nums">
          {score} / {total}
        </div>
        <div className="text-sm font-semibold text-slate-900">
          {strong
            ? "Well done! You understood this lesson. 🎉"
            : "Good effort. Let's go over it once more."}
        </div>
        <p className="text-xs text-slate-600">
          {strong
            ? "Try another topic, or revise this one again later to keep it fresh."
            : "Read the steps again, or ask your tutor to explain the parts you missed."}
        </p>
      </div>

      {lesson.keyTakeaways.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-900">
            Remember these
          </div>
          <ul className="space-y-1.5">
            {lesson.keyTakeaways.map((k, i) => (
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

      <div className="flex flex-wrap items-center gap-2">
        {missed.length > 0 && (
          <button
            type="button"
            onClick={() =>
              onAskTutorText(
                `I just finished a lesson on "${lesson.title}" and got these wrong: ${missed
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
            setPhase("teaching");
            setStepIndex(0);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 min-h-[44px] cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Review the steps
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
