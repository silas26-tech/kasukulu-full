export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sun, 1 = Mon ... 6 = Sat

export interface StudyTimetableSlot {
  id: string;
  dayOfWeek: WeekdayIndex;
  startTime: string; // "HH:mm"
  durationMinutes: number;
  subject: string;
  tutorId: string;
  topicNote?: string;
}

export interface ExamDateEntry {
  id: string;
  title: string;
  subject: string;
  examDate: string; // "YYYY-MM-DD"
  examTime?: string; // "HH:mm"
  targetGoal?: string;
  tutorId: string;
}

export interface StudyCalendarState {
  timetable: StudyTimetableSlot[];
  exams: ExamDateEntry[];
  completedSlotDates: Record<string, string[]>; // dateKey ("YYYY-MM-DD") -> slotId[]
}

export const STUDY_CALENDAR_STORAGE_KEY = "kasukulu_study_calendar_v1";

export const DEFAULT_STUDY_CALENDAR: StudyCalendarState = {
  timetable: [],
  exams: [],
  completedSlotDates: {},
};

// Monday-first ordering for Zambian school week
export const WEEKDAYS_MON_FIRST: Array<{
  index: WeekdayIndex;
  short: string;
  full: string;
}> = [
  { index: 1, short: "Mon", full: "Monday" },
  { index: 2, short: "Tue", full: "Tuesday" },
  { index: 3, short: "Wed", full: "Wednesday" },
  { index: 4, short: "Thu", full: "Thursday" },
  { index: 5, short: "Fri", full: "Friday" },
  { index: 6, short: "Sat", full: "Saturday" },
  { index: 0, short: "Sun", full: "Sunday" },
];

export function loadStudyCalendar(): StudyCalendarState {
  try {
    const raw = localStorage.getItem(STUDY_CALENDAR_STORAGE_KEY);
    if (!raw) return DEFAULT_STUDY_CALENDAR;
    const parsed = JSON.parse(raw) as Partial<StudyCalendarState>;
    return {
      timetable: Array.isArray(parsed.timetable) ? parsed.timetable : [],
      exams: Array.isArray(parsed.exams) ? parsed.exams : [],
      completedSlotDates:
        parsed.completedSlotDates &&
        typeof parsed.completedSlotDates === "object"
          ? parsed.completedSlotDates
          : {},
    };
  } catch {
    return DEFAULT_STUDY_CALENDAR;
  }
}

export function parseLocalDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function getDaysUntilExam(
  examDateKey: string,
  now: Date = new Date()
): number {
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const target = parseLocalDateKey(examDateKey);
  const diffMs = target.getTime() - todayStart.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function formatTime12h(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function computeEndTime(hhmm: string, durationMinutes: number): string {
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const totalMins = (h * 60 + m + durationMinutes) % (24 * 60);
  const endH = Math.floor(totalMins / 60);
  const endM = totalMins % 60;
  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
}

export interface NextStudySessionInfo {
  slot: StudyTimetableSlot;
  dayLabel: string;
  dateKey: string;
  isToday: boolean;
}

export function findNextStudySession(
  timetable: StudyTimetableSlot[],
  now: Date = new Date()
): NextStudySessionInfo | null {
  if (timetable.length === 0) return null;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let offset = 0; offset < 7; offset++) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + offset);
    const weekday = candidate.getDay() as WeekdayIndex;

    const matching = timetable
      .filter((s) => s.dayOfWeek === weekday)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    for (const slot of matching) {
      const [h, m] = slot.startTime.split(":").map(Number);
      const slotMinutes = (h || 0) * 60 + (m || 0);
      if (offset === 0 && slotMinutes + slot.durationMinutes <= currentMinutes) {
        continue;
      }
      const year = candidate.getFullYear();
      const month = String(candidate.getMonth() + 1).padStart(2, "0");
      const day = String(candidate.getDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${day}`;
      const dayLabel =
        offset === 0
          ? "Today"
          : offset === 1
          ? "Tomorrow"
          : candidate.toLocaleDateString(undefined, { weekday: "long" });

      return {
        slot,
        dayLabel,
        dateKey,
        isToday: offset === 0,
      };
    }
  }

  return null;
}

export function getNextUpcomingExam(
  exams: ExamDateEntry[],
  now: Date = new Date()
): { exam: ExamDateEntry; daysLeft: number } | null {
  const upcoming = exams
    .map((exam) => ({
      exam,
      daysLeft: getDaysUntilExam(exam.examDate, now),
    }))
    .filter((item) => item.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return upcoming[0] ?? null;
}

export function getExamEagernessMessage(daysLeft: number): {
  badge: string;
  message: string;
} {
  if (daysLeft === 0) {
    return {
      badge: "Exam Day!",
      message:
        "Today is the day — trust your revision, breathe calmly, and read every ECZ question carefully.",
    };
  }
  if (daysLeft <= 7) {
    return {
      badge: "Final Sprint",
      message:
        "Less than a week left! Stick to your daily study blocks and test yourself with Past Papers.",
    };
  }
  if (daysLeft <= 21) {
    return {
      badge: "Momentum Zone",
      message:
        "Every completed timetable session right now adds real confidence and extra marks.",
    };
  }
  return {
    badge: "Early Advantage",
    message:
      "You planned ahead! Steady study blocks at your best hours will make exam week feel effortless.",
  };
}
