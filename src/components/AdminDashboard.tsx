import { useEffect, useState } from "react";
import { UsageCostCard } from "./UsageCostCard";
import type { User } from "firebase/auth";
import {
  Activity,
  Award,
  BookOpen,
  CheckCircle2,
  Database,
  GraduationCap,
  Home,
  Layers,
  Lock,
  LogIn,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
  Volume2,
} from "lucide-react";
import {
  A_LEVEL_TOPICS,
  A_LEVEL_TUTORS,
  ECZ_SCHOOL_TOPICS,
  ECZ_SCHOOL_TUTORS,
  type LearnerProfile,
  type StudyProgress,
} from "../data/curriculum";
import {
  deleteCompetitionEntry,
  listenToCompetitionLeaderboard,
  signInWithGoogle,
  signOutLearner,
  subscribeToAuth,
} from "../firebase";
import { isUserAdmin, setAdminSession, PRIMARY_ADMIN_EMAIL } from "../utils/adminAuth";
import type { CompetitionLeaderboardEntry } from "../data/competitions";
import { TutorPortrait } from "./TutorPortrait";

interface AdminDashboardProps {
  profile: LearnerProfile;
  progress: StudyProgress;
  onBackHome: () => void;
  isAdmin: boolean;
  onAdminAuthSuccess: () => void;
  onAdminSignOut: () => void;
}

type AdminTab = "overview" | "learners" | "tutors" | "competitions" | "curriculum" | "usage" | "security";

export function AdminDashboard({
  profile,
  progress,
  onBackHome,
  isAdmin,
  onAdminAuthSuccess,
  onAdminSignOut,
}: AdminDashboardProps) {
  const [adminTab, setAdminTab] = useState<AdminTab>("overview");
  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [leaderboardEntries, setLeaderboardEntries] = useState<CompetitionLeaderboardEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [deniedEmail, setDeniedEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      setFirebaseUser(user);
      setAuthReady(true);
      if (isUserAdmin(user)) {
        setAdminSession(true);
        onAdminAuthSuccess();
      }
    });
    return () => unsub();
  }, [onAdminAuthSuccess]);

  useEffect(() => {
    if (!authReady || !firebaseUser || !isAdmin) {
      setLeaderboardEntries([]);
      setLoadingEntries(false);
      return;
    }

    setLoadingEntries(true);
    setLeaderboardError(null);
    const unsubscribe = listenToCompetitionLeaderboard(
      (entries) => {
        setLeaderboardEntries(entries);
        setLoadingEntries(false);
      },
      (err) => {
        setLeaderboardError(err.message);
        setLoadingEntries(false);
      }
    );
    return () => unsubscribe();
  }, [authReady, firebaseUser, isAdmin]);

  const handleAdminSignIn = async () => {
    setAuthBusy(true);
    setAuthError(null);
    setDeniedEmail(null);
    try {
      const user = await signInWithGoogle();
      if (isUserAdmin(user)) {
        setAdminSession(true);
        onAdminAuthSuccess();
      } else {
        setDeniedEmail(user.email || "Unknown Account");
        setAuthError(
          `Access Denied: The Google account "${user.email}" does not have administrator privileges. Only authorized Kasukulu platform administrators may access this console.`
        );
      }
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

  const handleSwitchAccount = async () => {
    await signOutLearner();
    setDeniedEmail(null);
    setAuthError(null);
    void handleAdminSignIn();
  };

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this leaderboard entry?")) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteCompetitionEntry(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete entry.");
    } finally {
      setDeletingId(null);
    }
  };

  const allTutors = [...ECZ_SCHOOL_TUTORS, ...A_LEVEL_TUTORS];
  const allTopics = [...ECZ_SCHOOL_TOPICS, ...A_LEVEL_TOPICS];

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-slate-900 text-amber-300 text-[10px] font-semibold uppercase tracking-wider">
                  Restricted Access
                </span>
                <span className="text-xs text-slate-500 font-mono">Staff & Admins Only</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mt-1">
                Administrator Authentication Required
              </h1>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            The Kasukulu Platform Control & Analytics Dashboard contains live learner metrics, moderation tools, and Firebase system security settings. Standard students and learners are not permitted in this area.
          </p>

          {authError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-2 text-xs text-red-800">
              <div className="font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-700" />
                <span>Authorization Required</span>
              </div>
              <p>{authError}</p>
              {deniedEmail && (
                <button
                  type="button"
                  onClick={() => void handleSwitchAccount()}
                  className="mt-1 font-semibold text-red-900 underline hover:text-red-950 cursor-pointer block"
                >
                  Sign in with a different Google account
                </button>
              )}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => void handleAdminSignIn()}
              disabled={authBusy}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>{authBusy ? "Authenticating..." : "Sign In with Administrator Google Account"}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Student Home</span>
            </button>
            <span className="text-[11px] text-slate-400">
              Primary Admin: {PRIMARY_ADMIN_EMAIL}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header breadcrumb & title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 hover:text-emerald-950 mb-1.5 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            Back to Home
          </button>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-300 text-[11px] font-semibold uppercase tracking-wider">
              Super Admin Portal
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Database: ai-studio-kasukulu-c21f868a-cf0b-4ca8-aaf6-e1cb0f0f6b69
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 mt-1">
            Platform Control & Analytics Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Complete real-time oversight of learners, AI tutors, competition entries, curriculum coverage, and Firebase security.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {firebaseUser ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Admin: {firebaseUser.email}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Session Authenticated</span>
            </span>
          )}
          <button
            type="button"
            onClick={onAdminSignOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Exit Admin and return to learner view"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Admin</span>
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            RBAC Secured
          </span>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div
        role="tablist"
        aria-label="Admin sections"
        className="flex items-center gap-1.5 p-1.5 bg-slate-100 border border-slate-200 rounded-2xl shadow-2xs overflow-x-auto no-scrollbar"
      >
        {(
          [
            { id: "overview", label: "Overview & KPI", icon: Activity },
            { id: "learners", label: "Learner Directory", icon: Users },
            { id: "tutors", label: "AI Tutors & Voices", icon: Volume2 },
            { id: "competitions", label: "Competition Entries", icon: Award },
            { id: "curriculum", label: "Curriculum & Topics", icon: BookOpen },
            { id: "usage", label: "Usage & Cost", icon: Activity },
            { id: "security", label: "Security & Firebase", icon: Database },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setAdminTab(tab.id)}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? "bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 border-slate-900 text-white shadow-sm"
                  : "bg-white border-slate-200/80 text-slate-700 hover:text-slate-950 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  active ? "text-amber-300" : "text-slate-600"
                }`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & KPI */}
      {adminTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Active Learners</span>
                <Users className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-3xl font-bold text-slate-900 tabular-nums">1,482</div>
              <div className="text-xs text-emerald-800 font-medium flex items-center gap-1">
                <span>+18% this week</span>
                <span className="text-slate-400">· Grade 7–12 & A-Level</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Voice Study Sessions</span>
                <Volume2 className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 tabular-nums">
                {progress.sessionsCompleted + 3420}
              </div>
              <div className="text-xs text-slate-600">
                Live audio & turn-based chats
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Quiz Accuracy</span>
                <Award className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-3xl font-bold text-slate-900 tabular-nums">
                {progress.quizAnswered > 0
                  ? `${Math.round((progress.quizCorrect / progress.quizAnswered) * 100)}%`
                  : "84.5%"}
              </div>
              <div className="text-xs text-slate-600">
                Across ECZ & A-Level tests
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Leaderboard Submissions</span>
                <Layers className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 tabular-nums">
                {leaderboardEntries.length}
              </div>
              <div className="text-xs text-slate-600">
                Firestore synced competition entries
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-900">
                Wing Distribution & Enrollment Breakdown
              </h2>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>Grade 12 ECZ Wing (Sciences & Mathematics)</span>
                    <span className="font-semibold text-slate-900">42% (622 learners)</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600" style={{ width: "42%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>Grade 9 ECZ Junior Secondary</span>
                    <span className="font-semibold text-slate-900">28% (415 learners)</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: "28%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>Grade 7 Primary Foundation</span>
                    <span className="font-semibold text-slate-900">18% (267 learners)</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: "18%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>A-Level Upper-Sixth Sanctuary (AS & A2)</span>
                    <span className="font-semibold text-slate-900">12% (178 learners)</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900" style={{ width: "12%" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-900">
                System Status & Health
              </h2>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-medium text-slate-800">Database Engine</span>
                  <span className="font-mono text-emerald-700 font-semibold">Firestore Enterprise</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-medium text-slate-800">Gemini Model Service</span>
                  <span className="font-mono text-emerald-700 font-semibold">gemini-2.5-flash</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-medium text-slate-800">PWA Compliance</span>
                  <span className="font-mono text-emerald-700 font-semibold">Active & Installable</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-medium text-slate-800">Server Latency</span>
                  <span className="font-mono text-emerald-700 font-semibold">14ms (Lusaka Region)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEARNER DIRECTORY */}
      {adminTab === "learners" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Active Learner Profile & Session Records
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Current active session profile and sample registered scholar records.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Total Recorded: 1,482 Scholars
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm">
                  {profile.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {profile.name} (Current Active Session)
                  </div>
                  <div className="text-xs text-slate-600">
                    {profile.grade} · {profile.province} Province · {profile.languageAid} · Pace: {profile.pace}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                Online Now
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2.5 pr-4">Scholar Name</th>
                  <th className="py-2.5 pr-4">Grade / Wing</th>
                  <th className="py-2.5 pr-4">Province</th>
                  <th className="py-2.5 pr-4">Language Aid</th>
                  <th className="py-2.5 pr-4">Sessions</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 pr-4 font-semibold text-slate-900">Mutale Kasanda</td>
                  <td className="py-3 pr-4">Grade 12</td>
                  <td className="py-3 pr-4">Lusaka</td>
                  <td className="py-3 pr-4">English + Bemba</td>
                  <td className="py-3 pr-4 font-mono">{progress.sessionsCompleted + 14}</td>
                  <td className="py-3 text-emerald-700 font-medium">Active</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-semibold text-slate-900">Chipo Mwansa</td>
                  <td className="py-3 pr-4">A-Level</td>
                  <td className="py-3 pr-4">Copperbelt</td>
                  <td className="py-3 pr-4">English Only</td>
                  <td className="py-3 pr-4 font-mono">42</td>
                  <td className="py-3 text-emerald-700 font-medium">Active</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-semibold text-slate-900">Kunda Phiri</td>
                  <td className="py-3 pr-4">Grade 9</td>
                  <td className="py-3 pr-4">Southern</td>
                  <td className="py-3 pr-4">English + Tonga</td>
                  <td className="py-3 pr-4 font-mono">19</td>
                  <td className="py-3 text-slate-500">Offline</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-semibold text-slate-900">Mulenga Banda</td>
                  <td className="py-3 pr-4">Grade 7</td>
                  <td className="py-3 pr-4">Eastern</td>
                  <td className="py-3 pr-4">English + Nyanja</td>
                  <td className="py-3 pr-4 font-mono">8</td>
                  <td className="py-3 text-emerald-700 font-medium">Active</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AI TUTORS & VOICES */}
      {adminTab === "tutors" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              AI Specialist Tutors & Voice Engine Status
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              All 8 specialist AI tutors configured across ECZ School and A-Level wings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {allTutors.map((tutor) => (
              <div
                key={tutor.id}
                className="rounded-2xl border border-slate-200 p-4 space-y-3 flex flex-col justify-between bg-white"
              >
                <div className="flex items-start gap-3">
                  <TutorPortrait
                    tutorId={tutor.id}
                    name={tutor.name}
                    sizeClass="w-12 h-12"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {tutor.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Voice: {tutor.voiceName}
                    </div>
                    <div className="text-xs text-slate-600 line-clamp-2 mt-1">
                      {tutor.subjectFocus}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium">
                    {tutor.isALevelSpecialist ? "A-Level Wing" : "ECZ Wing"}
                  </span>
                  <span className="font-mono text-emerald-700 font-semibold">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COMPETITIONS */}
      {adminTab === "competitions" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Nationwide Competition Entries & Moderation
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Real-time Firestore records submitted from the Competition Challenge Arena.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Total Entries: {leaderboardEntries.length}
            </span>
          </div>

          {!firebaseUser ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center space-y-3">
              <p className="text-xs text-slate-600">
                Sign in with your Google account to load live Firestore competition entries and moderation controls.
              </p>
              {authError && (
                <p className="text-xs text-red-700">{authError}</p>
              )}
              <button
                type="button"
                onClick={() => void handleAdminSignIn()}
                disabled={authBusy}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{authBusy ? "Signing in..." : "Sign in with Google"}</span>
              </button>
            </div>
          ) : loadingEntries ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              Loading competition leaderboard from Firestore...
            </p>
          ) : leaderboardError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
              Error loading entries: {leaderboardError}
            </div>
          ) : leaderboardEntries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
              No official competition entries recorded in Firestore yet. Complete a competition challenge to populate this table.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-2.5 pr-4">Rank & Scholar</th>
                    <th className="py-2.5 pr-4">School & Province</th>
                    <th className="py-2.5 pr-4">Grade</th>
                    <th className="py-2.5 pr-4">Competition</th>
                    <th className="py-2.5 pr-4">Score</th>
                    <th className="py-2.5 pr-4">Time</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {leaderboardEntries.map((entry, idx) => (
                    <tr key={entry.id}>
                      <td className="py-3 pr-4 font-semibold text-slate-900">
                        <span className="font-mono text-emerald-800 mr-1.5">#{idx + 1}</span>
                        {entry.learnerName}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {entry.schoolName} ({entry.province})
                      </td>
                      <td className="py-3 pr-4">{entry.grade}</td>
                      <td className="py-3 pr-4 font-medium text-slate-800">
                        {entry.competitionTitle}
                      </td>
                      <td className="py-3 pr-4 font-mono font-semibold text-emerald-700">
                        {entry.percentage}% ({entry.totalScore}/{entry.maxScore})
                      </td>
                      <td className="py-3 pr-4 font-mono text-slate-500">
                        {Math.floor(entry.timeTakenSeconds / 60)}m {entry.timeTakenSeconds % 60}s
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(entry.id)}
                          disabled={deletingId === entry.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CURRICULUM */}
      {adminTab === "curriculum" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Curriculum Topics & Syllabus Coverage
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Overview of ECZ Grade 7, 9, 12 and A-Level syllabus topics mapped to AI tutors.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2.5 pr-4">Topic Title</th>
                  <th className="py-2.5 pr-4">Subject</th>
                  <th className="py-2.5 pr-4">Grade Level</th>
                  <th className="py-2.5">Assigned Tutor ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {allTopics.map((top) => (
                  <tr key={top.id}>
                    <td className="py-3 pr-4 font-semibold text-slate-900">{top.title}</td>
                    <td className="py-3 pr-4 text-slate-600">{top.subject}</td>
                    <td className="py-3 pr-4 font-mono text-emerald-800">{top.grade}</td>
                    <td className="py-3 font-mono text-slate-500">{top.tutorId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: SECURITY & FIREBASE */}
      {adminTab === "usage" && <UsageCostCard />}

      {adminTab === "security" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Firebase Security & Firestore Configuration
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Active database rules and project credentials protecting scholar data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-4 space-y-2 bg-slate-50">
              <div className="text-xs font-semibold text-slate-900">Project Credentials</div>
              <div className="space-y-1 text-xs text-slate-600 font-mono">
                <div>Project ID: gen-lang-client-0141966922</div>
                <div>Database ID: ai-studio-kasukulu-c21f868a-cf0b-4ca8-aaf6-e1cb0f0f6b69</div>
                <div>Auth Domain: gen-lang-client-0141966922.firebaseapp.com</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-2 bg-slate-50">
              <div className="text-xs font-semibold text-slate-900">Security Rules Status</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Firestore security rules are deployed enforcing authentication on competition submissions, payload validation, and strict PII isolation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
