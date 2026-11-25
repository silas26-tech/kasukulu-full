import {
  calculateStudyStreak,
  getLocalDateKey,
  type LearnerProfile,
  type StudyProgress,
} from "../data/curriculum";
import { firstName } from "./challenge";

export const PARENT_PHONE_KEY = "kasukulu_parent_number_v1";
export const EXAM_HISTORY_KEY = "kasukulu_exam_history_v1";

export interface ExamHistoryItem {
  date: string;
  subject: string;
  mode: string;
  percentage: number;
  at?: number;
}

export interface WeeklyReport {
  name: string;
  grade: string;
  rangeLabel: string;
  daysStudied: number;
  streak: number;
  sessions: number;
  questions: number;
  correct: number;
  accuracy: number | null; // percent, null if no questions
  exams: number;
  examAverage: number | null;
  weakTopics: string[];
}

function shortDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function readExamHistory(): ExamHistoryItem[] {
  try {
    const raw = localStorage.getItem(EXAM_HISTORY_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function buildWeeklyReport(
  profile: LearnerProfile,
  progress: StudyProgress,
  history: ExamHistoryItem[],
  now: Date = new Date()
): WeeklyReport {
  let daysStudied = 0;
  let sessions = 0;
  let questions = 0;
  let correct = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const a = progress.dailyActivity?.[getLocalDateKey(d)];
    if (!a) continue;
    if (a.sessions > 0 || a.quizAnswered > 0) daysStudied += 1;
    sessions += a.sessions;
    questions += a.quizAnswered;
    correct += a.quizCorrect;
  }
  const weekAgo = now.getTime() - 7 * 24 * 3600 * 1000;
  const recentExams = history.filter((h) => typeof h.at === "number" && h.at >= weekAgo);
  const start = new Date(now);
  start.setDate(start.getDate() - 6);
  return {
    name: firstName(profile.name),
    grade: profile.grade,
    rangeLabel: `${shortDate(start)} to ${shortDate(now)}`,
    daysStudied,
    streak: calculateStudyStreak(progress.dailyActivity, now),
    sessions,
    questions,
    correct,
    accuracy: questions > 0 ? Math.round((correct / questions) * 100) : null,
    exams: recentExams.length,
    examAverage: recentExams.length
      ? Math.round(recentExams.reduce((s, h) => s + h.percentage, 0) / recentExams.length)
      : null,
    weakTopics: [...new Set((progress.weaknesses ?? []).map((w) => w.title).filter(Boolean))].slice(0, 3),
  };
}

export function buildReportText(r: WeeklyReport, appUrl: string): string {
  const lines: string[] = [];
  lines.push(`Hello! Here is my Kasukulu study report for ${r.rangeLabel} (${r.grade}).`);
  lines.push("");
  if (r.daysStudied === 0) {
    lines.push("I did not study on Kasukulu this week. I will do better next week!");
  } else {
    lines.push(`📅 I studied on ${r.daysStudied} of 7 days${r.streak > 1 ? ` (${r.streak}-day streak)` : ""}.`);
    if (r.sessions > 0) lines.push(`🎓 Tutor sessions and lessons: ${r.sessions}.`);
    if (r.questions > 0) {
      lines.push(`✅ Questions answered: ${r.questions}. Correct: ${r.correct} (${r.accuracy}%).`);
    }
    if (r.exams > 0) {
      lines.push(`📝 Mock exams and challenges: ${r.exams}, average ${r.examAverage}%.`);
    }
    if (r.weakTopics.length > 0) {
      lines.push(`📌 I am still practising: ${r.weakTopics.join(", ")}.`);
    }
    lines.push("");
    if (r.accuracy !== null && r.accuracy >= 70) lines.push("I am doing very well. 🌟");
    else if (r.accuracy !== null && r.accuracy >= 50) lines.push("I am making good progress and I will keep going. 💪");
    else lines.push("I need more practice. Please encourage me to study a little every day. 🙏");
  }
  lines.push("");
  lines.push("You can help: ask me to explain one thing I learned today.");
  lines.push(`Kasukulu: ${appUrl}`);
  return lines.join("\n");
}

/** Turns 0977123456, +260 977 123 456 or 260977123456 into 260977123456. */
export function normalizeZambianPhone(input: string): string | null {
  let digits = input.replace(/[^\d]/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("260")) digits = digits.slice(3);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  return /^[79]\d{8}$/.test(digits) ? `260${digits}` : null;
}
