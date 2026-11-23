import type { StudyProgress } from "./curriculum";

// Points are worked out from activity the app already records, and they only ever go up.
//   quiz answer right = 2, quiz answer wrong = 1 (trying counts), tutor session = 10,
//   new topic studied = 5, each day you studied = 5
export function computePoints(progress: StudyProgress): number {
  const answered = progress.quizAnswered ?? 0;
  const correct = Math.min(progress.quizCorrect ?? 0, answered);
  const wrong = answered - correct;
  const sessions = progress.sessionsCompleted ?? 0;
  const topics = progress.topicsStudied?.length ?? 0;
  return correct * 2 + wrong + sessions * 10 + topics * 5 + countActiveDays(progress) * 5;
}

export interface LevelInfo {
  name: string;
  minPoints: number;
}

export const LEVELS: LevelInfo[] = [
  { name: "Starter", minPoints: 0 },
  { name: "Curious Learner", minPoints: 50 },
  { name: "Explorer", minPoints: 150 },
  { name: "Achiever", minPoints: 350 },
  { name: "Scholar", minPoints: 700 },
  { name: "Star Student", minPoints: 1200 },
  { name: "Top of the Class", minPoints: 2000 },
  { name: "Distinction Champion", minPoints: 3500 },
];

export interface LevelProgress {
  index: number;
  level: LevelInfo;
  next: LevelInfo | null;
  pointsIntoLevel: number;
  pointsForLevel: number; // size of this level's band (0 at the top level)
  percentToNext: number; // 0 to 100
}

export function getLevelProgress(points: number): LevelProgress {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i].minPoints) index = i;
  }
  const level = LEVELS[index];
  const next = LEVELS[index + 1] ?? null;
  const pointsIntoLevel = points - level.minPoints;
  const pointsForLevel = next ? next.minPoints - level.minPoints : 0;
  const percentToNext = next
    ? Math.min(100, Math.round((pointsIntoLevel / pointsForLevel) * 100))
    : 100;
  return { index, level, next, pointsIntoLevel, pointsForLevel, percentToNext };
}

function activeDateKeys(progress: StudyProgress): string[] {
  return Object.entries(progress.dailyActivity ?? {})
    .filter(([, d]) => (d?.sessions ?? 0) > 0 || (d?.quizAnswered ?? 0) > 0)
    .map(([key]) => key)
    .sort();
}

export function countActiveDays(progress: StudyProgress): number {
  return activeDateKeys(progress).length;
}

/** Longest run of consecutive study days ever (not just today's streak). */
export function longestStreak(progress: StudyProgress): number {
  const keys = activeDateKeys(progress);
  let best = 0;
  let run = 0;
  let prev: number | null = null;
  for (const key of keys) {
    const [y, m, d] = key.split("-").map(Number);
    // Noon UTC avoids daylight-saving edge cases when counting whole days.
    const day = Math.round(Date.UTC(y, m - 1, d, 12) / 86_400_000);
    run = prev !== null && day - prev === 1 ? run + 1 : 1;
    prev = day;
    if (run > best) best = run;
  }
  return best;
}

export interface BadgeDef {
  id: string;
  emoji: string;
  name: string;
  hint: string; // how to earn it
  earned: (progress: StudyProgress, bestStreak: number) => boolean;
}

const accuracy = (p: StudyProgress) =>
  p.quizAnswered > 0 ? p.quizCorrect / p.quizAnswered : 0;

export const BADGES: BadgeDef[] = [
  { id: "first-class", emoji: "🎓", name: "First Class", hint: "Finish your first tutor session", earned: (p) => p.sessionsCompleted >= 1 },
  { id: "quiz-10", emoji: "✏️", name: "Warming Up", hint: "Answer 10 questions", earned: (p) => p.quizAnswered >= 10 },
  { id: "quiz-50", emoji: "📝", name: "Question Master", hint: "Answer 50 questions", earned: (p) => p.quizAnswered >= 50 },
  { id: "quiz-200", emoji: "🏅", name: "Practice Hero", hint: "Answer 200 questions", earned: (p) => p.quizAnswered >= 200 },
  { id: "sharp", emoji: "🎯", name: "Sharp Mind", hint: "Score 80% or more after 20 questions", earned: (p) => p.quizAnswered >= 20 && accuracy(p) >= 0.8 },
  { id: "topics-5", emoji: "🧭", name: "Explorer", hint: "Study 5 different topics", earned: (p) => (p.topicsStudied?.length ?? 0) >= 5 },
  { id: "topics-15", emoji: "🗺️", name: "Curriculum Climber", hint: "Study 15 different topics", earned: (p) => (p.topicsStudied?.length ?? 0) >= 15 },
  { id: "streak-3", emoji: "🔥", name: "On Fire", hint: "Study 3 days in a row", earned: (_p, s) => s >= 3 },
  { id: "streak-7", emoji: "⭐", name: "Week Warrior", hint: "Study 7 days in a row", earned: (_p, s) => s >= 7 },
  { id: "streak-14", emoji: "💎", name: "Unstoppable", hint: "Study 14 days in a row", earned: (_p, s) => s >= 14 },
  { id: "streak-30", emoji: "👑", name: "Study Legend", hint: "Study 30 days in a row", earned: (_p, s) => s >= 30 },
  { id: "days-10", emoji: "📅", name: "Regular", hint: "Study on 10 different days", earned: (p) => countActiveDays(p) >= 10 },
];

/** Ids of badges whose conditions are met right now. */
export function satisfiedBadgeIds(progress: StudyProgress, currentStreak = 0): string[] {
  const best = Math.max(longestStreak(progress), currentStreak);
  return BADGES.filter((b) => b.earned(progress, best)).map((b) => b.id);
}
