import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Lightbulb, Loader2, Send, Sparkles } from "lucide-react";
import type { LearnerProfile } from "../data/curriculum";
import { REAL_PAPER_QUESTIONS, type PaperQuestion } from "../data/realPaperQuestions";
import { readJsonLoose } from "../utils/readJson";

interface Props {
  paperId: string;
  profile: LearnerProfile;
  tutorId: string;
  tutorName: string;
}

interface Msg {
  role: "learner" | "tutor";
  text: string;
}

export function hasGuidedQuestions(paperId: string): boolean {
  return (REAL_PAPER_QUESTIONS[paperId]?.length ?? 0) > 0;
}

export function PaperGuidedTutor({ paperId, profile, tutorId, tutorName }: Props) {
  const questions = REAL_PAPER_QUESTIONS[paperId] ?? [];
  const [chosen, setChosen] = useState<{ q: PaperQuestion; part: string } | null>(null);

  if (!chosen) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-950 leading-relaxed">
          <strong className="font-semibold">Choose a question.</strong> {tutorName} will guide you one small
          step at a time so you learn to solve it yourself. The worked answers stay hidden.
        </div>
        {questions.map((q) => (
          <div key={q.number} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900">Question {q.number}</h3>
              <button
                type="button"
                onClick={() => setChosen({ q, part: "" })}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold min-h-[40px] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Go through it with {tutorName}
              </button>
            </div>
            {q.stem && <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">{q.stem}</p>}
            {q.diagram && (
              <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 leading-relaxed">
                <strong className="font-semibold">Diagram, in words: </strong>
                {q.diagram}
              </p>
            )}
            <ul className="space-y-1.5">
              {q.parts.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-800">
                  <span className="font-semibold text-slate-600 shrink-0 min-w-[2.2rem]">{p.label}</span>
                  <span className="flex-1 leading-relaxed">{p.question}</span>
                  {p.marks > 0 && <span className="text-[11px] text-slate-500 shrink-0">[{p.marks}]</span>}
                  {p.label && q.parts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setChosen({ q, part: p.label })}
                      className="shrink-0 px-2.5 py-1.5 rounded-lg border border-emerald-300 text-emerald-800 text-[11px] font-semibold hover:bg-emerald-50 cursor-pointer min-h-[32px]"
                    >
                      Just this part
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {q.caution && (
              <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Part of this question was hard to read in our copy. Check the printed paper or ask your teacher if something looks wrong.
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <GuidedSession
      key={`${chosen.q.number}-${chosen.part}`}
      paperId={paperId}
      question={chosen.q}
      part={chosen.part}
      profile={profile}
      tutorId={tutorId}
      tutorName={tutorName}
      onExit={() => setChosen(null)}
    />
  );
}

function GuidedSession({
  paperId,
  question,
  part,
  profile,
  tutorId,
  tutorName,
  onExit,
}: {
  paperId: string;
  question: PaperQuestion;
  part: string;
  profile: LearnerProfile;
  tutorId: string;
  tutorName: string;
  onExit: () => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const started = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Msg[]>([]);
  messagesRef.current = messages;

  const shownParts = part ? question.parts.filter((p) => p.label === part) : question.parts;

  const ask = async (text: string, showAsLearner: boolean) => {
    if (loading) return;
    setError(null);
    setLoading(true);
    const history = messagesRef.current;
    if (showAsLearner) setMessages([...history, { role: "learner", text }]);
    try {
      const res = await fetch("/api/tutor/paper-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId,
          profile,
          paperId,
          number: question.number,
          partLabel: part,
          history,
          message: text,
        }),
      });
      const data = await readJsonLoose(res);
      if (!res.ok || data?.error || !data?.reply) {
        throw new Error(data?.error || "The tutor is busy. Please try again.");
      }
      setMessages((prev) => [...prev, { role: "tutor", text: String(data.reply) }]);
      if (data.finished) setFinished(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void ask("__start__", false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || loading) return;
    setInput("");
    void ask(t, true);
  };

  const lastIsTutor = messages.length > 0 && messages[messages.length - 1].role === "tutor";

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onExit}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer min-h-[36px]"
      >
        <ArrowLeft className="w-4 h-4" />
        Choose another question
      </button>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
        <div className="text-xs font-bold text-slate-900">
          Question {question.number}
          {part ? ` ${part}` : ""}
        </div>
        {question.stem && <p className="text-sm text-slate-800 whitespace-pre-line">{question.stem}</p>}
        {question.diagram && (
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="font-semibold">Diagram, in words: </strong>
            {question.diagram}
          </p>
        )}
        {shownParts.map((p, i) => (
          <p key={i} className="text-sm text-slate-800">
            <span className="font-semibold text-slate-600">{p.label} </span>
            {p.question}
            {p.marks > 0 && <span className="text-[11px] text-slate-500"> [{p.marks}]</span>}
          </p>
        ))}
      </div>

      <div className="space-y-2.5" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "learner" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                m.role === "learner"
                  ? "bg-emerald-700 text-white rounded-br-md"
                  : "bg-white border border-slate-200 text-slate-900 rounded-bl-md"
              }`}
            >
              {m.role === "tutor" && (
                <div className="text-[11px] font-semibold text-emerald-800 mb-0.5">{tutorName}</div>
              )}
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            {tutorName} is thinking…
          </div>
        )}
        <div ref={endRef} />
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 flex items-center justify-between gap-2">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => {
              const last = [...messagesRef.current].reverse().find((m) => m.role === "learner");
              void ask(last ? last.text : "__start__", false);
            }}
            className="font-semibold underline cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      {finished ? (
        <button
          type="button"
          onClick={onExit}
          className="w-full px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold min-h-[44px] cursor-pointer"
        >
          Well done. Choose the next question
        </button>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={loading || !lastIsTutor}
              onClick={() => send("Please go back to the previous step and explain it again, simply.")}
              className="inline-flex items-center gap-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-semibold hover:bg-slate-100 disabled:opacity-40 min-h-[44px] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="button"
              disabled={loading || !lastIsTutor}
              onClick={() => send("I understand. Please proceed to the next step.")}
              className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 disabled:opacity-40 min-h-[44px] cursor-pointer"
            >
              I understand, Proceed <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={loading || !lastIsTutor}
              onClick={() => send("Please give me a small hint, but not the answer.")}
              className="inline-flex items-center gap-1 px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100 disabled:opacity-40 min-h-[44px] cursor-pointer"
            >
              <Lightbulb className="w-4 h-4" /> Hint
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your answer or question"
              maxLength={600}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[44px]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="p-3 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-40 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
