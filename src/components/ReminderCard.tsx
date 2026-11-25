import { useEffect, useRef, useState } from "react";
import { Bell, BellOff, CalendarPlus } from "lucide-react";
import type { StudyProgress } from "../data/curriculum";
import {
  downloadReminderIcs,
  isReminderDue,
  isValidTime,
  loadReminder,
  notificationPermission,
  reminderMessage,
  requestNotificationPermission,
  saveReminder,
  showReminderNotification,
  type ReminderSettings,
} from "../utils/reminder";
import { getLocalDateKey } from "../data/curriculum";

/** Checks every 30 seconds (and when the app comes back to the front) whether it is time to remind. */
export function useDailyReminder(progress: StudyProgress): void {
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    const check = () => {
      const s = loadReminder();
      if (!isReminderDue(s, progressRef.current)) return;
      if (notificationPermission() !== "granted") return;
      const msg = reminderMessage(progressRef.current);
      void showReminderNotification(msg.title, msg.body).then((ok) => {
        if (ok) saveReminder({ ...s, lastShown: getLocalDateKey() });
      });
    };
    check();
    const id = window.setInterval(check, 30_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
}

export function ReminderCard() {
  const [settings, setSettings] = useState<ReminderSettings>(loadReminder);
  const [perm, setPerm] = useState(notificationPermission);

  const update = (next: ReminderSettings) => {
    setSettings(next);
    saveReminder(next);
  };

  const toggle = async () => {
    if (settings.enabled) {
      update({ ...settings, enabled: false });
      return;
    }
    let p = perm;
    if (p === "default") {
      p = await requestNotificationPermission();
      setPerm(p);
    }
    update({ ...settings, enabled: true });
  };

  const blocked = perm === "denied";
  const unsupported = perm === "unsupported";

  return (
    <section
      aria-label="Daily study reminder"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
          {settings.enabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-slate-900">Daily study reminder</h2>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            Pick a time and Kasukulu reminds you to study, so you keep your streak.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={settings.enabled}
          aria-label="Turn daily reminder on or off"
          onClick={() => void toggle()}
          className={`relative w-12 h-7 rounded-full transition-colors shrink-0 cursor-pointer ${
            settings.enabled ? "bg-emerald-600" : "bg-slate-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
              settings.enabled ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      {settings.enabled && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="reminder-time" className="text-xs font-semibold text-slate-700">
              Remind me at
            </label>
            <input
              id="reminder-time"
              type="time"
              value={settings.time}
              onChange={(e) => {
                if (isValidTime(e.target.value)) update({ ...settings, time: e.target.value });
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {unsupported && (
            <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              This phone or browser cannot show reminders from the app. Use the calendar alarm below instead.
            </p>
          )}
          {blocked && (
            <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Notifications are blocked. Allow them for Kasukulu in your phone or browser settings, or use the calendar alarm below.
            </p>
          )}
          {perm === "default" && (
            <button
              type="button"
              onClick={async () => setPerm(await requestNotificationPermission())}
              className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold min-h-[40px] cursor-pointer"
            >
              Allow notifications
            </button>
          )}

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2">
            <p className="text-[11px] text-slate-600 leading-relaxed">
              App reminders show when Kasukulu is open or running in the background. For a reminder that always rings, even when the app is closed, add a daily alarm to your phone calendar.
            </p>
            <button
              type="button"
              onClick={() => downloadReminderIcs(settings.time)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-semibold hover:bg-slate-50 min-h-[40px] cursor-pointer"
            >
              <CalendarPlus className="w-4 h-4" />
              Add daily alarm to my calendar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
