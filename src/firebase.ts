import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getFirestore,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Timestamp,
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";
import type { CompetitionLeaderboardEntry } from "./data/competitions";
import type { GradeLevel } from "./data/curriculum";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const STARTUP_TIMEOUT_MS = 3000;

export function subscribeToAuth(
  callback: (user: User | null) => void
): () => void {
  let resolvedInitial = false;
  const timeoutId = window.setTimeout(() => {
    if (!resolvedInitial) {
      resolvedInitial = true;
      callback(auth.currentUser ?? null);
    }
  }, STARTUP_TIMEOUT_MS);

  const unsubscribe = onAuthStateChanged(
    auth,
    (user) => {
      if (!resolvedInitial) {
        resolvedInitial = true;
        window.clearTimeout(timeoutId);
      }
      callback(user);
    },
    () => {
      if (!resolvedInitial) {
        resolvedInitial = true;
        window.clearTimeout(timeoutId);
      }
      callback(null);
    }
  );

  return () => {
    window.clearTimeout(timeoutId);
    unsubscribe();
  };
}

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutLearner(): Promise<void> {
  await signOut(auth);
}

export interface NewCompetitionEntryInput {
  learnerName: string;
  schoolName: string;
  province: string;
  grade: GradeLevel;
  competitionId: string;
  competitionTitle: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  timeTakenSeconds: number;
  questionsCorrect: number;
  questionsTotal: number;
  markedSummary: string;
}

function clampString(value: string, maxLen: number): string {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLen);
}

export async function saveCompetitionEntry(
  input: NewCompetitionEntryInput
): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Please sign in with Google before recording your score.");
  }

  const entryId = `entry-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const path = "competition_entries";

  const maxScore = Math.min(100, Math.max(1, Math.round(input.maxScore)));
  const totalScore = Math.min(
    maxScore,
    Math.max(0, Math.round(input.totalScore))
  );
  const percentage = Math.min(
    100,
    Math.max(0, Math.round(input.percentage))
  );
  const questionsTotal = Math.min(
    50,
    Math.max(1, Math.round(input.questionsTotal))
  );
  const questionsCorrect = Math.min(
    questionsTotal,
    Math.max(0, Math.round(input.questionsCorrect))
  );
  const timeTakenSeconds = Math.min(
    7200,
    Math.max(1, Math.round(input.timeTakenSeconds))
  );

  const safeCompetitionId = input.competitionId
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 128);

  const payload = {
    uid: currentUser.uid,
    learnerName: clampString(input.learnerName, 80),
    schoolName: clampString(input.schoolName, 120),
    province: clampString(input.province, 40),
    grade: input.grade,
    competitionId: safeCompetitionId || "comp-general",
    competitionTitle: clampString(input.competitionTitle, 120),
    totalScore,
    maxScore,
    percentage,
    timeTakenSeconds,
    questionsCorrect,
    questionsTotal,
    markedSummary: clampString(input.markedSummary, 400),
    status: "official" as const,
    submittedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, path, entryId), payload);
    return entryId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${entryId}`);
  }
}

export type VerifiedRecordResult =
  | { ok: true; entryId: string }
  | { ok: false; notConfigured: boolean; error: string };

/**
 * Asks the server to record a verified score. The server checks the Google sign-in and the
 * signed receipt from marking, then writes the entry itself, so the browser cannot make up a score.
 * If the server is not set up for this yet, notConfigured is true and the caller can fall back.
 */
export async function recordVerifiedEntry(input: {
  receipt: string;
  receiptSignature: string;
  learnerName: string;
  schoolName: string;
  province: string;
  timeTakenSeconds: number;
}): Promise<VerifiedRecordResult> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return {
      ok: false,
      notConfigured: false,
      error: "Please sign in with Google before recording your score.",
    };
  }
  try {
    const idToken = await currentUser.getIdToken();
    const res = await fetch("/api/competitions/record", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(input),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && typeof data.entryId === "string") {
      return { ok: true, entryId: data.entryId };
    }
    return {
      ok: false,
      notConfigured: res.status === 503 && data?.code === "not_configured",
      error: data?.error || "Could not save your score. Please try again.",
    };
  } catch {
    return {
      ok: false,
      notConfigured: false,
      error: "Could not reach Kasukulu. Check your connection and try again.",
    };
  }
}

export async function deleteCompetitionEntry(entryId: string): Promise<void> {
  const path = "competition_entries";
  try {
    await deleteDoc(doc(db, path, entryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${entryId}`);
  }
}

export function listenToCompetitionLeaderboard(
  onEntries: (entries: CompetitionLeaderboardEntry[]) => void,
  onError: (err: Error) => void
): () => void {
  const path = "competition_entries";
  const q = query(
    collection(db, path),
    where("status", "==", "official"),
    limit(200)
  );

  let resolvedInitial = false;
  const timeoutId = window.setTimeout(() => {
    if (!resolvedInitial) {
      resolvedInitial = true;
      onEntries([]);
    }
  }, STARTUP_TIMEOUT_MS);

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      if (!resolvedInitial) {
        resolvedInitial = true;
        window.clearTimeout(timeoutId);
      }
      const items: CompetitionLeaderboardEntry[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        const ts = d.submittedAt as Timestamp | undefined;
        const submittedAtMillis =
          ts && typeof ts.toMillis === "function" ? ts.toMillis() : Date.now();
        return {
          id: docSnap.id,
          uid: String(d.uid ?? ""),
          learnerName: String(d.learnerName ?? ""),
          schoolName: String(d.schoolName ?? ""),
          province: String(d.province ?? ""),
          grade: (d.grade as GradeLevel) || "Grade 12",
          competitionId: String(d.competitionId ?? ""),
          competitionTitle: String(d.competitionTitle ?? ""),
          totalScore: Number(d.totalScore ?? 0),
          maxScore: Number(d.maxScore ?? 20),
          percentage: Number(d.percentage ?? 0),
          timeTakenSeconds: Number(d.timeTakenSeconds ?? 0),
          questionsCorrect: Number(d.questionsCorrect ?? 0),
          questionsTotal: Number(d.questionsTotal ?? 0),
          markedSummary: String(d.markedSummary ?? ""),
          status: "official",
          submittedAtMillis,
        };
      });

      items.sort((a, b) => {
        if (b.percentage !== a.percentage) return b.percentage - a.percentage;
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        return a.timeTakenSeconds - b.timeTakenSeconds;
      });

      onEntries(items);
    },
    (error) => {
      if (!resolvedInitial) {
        resolvedInitial = true;
        window.clearTimeout(timeoutId);
      }
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError(
          wrapped instanceof Error ? wrapped : new Error(String(wrapped))
        );
      }
    }
  );

  return () => {
    window.clearTimeout(timeoutId);
    unsubscribe();
  };
}
