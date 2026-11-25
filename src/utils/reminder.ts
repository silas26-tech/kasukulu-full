import { calculateStudyStreak, getLocalDateKey } from "../data/curriculum";
import type { StudyProgress } from "../data/curriculum";

export const REMINDER_KEY = "kasukulu_reminder_v1";

export interface ReminderSettings {
  enabled: boolean;
  /** 24h "HH:MM" */
  time: string;
  /** Local date key of the last day we showed the reminder. */
  lastShown: string;
}

export const DEFAULT_REMINDER: ReminderSettings = {
  enabled: false,
  time: "18:00",
  lastShown: "",
};

export function isValidTime(t: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
}

export function loadReminder(): ReminderSettings {
  try {
    const raw = localStorage.getItem(REMINDER_KEY);
    if (!raw) return { ...DEFAULT_REMINDER };
    const p = JSON.parse(raw) as Partial<ReminderSettings>;
    return {
      enabled: p.enabled === true,
      time: typeof p.time === "string" && isValidTime(p.time) ? p.time : DEFAULT_REMINDER.time,
      lastShown: typeof p.lastShown === "string" ? p.lastShown : "",
    };
  } catch {
    return { ...DEFAULT_REMINDER };
  }
}

export function saveReminder(s: ReminderSettings): void {
  try {
    localStorage.setItem(REMINDER_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

export function hasStudiedToday(progress: StudyProgress, now: Date = new Date()): boolean {
  const a = progress.dailyActivity?.[getLocalDateKey(now)];
  return !!a && (a.sessions > 0 || a.quizAnswered > 0);
}

/** True when the reminder time has passed today, it has not been shown yet, and the learner has not studied. */
export function isReminderDue(
  s: ReminderSettings,
  progress: StudyProgress,
  now: Date = new Date()
): boolean {
  if (!s.enabled || !isValidTime(s.time)) return false;
  if (s.lastShown === getLocalDateKey(now)) return false;
  if (hasStudiedToday(progress, now)) return false;
  const [h, m] = s.time.split(":").map(Number);
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  return minutesNow >= h * 60 + m;
}

export function reminderMessage(progress: StudyProgress, now: Date = new Date()): { title: string; body: string } {
  const streak = calculateStudyStreak(progress.dailyActivity, now);
  if (streak >= 2) {
    return {
      title: `Keep your ${streak}-day streak! 🔥`,
      body: "Study for just 10 minutes today so you do not lose it.",
    };
  }
  return {
    title: "Time to study with Kasukulu 📚",
    body: "A short 10-minute lesson today will make exams easier.",
  };
}

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  return notificationsSupported() ? Notification.permission : "unsupported";
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!notificationsSupported()) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export async function showReminderNotification(title: string, body: string): Promise<boolean> {
  if (!notificationsSupported() || Notification.permission !== "granted") return false;
  const options: NotificationOptions = {
    body,
    icon: "/icon.svg",
    tag: "kasukulu-daily-reminder",
  };
  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.showNotification(title, options);
        return true;
      }
    }
  } catch {
    // fall through to the plain constructor
  }
  try {
    new Notification(title, options);
    return true;
  } catch {
    return false;
  }
}

/** A calendar file with a repeating daily alarm. Works even when the app is closed. */
export function buildReminderIcs(time: string, now: Date = new Date()): string {
  const [h, m] = (isValidTime(time) ? time : DEFAULT_REMINDER.time).split(":");
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const stamp =
    `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}` +
    `T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kasukulu//Daily reminder//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:kasukulu-daily-reminder@kasukulu`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${date}T${h}${m}00`,
    "DURATION:PT15M",
    "RRULE:FREQ=DAILY",
    "SUMMARY:Study time with Kasukulu",
    "DESCRIPTION:Open Kasukulu and study for 10 minutes to keep your streak.",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Study time with Kasukulu",
    "TRIGGER:PT0M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function downloadReminderIcs(time: string): void {
  const blob = new Blob([buildReminderIcs(time)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "kasukulu-daily-reminder.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
