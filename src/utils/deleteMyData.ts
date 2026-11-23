import { auth, deleteMyCompetitionEntries, signOutLearner } from "../firebase";

const PREFIXES = ["kasukulu_", "lubuto_"];

/** Removes everything Kasukulu saved in this browser. */
export function clearLocalLearnerData(): void {
  for (const store of [safeStorage("local"), safeStorage("session")]) {
    if (!store) continue;
    try {
      const keys: string[] = [];
      for (let i = 0; i < store.length; i++) {
        const k = store.key(i);
        if (k && PREFIXES.some((p) => k.startsWith(p))) keys.push(k);
      }
      keys.forEach((k) => store.removeItem(k));
    } catch {
      // ignore
    }
  }
}

function safeStorage(kind: "local" | "session"): Storage | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export interface DeleteResult {
  removedEntries: number;
  onlineFailed: boolean;
}

/**
 * Deletes the learner's competition entries (if signed in), signs out,
 * then clears everything saved on this device.
 */
export async function deleteMyData(): Promise<DeleteResult> {
  let removedEntries = 0;
  let onlineFailed = false;
  const user = auth.currentUser;
  if (user) {
    try {
      removedEntries = await deleteMyCompetitionEntries(user.uid);
    } catch {
      onlineFailed = true;
    }
    try {
      await signOutLearner();
    } catch {
      // ignore
    }
  }
  clearLocalLearnerData();
  return { removedEntries, onlineFailed };
}
