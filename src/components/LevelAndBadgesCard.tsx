import { useEffect, useMemo, useState } from "react";
import { Sparkles, X } from "lucide-react";
import type { StudyProgress } from "../data/curriculum";
import {
  BADGES,
  computePoints,
  getLevelProgress,
  satisfiedBadgeIds,
} from "../data/gamification";

const EARNED_KEY = "kasukulu_badges_v1";
const LEVEL_KEY = "kasukulu_level_seen_v1";

// Badges are remembered on this device so they are never taken away if a streak ends.
function loadEarned(): string[] | null {
  try {
    const raw = localStorage.getItem(EARNED_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveEarned(ids: string[]): void {
  try {
    localStorage.setItem(EARNED_KEY, JSON.stringify(ids));
  } catch {
    // Storage blocked: badges are still shown from today's activity.
  }
}

function loadSeenLevel(): number | null {
  try {
    const raw = localStorage.getItem(LEVEL_KEY);
    return raw === null ? null : Number(raw);
  } catch {
    return null;
  }
}

function saveSeenLevel(index: number): void {
  try {
    localStorage.setItem(LEVEL_KEY, String(index));
  } catch {
    // Ignore.
  }
}

interface LevelAndBadgesCardProps {
  progress: StudyProgress;
  studyStreak: number;
}

export function LevelAndBadgesCard({ progress, studyStreak }: LevelAndBadgesCardProps) {
  const [earnedIds, setEarnedIds] = useState<string[]>(() => loadEarned() ?? []);
  const [celebration, setCelebration] = useState<string | null>(null);

  const points = useMemo(() => computePoints(progress), [progress]);
  const lp = useMemo(() => getLevelProgress(points), [points]);
  const satisfied = useMemo(
    () => satisfiedBadgeIds(progress, studyStreak),
    [progress, studyStreak]
  );

  // Notice badges and levels earned since the learner last looked.
  useEffect(() => {
    const stored = loadEarned();
    const known = new Set(stored ?? []);
    const fresh = satisfied.filter((id) => !known.has(id));
    const union = [...(stored ?? []), ...fresh];

    if (fresh.length > 0 || stored === null) {
      saveEarned(union);
      setEarnedIds(union);
    }

    const seenLevel = loadSeenLevel();
    const leveledUp = seenLevel !== null && lp.index > seenLevel;
    if (seenLevel === null || lp.index > seenLevel) saveSeenLevel(lp.index);

    // First visit ever: save quietly. Otherwise celebrate what is new.
    if (stored !== null) {
      const names = fresh
        .map((id) => BADGES.find((b) => b.id === id))
        .filter((b): b is (typeof BADGES)[number] => !!b);
      if (leveledUp) {
        setCelebration(`You reached level ${lp.index + 1}: ${lp.level.name}! 🎉`);
      } else if (names.length === 1) {
        setCelebration(`New badge: ${names[0].emoji} ${names[0].name}!`);
      } else if (names.length > 1) {
        setCelebration(`${names.length} new badges earned! 🎉`);
      }
    }
  }, [satisfied, lp.index, lp.level.name]);

  const earnedSet = new Set(earnedIds);
  const earnedCount = BADGES.filter((b) => earnedSet.has(b.id)).length;

  return (
    <section
      aria-label="Your level and badges"
      className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
    >
      {celebration && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-emerald-50 px-4 py-2.5 text-sm font-semibold text-slate-900"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            {celebration}
          </span>
          <button
            type="button"
            onClick={() => setCelebration(null)}
            aria-label="Dismiss"
            className="p-1 rounded-md text-slate-500 hover:bg-white/70 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
            Level {lp.index + 1}
          </div>
          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {lp.level.name}
          </h3>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xl font-bold text-slate-900 tabular-nums leading-none">
            {points}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">points</div>
        </div>
      </div>

      <div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={lp.percentToNext}
          aria-label="Progress to next level"
          className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden"
        >
          <div
            className="h-full rounded-full bg-emerald-600 transition-all duration-500"
            style={{ width: `${lp.percentToNext}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-slate-600">
          {lp.next
            ? `${lp.next.minPoints - points} more ${
                lp.next.minPoints - points === 1 ? "point" : "points"
              } to reach ${lp.next.name}`
            : "You reached the top level. Amazing work!"}
        </p>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="text-sm font-semibold text-slate-900">Badges</h4>
          <span className="text-xs text-slate-500 tabular-nums">
            {earnedCount} of {BADGES.length} earned
          </span>
        </div>
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {BADGES.map((b) => {
            const has = earnedSet.has(b.id);
            return (
              <li
                key={b.id}
                className={`rounded-xl border px-3 py-2.5 flex items-center gap-2.5 ${
                  has
                    ? "border-emerald-300 bg-gradient-to-br from-emerald-50/80 to-white"
                    : "border-slate-200 bg-slate-50/60"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`text-2xl leading-none ${has ? "" : "grayscale opacity-40"}`}
                >
                  {b.emoji}
                </span>
                <div className="min-w-0">
                  <div
                    className={`text-xs font-bold leading-tight ${
                      has ? "text-slate-900" : "text-slate-500"
                    }`}
                  >
                    {b.name}
                    {!has && <span className="sr-only"> (locked)</span>}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    {b.hint}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
