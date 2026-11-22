import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import {
  Award,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Home,
  Loader2,
  LogIn,
  LogOut,
  Medal,
  School,
  Search,
  Trash2,
  Trophy,
  UserCheck,
} from "lucide-react";
import {
  COMPETITION_PRIZES,
  type CompetitionLeaderboardEntry,
  type CompetitionMarkResponse,
  type NationwideCompetition,
} from "../data/competitions";
import {
  ZAMBIAN_PROVINCES,
  type GradeLevel,
  type LearnerProfile,
} from "../data/curriculum";
import {
  deleteCompetitionEntry,
  listenToCompetitionLeaderboard,
  saveCompetitionEntry,
  signInWithGoogle,
  signOutLearner,
  subscribeToAuth,
} from "../firebase";

type CompetitionTab = "take" | "leaderboard" | "prizes";
type ExamStage = "register" | "taking" | "marked";

interface CompetitionDashboardProps {
  profile: LearnerProfile;
  onUpdateProfile: (next: LearnerProfile) => void;
  onBackHome: () => void;
  onGoToVoiceStudio: () => void;
}

function formatSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function CompetitionDashboard({
  profile,
  onUpdateProfile,
  onBackHome,
  onGoToVoiceStudio,
}: CompetitionDashboardProps) {
  const [activeTab, setActiveTab] = useState<CompetitionTab>("take");

  // Firebase Auth & Live Firestore state
  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [leaderboardEntries, setLeaderboardEntries] = useState<
    CompetitionLeaderboardEntry[]
  >([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  // Registration & Exam state
  const [learnerName, setLearnerName] = useState(profile.name || "");
  const [schoolName, setSchoolName] = useState(profile.school || "");
  const [province, setProvince] = useState(profile.province || "Lusaka");
  // Papers come from the server without answers or marking schemes.
  const [competitions, setCompetitions] = useState<NationwideCompetition[]>([]);
  const [compsLoading, setCompsLoading] = useState(true);
  const [compsError, setCompsError] = useState<string | null>(null);
  const [compsReloadKey, setCompsReloadKey] = useState(0);
  const [selectedCompId, setSelectedCompId] = useState<string>("");
  const [regError, setRegError] = useState<string | null>(null);

  const [examStage, setExamStage] = useState<ExamStage>("register");
  const [answers, setAnswers] = useState<
    Record<string, { selectedIndex?: number; writtenAnswer?: string }>
  >({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [markingLoading, setMarkingLoading] = useState(false);
  const [markError, setMarkError] = useState<string | null>(null);
  const [markedReport, setMarkedReport] =
    useState<CompetitionMarkResponse | null>(null);
  const [submittedDurationSeconds, setSubmittedDurationSeconds] = useState(0);

  // Publishing to Firestore state
  const [publishingScore, setPublishingScore] = useState(false);
  const [publishedEntryId, setPublishedEntryId] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Leaderboard filters
  const [gradeFilter, setGradeFilter] = useState<"All" | GradeLevel>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const activeCompetition: NationwideCompetition | undefined =
    competitions.find((c) => c.id === selectedCompId) ?? competitions[0];

  // Load the public competition papers
  useEffect(() => {
    let cancelled = false;
    setCompsLoading(true);
    setCompsError(null);
    fetch("/api/competitions")
      .then(async (res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return (await res.json()) as { competitions?: NationwideCompetition[] };
      })
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data.competitions) ? data.competitions : [];
        setCompetitions(list);
        setSelectedCompId((prev) => {
          if (prev && list.some((c) => c.id === prev)) return prev;
          return (list.find((c) => c.grade === profile.grade) ?? list[0])?.id ?? "";
        });
      })
      .catch(() => {
        if (!cancelled)
          setCompsError(
            "Could not load the competition papers. Check your connection and try again."
          );
      })
      .finally(() => {
        if (!cancelled) setCompsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compsReloadKey]);

  // Auth listener
  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      setFirebaseUser(user);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Firestore real-time leaderboard listener (only when authenticated per security rules)
  useEffect(() => {
    if (!authReady || !firebaseUser) {
      setLeaderboardEntries([]);
      setLeaderboardLoading(false);
      return;
    }

    setLeaderboardLoading(true);
    setLeaderboardError(null);
    const unsub = listenToCompetitionLeaderboard(
      (entries) => {
        setLeaderboardEntries(entries);
        setLeaderboardLoading(false);
      },
      (err) => {
        setLeaderboardError(
          err.message || "Could not load nationwide leaderboard."
        );
        setLeaderboardLoading(false);
      }
    );

    return () => unsub();
  }, [authReady, firebaseUser]);

  // Stopwatch while taking competition test
  useEffect(() => {
    if (examStage !== "taking") return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [examStage]);

  const handleGoogleSignIn = async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : "Google sign-in could not complete. Please allow popups and try again."
      );
    } finally {
      setAuthBusy(false);
    }
  };

  const handleStartTest = () => {
    if (!activeCompetition) return;
    const cleanName = learnerName.trim();
    const cleanSchool = schoolName.trim();
    if (cleanName.length < 2) {
      setRegError("Please enter your full name (at least 2 characters).");
      return;
    }
    if (cleanSchool.length < 2) {
      setRegError(
        "Please write your school name (e.g. Kabulonga Boys Secondary School)."
      );
      return;
    }

    setRegError(null);
    setMarkError(null);
    setPublishError(null);
    setPublishedEntryId(null);
    setMarkedReport(null);
    setAnswers({});
    setElapsedSeconds(0);
    onUpdateProfile({
      ...profile,
      name: cleanName,
      school: cleanSchool,
      province,
      grade: activeCompetition.grade,
    });
    setExamStage("taking");
  };

  const publishResultToFirestore = async (
    report: CompetitionMarkResponse,
    durationSeconds: number
  ) => {
    setPublishingScore(true);
    setPublishError(null);
    try {
      const entryId = await saveCompetitionEntry({
        learnerName: learnerName.trim(),
        schoolName: schoolName.trim(),
        province,
        grade: report.grade,
        competitionId: report.competitionId,
        competitionTitle: report.competitionTitle,
        totalScore: report.totalScore,
        maxScore: report.maxScore,
        percentage: report.percentage,
        timeTakenSeconds: Math.max(1, durationSeconds),
        questionsCorrect: report.questionsCorrect,
        questionsTotal: report.questionsTotal,
        markedSummary: report.summaryFeedback,
      });
      setPublishedEntryId(entryId);
    } catch (err) {
      setPublishError(
        err instanceof Error
          ? err.message
          : "Could not save score to the nationwide leaderboard."
      );
    } finally {
      setPublishingScore(false);
    }
  };

  const handleSubmitAndMark = async () => {
    setMarkingLoading(true);
    setMarkError(null);
    const finalSeconds = Math.max(1, elapsedSeconds);
    setSubmittedDurationSeconds(finalSeconds);

    try {
      const res = await fetch("/api/competitions/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitionId: activeCompetition?.id,
          learnerName: learnerName.trim(),
          schoolName: schoolName.trim(),
          answers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "In-app marking failed.");
      }

      const report = data as CompetitionMarkResponse;
      setMarkedReport(report);
      setExamStage("marked");

      // If learner is already signed in with Google, record automatically in Firestore
      if (firebaseUser) {
        await publishResultToFirestore(report, finalSeconds);
      }
    } catch (err) {
      setMarkError(
        err instanceof Error ? err.message : "Could not mark test right now."
      );
    } finally {
      setMarkingLoading(false);
    }
  };

  const handleSignInAndPublish = async () => {
    if (!markedReport) return;
    setAuthBusy(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
      await publishResultToFirestore(markedReport, submittedDurationSeconds);
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : "Sign-in was cancelled or failed."
      );
    } finally {
      setAuthBusy(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    setDeletingId(entryId);
    try {
      await deleteCompetitionEntry(entryId);
    } catch (err) {
      setLeaderboardError(
        err instanceof Error ? err.message : "Could not remove entry."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredLeaderboard = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return leaderboardEntries.filter((entry) => {
      if (gradeFilter !== "All" && entry.grade !== gradeFilter) return false;
      if (!q) return true;
      return (
        entry.learnerName.toLowerCase().includes(q) ||
        entry.schoolName.toLowerCase().includes(q) ||
        entry.province.toLowerCase().includes(q)
      );
    });
  }, [gradeFilter, leaderboardEntries, searchQuery]);

  const topSchools = useMemo(() => {
    const map = new Map<
      string,
      {
        schoolName: string;
        province: string;
        entriesCount: number;
        totalPct: number;
        bestPct: number;
      }
    >();

    for (const entry of leaderboardEntries) {
      const key = `${entry.schoolName.trim().toLowerCase()}::${entry.province.trim().toLowerCase()}`;
      const existing = map.get(key);
      if (existing) {
        existing.entriesCount += 1;
        existing.totalPct += entry.percentage;
        existing.bestPct = Math.max(existing.bestPct, entry.percentage);
      } else {
        map.set(key, {
          schoolName: entry.schoolName,
          province: entry.province,
          entriesCount: 1,
          totalPct: entry.percentage,
          bestPct: entry.percentage,
        });
      }
    }

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        avgPct: Math.round(item.totalPct / item.entriesCount),
      }))
      .sort((a, b) => {
        if (b.avgPct !== a.avgPct) return b.avgPct - a.avgPct;
        if (b.bestPct !== a.bestPct) return b.bestPct - a.bestPct;
        return b.entriesCount - a.entriesCount;
      });
  }, [leaderboardEntries]);

  const answeredCount = (activeCompetition?.questions ?? []).filter((q) => {
    const a = answers[q.id];
    if (!a) return false;
    if (q.type === "mcq") return typeof a.selectedIndex === "number";
    return Boolean(a.writtenAnswer?.trim());
  }).length;

  if (!activeCompetition) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3">
        {compsLoading ? (
          <>
            <Loader2 className="w-6 h-6 text-emerald-700 mx-auto animate-spin" />
            <div className="text-sm font-semibold text-slate-900">
              Loading competition papers…
            </div>
          </>
        ) : (
          <>
            <div className="text-sm font-semibold text-slate-900">
              {compsError ?? "No competition papers are available right now."}
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCompsReloadKey((k) => k + 1)}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer min-h-[44px]"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={onBackHome}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer min-h-[44px]"
              >
                Back home
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Hero Banner */}
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="space-y-2.5 max-w-2xl">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300 hover:text-white transition-colors whitespace-nowrap"
            >
              <Home className="w-3.5 h-3.5" />
              Back to Home
            </button>

            <div className="text-xs font-medium text-amber-300">
              Kasukulu National ECZ Arena
              <span aria-hidden="true"> · </span>
              In-App Marking
              <span aria-hidden="true"> · </span>
              Study Prizes for Winners
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight text-balance">
              Nationwide Competition Dashboard & Prizes
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Write your full name and school, sit an official-style ECZ
              competition test, get instant step-by-step marking inside the app,
              and climb the Zambian leaderboard to win study tablets, data
              bundles, and Pioneer Passes.
            </p>
          </div>

          {/* Google Account Sync Control */}
          <div className="rounded-2xl bg-white/10 border border-white/15 p-4 min-w-[260px] space-y-2.5">
            {firebaseUser ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                    <UserCheck className="w-4 h-4 shrink-0" />
                    <span>Official Leaderboard Connected</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => void signOutLearner()}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-white underline whitespace-nowrap"
                  >
                    <LogOut className="w-3 h-3" />
                    Sign out
                  </button>
                </div>
                <div className="text-xs text-slate-200 truncate">
                  Signed in as{" "}
                  <strong className="text-white">
                    {firebaseUser.displayName || firebaseUser.email}
                  </strong>
                </div>
                <div className="text-[11px] text-slate-300 font-mono tabular-nums">
                  {leaderboardEntries.length} verified national entries recorded
                </div>
              </>
            ) : (
              <>
                <div className="text-xs font-semibold text-amber-300">
                  Save & Rank Nationally
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  You can take and mark any competition test right away. Sign in
                  with Google to record your school on the live leaderboard.
                </p>
                <button
                  type="button"
                  onClick={() => void handleGoogleSignIn()}
                  disabled={authBusy}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors whitespace-nowrap min-h-[40px] cursor-pointer"
                >
                  {authBusy ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LogIn className="w-3.5 h-3.5" />
                  )}
                  <span>Sign in with Google</span>
                </button>
              </>
            )}
            {authError && (
              <p className="text-[11px] text-amber-300 leading-snug">
                {authError}
              </p>
            )}
          </div>
        </div>

        {/* Highlighted Prize Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {COMPETITION_PRIZES.map((prize) => {
            const Icon =
              prize.tier === "gold"
                ? Trophy
                : prize.tier === "silver"
                ? Medal
                : prize.tier === "bronze"
                ? Award
                : Building2;
            const iconColor =
              prize.tier === "gold"
                ? "text-amber-300"
                : prize.tier === "silver"
                ? "text-slate-200"
                : prize.tier === "bronze"
                ? "text-orange-300"
                : "text-emerald-300";

            return (
              <div
                key={prize.rankLabel}
                className="rounded-xl bg-white/8 border border-white/12 p-3.5 space-y-1.5"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
                  <span>{prize.rankLabel}</span>
                </div>
                <div className="text-xs font-medium text-emerald-200 leading-snug">
                  {prize.reward}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dashboard Sub-Tabs */}
      <div
        role="tablist"
        aria-label="Competition dashboard views"
        className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-2xs"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "take"}
          onClick={() => setActiveTab("take")}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "take"
              ? "bg-gradient-to-r from-emerald-700 to-emerald-800 border-emerald-800 text-white shadow-sm"
              : "bg-white border-slate-200/80 text-slate-700 hover:text-slate-950 hover:border-emerald-600/40 hover:bg-emerald-50/40"
          }`}
        >
          <ClipboardCheck
            className={`w-4 h-4 shrink-0 ${
              activeTab === "take" ? "text-amber-300" : "text-emerald-700"
            }`}
          />
          <span>Competition Test & In-App Marking</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "leaderboard"}
          onClick={() => setActiveTab("leaderboard")}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "leaderboard"
              ? "bg-gradient-to-r from-emerald-700 to-emerald-800 border-emerald-800 text-white shadow-sm"
              : "bg-white border-slate-200/80 text-slate-700 hover:text-slate-950 hover:border-emerald-600/40 hover:bg-emerald-50/40"
          }`}
        >
          <Trophy
            className={`w-4 h-4 shrink-0 ${
              activeTab === "leaderboard" ? "text-amber-300" : "text-amber-600"
            }`}
          />
          <span>Nationwide Leaderboard</span>
          {firebaseUser && (
            <span
              className={`font-mono tabular-nums text-xs ${
                activeTab === "leaderboard" ? "text-emerald-200" : "text-slate-500"
              }`}
            >
              ({leaderboardEntries.length})
            </span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "prizes"}
          onClick={() => setActiveTab("prizes")}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "prizes"
              ? "bg-gradient-to-r from-emerald-700 to-emerald-800 border-emerald-800 text-white shadow-sm"
              : "bg-white border-slate-200/80 text-slate-700 hover:text-slate-950 hover:border-emerald-600/40 hover:bg-emerald-50/40"
          }`}
        >
          <School
            className={`w-4 h-4 shrink-0 ${
              activeTab === "prizes" ? "text-amber-300" : "text-emerald-700"
            }`}
          />
          <span>Top Schools & Prizes</span>
        </button>
      </div>

      {/* TAB 1: TAKE COMPETITION TEST & IN-APP MARKING */}
      {activeTab === "take" && (
        <div className="space-y-6">
          {examStage === "register" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Candidate Registration Card */}
              <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-slate-900">
                    1. Enter Candidate & School Details
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Your full name and school will appear on your marked script
                    and the official Zambian Nationwide Competition Leaderboard.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="comp-learner-name"
                      className="block text-xs font-semibold text-slate-800"
                    >
                      Learner Full Name
                    </label>
                    <input
                      id="comp-learner-name"
                      type="text"
                      maxLength={80}
                      value={learnerName}
                      onChange={(e) => setLearnerName(e.target.value)}
                      placeholder="e.g. Chanda Mwape"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[44px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="comp-province"
                      className="block text-xs font-semibold text-slate-800"
                    >
                      Province
                    </label>
                    <select
                      id="comp-province"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[44px]"
                    >
                      {ZAMBIAN_PROVINCES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="comp-school-name"
                    className="block text-xs font-semibold text-slate-800"
                  >
                    School Name (Required for Nationwide School Ranking)
                  </label>
                  <input
                    id="comp-school-name"
                    type="text"
                    maxLength={120}
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. Kabulonga Boys Secondary School, Lusaka"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[44px]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-800">
                    Choose Nationwide Competition Paper
                  </div>
                  <div className="space-y-2.5">
                    {competitions.map((comp) => {
                      const active = comp.id === activeCompetition.id;
                      return (
                        <button
                          key={comp.id}
                          type="button"
                          onClick={() => setSelectedCompId(comp.id)}
                          className={`w-full text-left rounded-xl border p-4 transition-all cursor-pointer ${
                            active
                              ? "border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-slate-900">
                              {comp.title}
                            </span>
                            <span className="font-mono text-xs text-emerald-800 font-semibold tabular-nums">
                              {comp.grade} · {comp.totalMarks} marks ·{" "}
                              {comp.durationMinutes} min
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 mt-1">
                            {comp.subjectsSummary}
                          </div>
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                            {comp.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {regError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
                    {regError}
                  </div>
                )}

                <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    Includes {activeCompetition.questions.length} questions (MCQs
                    + ECZ structured working marked inside Kasukulu).
                  </div>
                  <button
                    type="button"
                    onClick={handleStartTest}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-colors whitespace-nowrap min-h-[44px] cursor-pointer"
                  >
                    <Trophy className="w-4 h-4" />
                    Start Official Timed Test
                  </button>
                </div>
              </div>

              {/* Right Column: How In-App Marking & Prizes Work */}
              <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-900">
                    How Nationwide Marking Works
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Every answer is graded transparently inside Kasukulu using
                    official ECZ method (`M1`), accuracy (`A1`), and basic (`B1`)
                    marking schemes.
                  </p>
                </div>

                <ol className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-start gap-3">
                    <span className="font-mono font-semibold text-emerald-800 tabular-nums shrink-0">
                      01.
                    </span>
                    <span>
                      <strong>Record your Name & School:</strong> Both are saved
                      permanently with your score on the Zambian leaderboard.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-mono font-semibold text-emerald-800 tabular-nums shrink-0">
                      02.
                    </span>
                    <span>
                      <strong>Show Your Working:</strong> Multiple-choice
                      questions are marked immediately, and structured written
                      answers receive partial M1/A1 credit for correct steps.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-mono font-semibold text-emerald-800 tabular-nums shrink-0">
                      03.
                    </span>
                    <span>
                      <strong>Compete for Term Prizes:</strong> Top learners and
                      highest-scoring schools earn tablets, data bundles, and
                      Pioneer Passes to keep studying extra hard.
                    </span>
                  </li>
                </ol>

                <div className="rounded-xl bg-amber-50/80 border border-amber-200 p-4 space-y-1.5">
                  <div className="text-xs font-semibold text-amber-950">
                    Study Tip Before Starting
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Want to brush up on a topic first? Practice with Madam Chanda,
                    Mr. Mwansa, Miss Phiri, or Mr. Banda in Voice Studio, then
                    come back here to test your rank!
                  </p>
                  <button
                    type="button"
                    onClick={onGoToVoiceStudio}
                    className="text-xs font-semibold text-emerald-800 hover:underline pt-1"
                  >
                    Open Voice Studio →
                  </button>
                </div>
              </div>
            </div>
          )}

          {examStage === "taking" && (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              {/* Exam Sticky Bar */}
              <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold">
                    {activeCompetition.title}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Candidate: <strong className="text-white">{learnerName}</strong>
                    <span aria-hidden="true"> · </span>
                    <span>{schoolName}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{province}</span>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400">Answered</div>
                    <div className="font-mono text-sm font-semibold tabular-nums">
                      {answeredCount} / {activeCompetition.questions.length}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2">
                    <Clock className="w-4 h-4 text-emerald-300" />
                    <span className="font-mono text-sm font-semibold tabular-nums">
                      {formatSeconds(elapsedSeconds)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div className="p-6 space-y-6">
                {activeCompetition.questions.map((q) => {
                  const current = answers[q.id] ?? {};
                  return (
                    <div
                      key={q.id}
                      className="rounded-2xl border border-slate-200 p-5 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs font-semibold text-emerald-800">
                          {q.number} · {q.subject} ·{" "}
                          {q.type === "mcq"
                            ? "Multiple Choice"
                            : "Structured Working"}
                        </div>
                        <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
                          [{q.marks} marks]
                        </span>
                      </div>

                      <p className="text-sm font-medium text-slate-900 leading-relaxed">
                        {q.prompt}
                      </p>

                      {q.type === "mcq" && q.options ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {q.options.map((opt, idx) => {
                            const selected = current.selectedIndex === idx;
                            const letter = String.fromCharCode(65 + idx);
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() =>
                                  setAnswers((prev) => ({
                                    ...prev,
                                    [q.id]: { ...prev[q.id], selectedIndex: idx },
                                  }))
                                }
                                className={`flex items-start gap-3 text-left rounded-xl border px-4 py-3 text-xs transition-colors cursor-pointer ${
                                  selected
                                    ? "border-emerald-700 bg-emerald-50 text-slate-900 font-semibold ring-1 ring-emerald-700"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                }`}
                              >
                                <span
                                  className={`font-mono font-semibold shrink-0 ${
                                    selected
                                      ? "text-emerald-800"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {letter}.
                                </span>
                                <span className="leading-relaxed">{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <label
                            htmlFor={`ans-${q.id}`}
                            className="block text-xs font-medium text-slate-600"
                          >
                            Write your step-by-step working & final answer below
                            (marked for M1/A1/B1 credit):
                          </label>
                          <textarea
                            id={`ans-${q.id}`}
                            rows={4}
                            value={current.writtenAnswer ?? ""}
                            onChange={(e) =>
                              setAnswers((prev) => ({
                                ...prev,
                                [q.id]: {
                                  ...prev[q.id],
                                  writtenAnswer: e.target.value,
                                },
                              }))
                            }
                            placeholder="Show your formula, step-by-step working, and final units clearly..."
                            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                {markError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
                    {markError}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setExamStage("register")}
                    disabled={markingLoading}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                  >
                    Change Details / Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleSubmitAndMark()}
                    disabled={markingLoading}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-sm font-semibold transition-colors whitespace-nowrap min-h-[44px] cursor-pointer"
                  >
                    {markingLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Marking Script Inside App...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Submit & Mark Inside App
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {examStage === "marked" && markedReport && (
            <div className="space-y-6">
              {/* Marked Score Summary Card */}
              <div className="rounded-2xl border border-emerald-200 bg-white overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-amber-300">
                      In-App Marking Complete · {markedReport.gradeBand}
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      {learnerName} — {schoolName}
                    </h2>
                    <div className="text-xs text-emerald-100">
                      {markedReport.competitionTitle} · {province} · Time{" "}
                      <span className="font-mono tabular-nums">
                        {formatSeconds(submittedDurationSeconds)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 pt-1 max-w-2xl leading-relaxed">
                      {markedReport.summaryFeedback}
                    </p>
                  </div>

                  <div className="flex items-center gap-5 shrink-0 bg-white/10 border border-white/15 rounded-2xl px-6 py-4">
                    <div>
                      <div className="text-[11px] text-emerald-200">Score</div>
                      <div className="font-mono text-2xl font-bold tabular-nums">
                        {markedReport.totalScore} / {markedReport.maxScore}
                      </div>
                    </div>
                    <div className="h-10 w-px bg-white/20" />
                    <div>
                      <div className="text-[11px] text-emerald-200">
                        Accuracy
                      </div>
                      <div className="font-mono text-3xl font-bold text-amber-300 tabular-nums">
                        {markedReport.percentage}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Official Leaderboard Recording Bar */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  {publishedEntryId ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>
                        Official score recorded on the Zambian Nationwide
                        Leaderboard!
                      </span>
                    </div>
                  ) : publishingScore ? (
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                      <span>
                        Recording {learnerName} ({schoolName}) to the live
                        leaderboard...
                      </span>
                    </div>
                  ) : firebaseUser ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs text-red-700">
                        {publishError || "Ready to save your official score."}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          void publishResultToFirestore(
                            markedReport,
                            submittedDurationSeconds
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold whitespace-nowrap cursor-pointer"
                      >
                        Record Score Now
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                      <div className="text-xs text-slate-700">
                        Sign in with Google to officially record{" "}
                        <strong>{learnerName}</strong> (
                        <strong>{schoolName}</strong>) on the Nationwide
                        Leaderboard and qualify for prizes.
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleSignInAndPublish()}
                        disabled={authBusy}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold whitespace-nowrap cursor-pointer"
                      >
                        {authBusy ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <LogIn className="w-3.5 h-3.5" />
                        )}
                        Sign in with Google & Record Score
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab("leaderboard")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 whitespace-nowrap cursor-pointer"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-600" />
                      View Leaderboard
                    </button>
                    <button
                      type="button"
                      onClick={() => setExamStage("register")}
                      className="px-4 py-2 rounded-xl border border-emerald-700 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 whitespace-nowrap cursor-pointer"
                    >
                      Take Another Test
                    </button>
                  </div>
                </div>
              </div>

              {/* Per-Question ECZ Marking Scheme Breakdown */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-slate-900">
                  Question-by-Question Marking Script
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {markedReport.questionResults.map((resItem) => {
                    const fullMarks = resItem.marksAwarded === resItem.maxMarks;
                    const zeroMarks = resItem.marksAwarded === 0;
                    return (
                      <div
                        key={resItem.questionId}
                        className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-900">
                            {resItem.number} · {resItem.subject}
                          </span>
                          <span
                            className={`font-mono text-xs font-bold tabular-nums ${
                              fullMarks
                                ? "text-emerald-700"
                                : zeroMarks
                                ? "text-red-700"
                                : "text-amber-700"
                            }`}
                          >
                            {resItem.marksAwarded} / {resItem.maxMarks} marks
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed">
                          {resItem.feedback}
                        </p>

                        <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 space-y-1">
                          <div className="text-[11px] font-semibold text-slate-600">
                            Official ECZ Marking Scheme
                          </div>
                          <ul className="space-y-1 text-[11px] text-slate-700">
                            {resItem.officialScheme.map((line, i) => (
                              <li key={i}>• {line}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: NATIONWIDE LEADERBOARD */}
      {activeTab === "leaderboard" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Zambian Nationwide Competition Leaderboard
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Live verified scores recorded with each learner's full name,
                school, province, and time taken.
              </p>
            </div>

            {firebaseUser && (
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search learner or school..."
                    className="pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[38px]"
                  />
                </div>
                <select
                  aria-label="Filter leaderboard by grade"
                  value={gradeFilter}
                  onChange={(e) =>
                    setGradeFilter(e.target.value as "All" | GradeLevel)
                  }
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white min-h-[38px]"
                >
                  <option value="All">All Grades</option>
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>
            )}
          </div>

          {!firebaseUser ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 text-center space-y-3">
              <Trophy className="w-8 h-8 text-amber-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-900">
                Sign in with Google to View & Join the Live Nationwide Board
              </div>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                To keep competition records genuine across Zambia, live rankings
                and official score submissions require verified Google sign-in.
              </p>
              <button
                type="button"
                onClick={() => void handleGoogleSignIn()}
                disabled={authBusy}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
              >
                {authBusy ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LogIn className="w-3.5 h-3.5" />
                )}
                Sign in with Google
              </button>
            </div>
          ) : leaderboardLoading ? (
            <div className="py-12 flex items-center justify-center gap-2 text-xs text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
              Loading live Zambian leaderboard...
            </div>
          ) : leaderboardError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
              {leaderboardError}
            </div>
          ) : filteredLeaderboard.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
              <div className="text-sm font-semibold text-slate-900">
                No recorded competition scripts match this filter yet
              </div>
              <p className="text-xs text-slate-600">
                Be the first from your school to take a test and claim #1 on the
                national leaderboard!
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("take")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
              >
                Take Nationwide Test
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    <th className="py-3 pr-3">Rank</th>
                    <th className="py-3 px-3">Learner & School</th>
                    <th className="py-3 px-3">Province</th>
                    <th className="py-3 px-3">Grade</th>
                    <th className="py-3 px-3 text-right">Marks</th>
                    <th className="py-3 px-3 text-right">Score %</th>
                    <th className="py-3 px-3 text-right">Time</th>
                    <th className="py-3 pl-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredLeaderboard.map((entry, index) => {
                    const rank = index + 1;
                    const isMine = entry.uid === firebaseUser.uid;
                    return (
                      <tr
                        key={entry.id}
                        className={isMine ? "bg-emerald-50/60" : "hover:bg-slate-50"}
                      >
                        <td className="py-3.5 pr-3 font-mono font-bold tabular-nums">
                          {rank === 1 ? (
                            <span className="text-amber-600">#1 Gold</span>
                          ) : rank === 2 ? (
                            <span className="text-slate-600">#2 Silver</span>
                          ) : rank === 3 ? (
                            <span className="text-orange-700">#3 Bronze</span>
                          ) : (
                            <span className="text-slate-500">#{rank}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-slate-900">
                            {entry.learnerName}
                            {isMine && (
                              <span className="ml-1.5 text-[11px] font-medium text-emerald-700">
                                (You)
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600">
                            {entry.schoolName}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-700">
                          {entry.province}
                        </td>
                        <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                          {entry.grade}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-800">
                          {entry.totalScore}/{entry.maxScore}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold tabular-nums text-emerald-800">
                          {entry.percentage}%
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-600">
                          {formatSeconds(entry.timeTakenSeconds)}
                        </td>
                        <td className="py-3.5 pl-3 text-right">
                          {isMine ? (
                            <button
                              type="button"
                              onClick={() => void handleDeleteEntry(entry.id)}
                              disabled={deletingId === entry.id}
                              aria-label="Remove your entry"
                              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TOP SCHOOLS & PRIZES */}
      {activeTab === "prizes" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Top Performing Schools */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Top Performing Zambian Schools
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Ranked live by average competition percentage across recorded
                candidates from each school.
              </p>
            </div>

            {!firebaseUser ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-xs text-slate-700 space-y-3">
                <p>
                  Sign in with Google to view live school averages recorded
                  across Zambia.
                </p>
                <button
                  type="button"
                  onClick={() => void handleGoogleSignIn()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 text-white font-semibold cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign in with Google
                </button>
              </div>
            ) : topSchools.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-xs text-slate-600 text-center">
                No schools recorded yet — enter your school name and submit a
                test to put your school on top!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                      <th className="py-2.5 pr-3">Rank</th>
                      <th className="py-2.5 px-3">School Name</th>
                      <th className="py-2.5 px-3">Province</th>
                      <th className="py-2.5 px-3 text-right">Entries</th>
                      <th className="py-2.5 px-3 text-right">Best %</th>
                      <th className="py-2.5 pl-3 text-right">Avg %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {topSchools.map((s, idx) => (
                      <tr key={`${s.schoolName}-${s.province}`}>
                        <td className="py-3 pr-3 font-mono font-bold tabular-nums text-slate-700">
                          #{idx + 1}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {s.schoolName}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {s.province}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                          {s.entriesCount}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800">
                          {s.bestPct}%
                        </td>
                        <td className="py-3 pl-3 text-right font-mono font-bold tabular-nums text-emerald-800">
                          {s.avgPct}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Prizes & Motivation Breakdown */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Prizes for Studying Extra Hard
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Every term, Kasukulu rewards top-scoring learners and leading
                schools across Zambia.
              </p>
            </div>

            <div className="space-y-3">
              {COMPETITION_PRIZES.map((prize) => (
                <div
                  key={prize.rankLabel}
                  className="rounded-xl border border-slate-200 p-4 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-emerald-800">
                      {prize.rankLabel}
                    </span>
                    <span className="text-xs font-semibold text-slate-900">
                      {prize.title}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-800">
                    {prize.reward}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {prize.motivationNote}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
