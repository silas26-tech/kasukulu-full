import type { LearnerProfile, SyllabusTopic } from "../data/curriculum";
import { readJsonLoose } from "./readJson";

// Same storage the Lesson tab uses, so a downloaded lesson opens exactly like a saved one.
export const STORE_PREFIX = "kasukulu_lesson_v2:";
export const STORE_INDEX = "kasukulu_lesson_index_v2";
export const MAX_SAVED_LESSONS = 40;

export interface OfflineLessonItem {
  key: string;
  title: string;
  savedAt: number;
  inProgress: boolean;
}

export function lessonStorageKey(profile: LearnerProfile, topic: SyllabusTopic): string {
  // Must match LessonPanel: `${grade}|${languageAid}|${topicId}|${customTopic}`
  return `${profile.grade}|${profile.languageAid ?? ""}|${topic.id}|`;
}

function readIndex(): string[] {
  try {
    const list = JSON.parse(localStorage.getItem(STORE_INDEX) ?? "[]");
    return Array.isArray(list) ? list.filter((k) => typeof k === "string") : [];
  } catch {
    return [];
  }
}

function validLesson(l: any): boolean {
  return (
    !!l &&
    typeof l.title === "string" &&
    Array.isArray(l.sections) &&
    l.sections.length > 0 &&
    Array.isArray(l.mcq) &&
    Array.isArray(l.written) &&
    Array.isArray(l.summary)
  );
}

export function isLessonSaved(key: string): boolean {
  try {
    const raw = localStorage.getItem(STORE_PREFIX + key);
    return !!raw && validLesson(JSON.parse(raw)?.lesson);
  } catch {
    return false;
  }
}

export function listSavedLessons(): OfflineLessonItem[] {
  const items: OfflineLessonItem[] = [];
  for (const key of readIndex()) {
    try {
      const raw = localStorage.getItem(STORE_PREFIX + key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (!validLesson(parsed?.lesson)) continue;
      items.push({
        key,
        title: parsed.lesson.title,
        savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : 0,
        inProgress: !!parsed.progress,
      });
    } catch {
      // skip broken entries
    }
  }
  return items;
}

export function deleteSavedLesson(key: string): void {
  try {
    localStorage.removeItem(STORE_PREFIX + key);
    localStorage.setItem(STORE_INDEX, JSON.stringify(readIndex().filter((k) => k !== key)));
  } catch {
    // ignore
  }
}

function writeDownloaded(key: string, lesson: unknown): void {
  localStorage.setItem(
    STORE_PREFIX + key,
    JSON.stringify({ lesson, savedAt: Date.now(), progress: null })
  );
  const next = [key, ...readIndex().filter((k) => k !== key)];
  for (const old of next.slice(MAX_SAVED_LESSONS)) localStorage.removeItem(STORE_PREFIX + old);
  localStorage.setItem(STORE_INDEX, JSON.stringify(next.slice(0, MAX_SAVED_LESSONS)));
}

function shuffleMcq(q: any): any {
  if (!q || !Array.isArray(q.options) || typeof q.correctIndex !== "number") return q;
  const order = q.options.map((_: unknown, i: number) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    ...q,
    options: order.map((i: number) => q.options[i]),
    correctIndex: order.indexOf(q.correctIndex),
  };
}

/** Downloads one topic's lesson and keeps it on this phone. Throws a friendly Error on failure. */
export async function downloadLessonForOffline(
  profile: LearnerProfile,
  topic: SyllabusTopic
): Promise<void> {
  const key = lessonStorageKey(profile, topic);
  const res = await fetch("/api/tutor/lesson", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tutorId: topic.tutorId,
      profile,
      topicId: topic.id,
      customTopic: "",
    }),
  });
  const data = await readJsonLoose(res);
  if (!res.ok || data?.error || !Array.isArray(data?.mcq)) {
    throw new Error(data?.error || "The lesson could not be downloaded. Please try again.");
  }
  const lesson = { ...data, mcq: (data.mcq as unknown[]).map(shuffleMcq) };
  if (!validLesson(lesson)) throw new Error("The lesson came back incomplete. Please try again.");
  try {
    writeDownloaded(key, lesson);
  } catch {
    throw new Error("Your phone storage is full, so the lesson could not be saved.");
  }
}
