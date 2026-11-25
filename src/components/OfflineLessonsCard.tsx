import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, Loader2, Trash2, WifiOff } from "lucide-react";
import { ECZ_TOPICS } from "../data/curriculum";
import type { LearnerProfile, TutorPersona } from "../data/curriculum";
import {
  MAX_SAVED_LESSONS,
  deleteSavedLesson,
  downloadLessonForOffline,
  isLessonSaved,
  lessonStorageKey,
  listSavedLessons,
  type OfflineLessonItem,
} from "../utils/offlineLessons";

interface Props {
  tutor: TutorPersona;
  profile: LearnerProfile;
  /** Called after the list changes so the Lesson tab can refresh its "saved" notice. */
  onChanged?: () => void;
}

const BATCH = 3;

function useOnline(): boolean {
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

export function OfflineLessonsCard({ tutor, profile, onChanged }: Props) {
  const online = useOnline();
  const [items, setItems] = useState<OfflineLessonItem[]>(listSavedLessons);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number; title: string } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);

  const refresh = () => {
    setItems(listSavedLessons());
    onChanged?.();
  };

  // The next topics for this tutor and grade that are not on the phone yet.
  const nextTopics = useMemo(
    () =>
      ECZ_TOPICS.filter((t) => t.tutorId === tutor.id && t.grade === profile.grade).filter(
        (t) => !isLessonSaved(lessonStorageKey(profile, t))
      ),
    // items changes whenever a lesson is saved or removed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tutor.id, profile, items]
  );

  const downloadNext = async () => {
    const batch = nextTopics.slice(0, BATCH);
    if (batch.length === 0 || busy) return;
    setBusy(true);
    setMessage(null);
    let ok = 0;
    try {
      for (let i = 0; i < batch.length; i++) {
        setProgress({ done: i, total: batch.length, title: batch[i].title });
        await downloadLessonForOffline(profile, batch[i]);
        ok += 1;
        setItems(listSavedLessons());
      }
      setMessage(`Done. ${ok} lesson${ok === 1 ? "" : "s"} saved on this phone.`);
    } catch (err) {
      setMessage(
        (ok > 0 ? `${ok} saved. ` : "") +
          (err instanceof Error && err.message
            ? err.message
            : "Could not download. Check your internet and try again.")
      );
    } finally {
      setProgress(null);
      setBusy(false);
      refresh();
    }
  };

  return (
    <section
      aria-label="Offline lessons"
      className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
          <WifiOff className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-slate-900">Study without internet</h3>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            Download lessons while you have data or Wi-Fi. Then read them anywhere, even with no
            network. {items.length} saved on this phone (up to {MAX_SAVED_LESSONS}).
          </p>
        </div>
      </div>

      {!online && (
        <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          You are offline. Choose a topic you downloaded and tap Start lesson to open it.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void downloadNext()}
          disabled={busy || !online || nextTopics.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold min-h-[40px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {nextTopics.length === 0
            ? `All ${profile.grade} ${tutor.name} lessons saved`
            : `Download next ${Math.min(BATCH, nextTopics.length)} lesson${
                Math.min(BATCH, nextTopics.length) === 1 ? "" : "s"
              }`}
        </button>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => setShowList((v) => !v)}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 min-h-[40px] cursor-pointer"
          >
            {showList ? "Hide saved lessons" : "See saved lessons"}
          </button>
        )}
      </div>

      {progress && (
        <p role="status" className="text-xs text-slate-700">
          Downloading {progress.done + 1} of {progress.total}: {progress.title}. This can take a minute each.
        </p>
      )}
      {message && !progress && (
        <p role="status" className="text-xs text-slate-700 flex items-start gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-px" />
          <span>{message}</span>
        </p>
      )}
      <p className="text-[11px] text-slate-500">
        Each new lesson uses a little of your daily AI allowance. Marking your written answers needs internet.
      </p>

      {showList && (
        <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {items.map((it) => (
            <li key={it.key} className="flex items-center gap-2 px-3 py-2.5 bg-white">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-900 break-words">{it.title}</div>
                <div className="text-[11px] text-slate-500">
                  {it.inProgress ? "In progress · " : ""}
                  {it.savedAt ? new Date(it.savedAt).toLocaleDateString() : ""}
                </div>
              </div>
              <button
                type="button"
                aria-label={`Delete saved lesson ${it.title}`}
                onClick={() => {
                  deleteSavedLesson(it.key);
                  refresh();
                }}
                className="p-2 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
