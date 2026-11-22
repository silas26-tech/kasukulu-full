import { useState } from "react";
import { ArrowRight, CheckCircle2, Target } from "lucide-react";
import { getLocalDateKey, type StudyProgress } from "../data/curriculum";

const GOAL_STORAGE_KEY = "kasukulu_daily_goal_v1";

// 1 point per quiz question answered, 5 points per completed tutor session.
const POINTS_PER_SESSION = 5;

const GOAL_OPTIONS = [
  { points: 5, label: "Light", hint: "about 5 minutes" },
  { points: 10, label: "Steady", hint: "about 10 minutes" },
  { points: 20, label: "Serious", hint: "about 20 minutes" },
] as const;

const DEFAULT_GOAL = 10;

function loadGoal(): number {
  try {
    const raw = localStorage.getItem(GOAL_STORAGE_KEY);
    const n = raw ? Number(raw) : DEFAULT_GOAL;
    return GOAL_OPTIONS.some((o) => o.points === n) ? n : DEFAULT_GOAL;
  } catch {
    return DEFAULT_GOAL;
  }
}

function saveGoal(points: number): void {
  try {
    localStorage.setItem(GOAL_STORAGE_KEY, String(points));
  } catch {
    // Storage can be blocked (private mode); the goal then just resets next visit.
  }
}

interface DailyGoalCardProps {
  progress: StudyProgress;
  onContinue: () => void;
}

export function DailyGoalCard({ progress, onContinue }: DailyGoalCardProps) {
  const [goal, setGoal] = useState<number>(() => loadGoal());

  const today = progress.dailyActivity?.[getLocalDateKey()];
  const earned =
    (today?.quizAnswered ?? 0) + (today?.sessions ?? 0) * POINTS_PER_SESSION;
  const pct = Math.min(100, Math.round((earned / goal) * 100));
  const done = earned >= goal;
  const remaining = Math.max(0, goal - earned);

  return (
    <section
      aria-label="Daily study goal"
      className={`rounded-2xl border p-5 shadow-2xs space-y-4 ${
        done
          ? "border-emerald-300 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/60"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              done ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {done ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {done ? "Today's goal complete! 🎉" : "Today's study goal"}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {done
                ? "Great work. Anything you do now is a bonus toward your streak."
                : `${remaining} more ${remaining === 1 ? "point" : "points"} to go. Answer quiz questions (1 point each) or finish a tutor session (${POINTS_PER_SESSION} points).`}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-lg font-bold text-slate-900 tabular-nums leading-none">
            {Math.min(earned, 999)}
            <span className="text-slate-400 text-sm font-semibold"> / {goal}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">points today</div>
        </div>
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-valuenow={Math.min(earned, goal)}
        aria-label="Progress toward today's study goal"
        className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            done ? "bg-emerald-600" : "bg-amber-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200/80 rounded-xl">
          {GOAL_OPTIONS.map((opt) => (
            <button
              key={opt.points}
              type="button"
              title={opt.hint}
              aria-pressed={goal === opt.points}
              onClick={() => {
                setGoal(opt.points);
                saveGoal(opt.points);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer min-h-[36px] ${
                goal === opt.points
                  ? "bg-emerald-700 text-white font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
              }`}
            >
              {opt.label} · {opt.points}
            </button>
          ))}
        </div>

        {!done && (
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer min-h-[44px]"
          >
            <span>Start now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </section>
  );
}
