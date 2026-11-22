import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckSquare,
  Clock,
  FileText,
  Flame,
  Flag,
  PenTool,
  PhoneCall,
  Trophy,
} from "lucide-react";
import {
  ECZ_SCHOOL_TUTORS,
  calculateStudyStreak,
  getDailyStudyQuote,
  getStreakMilestones,
  type LearnerProfile,
  type StudyProgress,
} from "../data/curriculum";
import {
  getGreetingForLanguageAndTime,
  getLanguageByLanguageAid,
} from "../data/greetings";
import {
  findNextStudySession,
  formatTime12h,
  getNextUpcomingExam,
  parseLocalDateKey,
  type StudyCalendarState,
} from "../data/studyCalendar";
import { TutorPortrait } from "./TutorPortrait";
import type { StudyTab } from "./RightStudyPanel";
import deskBannerImg from "../assets/images/banner_kasukulu_desk_1794757601425.jpg";

export type HomeDestination = {
  tab: StudyTab;
  voiceMode?: "live" | "turn";
};

interface HomeHubProps {
  profile: LearnerProfile;
  progress: StudyProgress;
  activeTutorId: string;
  calendar: StudyCalendarState;
  isReturningLearner?: boolean;
  onOpenDestination: (dest: HomeDestination) => void;
  onSelectTutorAndEnter: (tutorId: string) => void;
  onOpenCompetitions: () => void;
  onOpenCalendar: () => void;
  onStartScheduledStudy: (tutorId: string, topicNote?: string) => void;
  onOpenProfile: () => void;
}

export function HomeHub({
  profile,
  progress,
  activeTutorId,
  calendar,
  isReturningLearner = false,
  onOpenDestination,
  onSelectTutorAndEnter,
  onOpenCompetitions,
  onOpenCalendar,
  onStartScheduledStudy,
  onOpenProfile,
}: HomeHubProps) {
  const [bannerImgFailed, setBannerImgFailed] = useState(false);

  const nextExamInfo = getNextUpcomingExam(calendar.exams);
  const nextStudySession = findNextStudySession(calendar.timetable);
  const studyStreak = calculateStudyStreak(progress.dailyActivity);
  const milestones = getStreakMilestones(studyStreak);

  const accuracyPct =
    progress.quizAnswered > 0
      ? Math.round((progress.quizCorrect / progress.quizAnswered) * 100)
      : 0;

  const activities: Array<{
    id: string;
    title: string;
    description: string;
    cta: string;
    icon: typeof PhoneCall;
    iconTone: string;
    dest: HomeDestination;
  }> = [
    {
      id: "voice-call",
      title: "Live Voice Class with a Tutor",
      description:
        "Speak aloud in a calm, interactive voice class where your tutor explains one step at a time and writes notes on screen.",
      cta: "Open Voice Studio",
      icon: PhoneCall,
      iconTone: "bg-emerald-700 text-white",
      dest: { tab: "blackboard", voiceMode: "live" },
    },
    {
      id: "past-papers",
      title: "Practice ECZ Past Papers",
      description:
        "Revise real Grade 7, 9, and 12 ECZ exam questions with M1/A1 marking schemes and step-by-step tutor coaching.",
      cta: "Open Past Papers",
      icon: FileText,
      iconTone: "bg-amber-100 text-amber-900",
      dest: { tab: "papers" },
    },
    {
      id: "writing-pad",
      title: "Write & Check on Study Pad",
      description:
        "Write equations or draw diagrams on ruled or grid paper and send your working directly to your tutor.",
      cta: "Open Writing Pad",
      icon: PenTool,
      iconTone: "bg-emerald-50 text-emerald-800",
      dest: { tab: "pad" },
    },
    {
      id: "topics",
      title: "Browse Subjects & Topics",
      description:
        "Explore all ECZ & A-Level subjects on their own and choose any syllabus topic inside each subject to revise.",
      cta: "Browse Subjects",
      icon: BookOpen,
      iconTone: "bg-slate-100 text-slate-800",
      dest: { tab: "topics" },
    },
    {
      id: "quiz",
      title: "Take an ECZ Practice Quiz",
      description:
        "Test your exam readiness with 3 targeted multiple-choice questions and spoken explanations.",
      cta: "Start Quiz",
      icon: CheckSquare,
      iconTone: "bg-emerald-50 text-emerald-800",
      dest: { tab: "quiz" },
    },
    {
      id: "progress",
      title: "Track Weekly Consistency",
      description:
        "Review your 7-day study sessions chart, quiz accuracy trend, and saved blackboard revision notes.",
      cta: "View Progress",
      icon: BarChart3,
      iconTone: "bg-amber-100 text-amber-900",
      dest: { tab: "progress" },
    },
  ];

  const dailyQuote = getDailyStudyQuote();
  const langItem = getLanguageByLanguageAid(profile.languageAid);
  const timeGreeting = getGreetingForLanguageAndTime(langItem.id);

  return (
    <div className="space-y-8">
      {/* Editorial Hero Showcase (appears immediately after StudyMusicBar) */}
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch shadow-sm">
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <div className="text-xs font-medium text-emerald-300">
              <span>
                {langItem.id === "english"
                  ? `${timeGreeting.phrase}${isReturningLearner ? " — Welcome back" : ""}`
                  : `${timeGreeting.phrase} (${timeGreeting.translation})${isReturningLearner ? " — Welcome back" : ""}`}
              </span>
              <span aria-hidden="true"> · </span>
              {profile.grade}
              <span aria-hidden="true"> · </span>
              {profile.languageAid}
              <span aria-hidden="true"> · </span>
              {profile.province}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-[1.12] text-balance">
              What would you like to do today, {profile.name || "Learner"}?
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Choose your next study step — call an AI voice tutor, solve ECZ
              past papers with marking schemes, or write out your working on
              the study pad to pass with flying colors.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  onOpenDestination({ tab: "blackboard", voiceMode: "live" })
                }
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[44px] cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Start Live Voice Class</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenDestination({ tab: "papers" })}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0 min-h-[44px] cursor-pointer"
              >
                <FileText className="w-4 h-4 text-amber-300" />
                <span>ECZ Past Papers</span>
              </button>

              <button
                type="button"
                onClick={onOpenCalendar}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0 min-h-[44px] cursor-pointer"
              >
                <CalendarDays className="w-4 h-4 text-emerald-300" />
                <span>Study Calendar</span>
              </button>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
              <span className="tabular-nums">
                <strong className="text-amber-300 font-semibold">
                  {studyStreak}
                </strong>{" "}
                day streak 🔥
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                <strong className="text-white font-semibold">
                  {progress.sessionsCompleted}
                </strong>{" "}
                sessions
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                <strong className="text-emerald-300 font-semibold">
                  {accuracyPct}%
                </strong>{" "}
                quiz accuracy
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                <strong className="text-white font-semibold">
                  {progress.savedNotes.length}
                </strong>{" "}
                saved notes
              </span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={onOpenProfile}
                className="text-slate-200 underline hover:text-white whitespace-nowrap"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Desk Photography Panel */}
        <div className="lg:col-span-5 relative min-h-[220px] sm:min-h-[260px] bg-slate-900">
          {!bannerImgFailed && (
            <img
              src={deskBannerImg}
              alt="Zambian student study desk with algebra graphs, brass compass, and audio lesson on smartphone"
              referrerPolicy="no-referrer"
              onError={() => setBannerImgFailed(true)}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent lg:bg-gradient-to-r lg:from-slate-950/70 lg:via-slate-950/20 lg:to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 text-xs text-slate-100">
            <span className="font-semibold text-amber-300">
              Audio + Live Board + Pad
            </span>
            <span aria-hidden="true"> · </span>
            <span>See equations & steps while your tutor explains</span>
          </div>
        </div>
      </section>

      {/* Daily Encouragement Quote Banner */}
      <section
        aria-label="Daily Study Encouragement"
        className="rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 via-white to-amber-50/70 p-5 shadow-2xs flex items-start gap-4"
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-700 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 font-serif text-xl font-bold">
          “
        </div>
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            Daily Study Encouragement · Before You Begin
          </div>
          <blockquote className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed italic">
            "{dailyQuote.quote}"
          </blockquote>
          <div className="text-xs text-slate-600 font-medium">
            — {dailyQuote.author}{" "}
            <span className="text-slate-400">({dailyQuote.context})</span>
          </div>
        </div>
      </section>

      {/* Study Streak Tracker Banner */}
      <section
        aria-label="Study Streak Tracker"
        className="rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-50 via-emerald-50/40 to-white p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold tabular-nums">
                {studyStreak} {studyStreak === 1 ? "DAY STREAK" : "DAYS STREAK"} 🔥
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {studyStreak > 0 ? "You're on fire!" : "Start your streak today!"}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {studyStreak > 0
                ? `You have completed study sessions on ${studyStreak} consecutive ${studyStreak === 1 ? "day" : "days"}. Keep your daily revision habit burning!`
                : "Complete a live voice class or practice quiz today to start your daily study streak and build winning exam habits."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onOpenDestination({ tab: "blackboard", voiceMode: "live" })}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>Continue Studying</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* Streak Milestones & Rewards */}
      <section aria-label="Streak Milestones" className="space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Streak Milestones & Rewards
          </h2>
          <span className="text-xs text-slate-500">
            Unlock exclusive rewards as you build your study habit
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {milestones.map((m) => (
            <div
              key={m.days}
              className={`rounded-xl border p-4 flex flex-col justify-between gap-2 transition-colors ${
                m.unlocked
                  ? "border-emerald-300 bg-gradient-to-br from-emerald-50/70 to-white"
                  : "border-slate-200 bg-white opacity-70"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900">
                  {m.label} ({m.days} Days)
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    m.unlocked
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {m.unlocked ? "Unlocked" : `${Math.max(0, m.days - studyStreak)} days left`}
                </span>
              </div>
              <div className="text-xs text-slate-600 font-medium">
                Reward: <span className="text-slate-900 font-semibold">{m.reward}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Study Timetable & Exam Countdown Spotlight */}
      <section
        aria-label="Study Timetable and Exam Countdown"
        className="rounded-2xl border border-slate-200 bg-white px-5 py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
      >
        <div className="md:col-span-5 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
            <Flag className="w-5 h-5" />
          </div>
          <div className="min-w-0 space-y-0.5">
            {nextExamInfo ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-white text-[11px] font-bold tabular-nums">
                    {nextExamInfo.daysLeft === 0
                      ? "EXAM TODAY"
                      : `${nextExamInfo.daysLeft} ${
                          nextExamInfo.daysLeft === 1 ? "DAY" : "DAYS"
                        } LEFT`}
                  </span>
                  <span className="text-sm font-semibold text-slate-900 truncate">
                    {nextExamInfo.exam.title}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {parseLocalDateKey(
                    nextExamInfo.exam.examDate
                  ).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                  {nextExamInfo.exam.targetGoal
                    ? ` · Goal: ${nextExamInfo.exam.targetGoal}`
                    : ""}
                </p>
              </>
            ) : (
              <>
                <div className="text-sm font-semibold text-slate-900">
                  Set Your Exam Date & Stay Eager
                </div>
                <p className="text-xs text-slate-600">
                  Add your upcoming ECZ or mock exam date for a live countdown.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="md:col-span-4 flex items-start gap-3 md:border-l md:border-slate-200 md:pl-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0 space-y-0.5">
            {nextStudySession ? (
              <>
                <div className="text-xs font-semibold text-slate-900 truncate">
                  Next Study: {nextStudySession.dayLabel} at{" "}
                  {formatTime12h(nextStudySession.slot.startTime)}
                </div>
                <p className="text-xs text-slate-600 truncate">
                  {nextStudySession.slot.subject} (
                  {nextStudySession.slot.durationMinutes} min)
                </p>
              </>
            ) : (
              <>
                <div className="text-xs font-semibold text-slate-900">
                  No Study Time Set Yet
                </div>
                <p className="text-xs text-slate-600">
                  Pick your best daily study hours on your timetable.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="md:col-span-3 flex flex-wrap md:justify-end gap-2">
          {nextStudySession && (
            <button
              type="button"
              onClick={() =>
                onStartScheduledStudy(
                  nextStudySession.slot.tutorId,
                  nextStudySession.slot.topicNote ||
                    nextStudySession.slot.subject
                )
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>Study Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onOpenCalendar}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:border-emerald-700 text-slate-800 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
          >
            <CalendarDays className="w-3.5 h-3.5 text-emerald-700" />
            <span>Open Calendar</span>
          </button>
        </div>
      </section>

      {/* Nationwide Competitions & Prizes Spotlight */}
      <section aria-label="Nationwide ECZ Competitions" className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/90 via-white to-amber-50/80 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Trophy className="w-5 h-5 text-amber-300" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-slate-900">
              Nationwide ECZ Competition Dashboard & Prizes
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              Record your name and school, sit timed Grade 7, 9, or 12 tests
              marked right inside Kasukulu, and compete for study tablets,
              50 GB data bundles, and Pioneer Passes.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenCompetitions}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[44px] cursor-pointer"
        >
          <Trophy className="w-4 h-4 text-amber-300" />
          <span>Enter Nationwide Competition</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* Activity Choice Grid */}
      <section aria-label="Choose a study activity" className="space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">
            Choose What You Want To Do
          </h2>
          <span className="text-xs text-slate-500">
            6 study tools · tailored for {profile.grade}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpenDestination(item.dest)}
                className="group text-left rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-700 hover:-translate-y-0.5 transition-all duration-150 flex flex-col justify-between gap-4 cursor-pointer shadow-2xs"
              >
                <div className="space-y-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.iconTone}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-semibold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 group-hover:text-emerald-900">
                  <span>{item.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Quick Tutor Picker */}
      <section aria-label="Start with a tutor" className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">
          Or Jump Directly Into a Session With a Tutor
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ECZ_SCHOOL_TUTORS.map((tutor) => {
            const isCurrent = tutor.id === activeTutorId;
            return (
              <button
                key={tutor.id}
                type="button"
                onClick={() => onSelectTutorAndEnter(tutor.id)}
                className={`group flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all duration-150 hover:-translate-y-0.5 cursor-pointer ${
                  isCurrent
                    ? "border-emerald-700 bg-white ring-1 ring-emerald-700"
                    : "border-slate-200 bg-white hover:border-emerald-700"
                }`}
              >
                <TutorPortrait
                  tutorId={tutor.id}
                  name={tutor.name}
                  sizeClass="w-12 h-12"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {tutor.name}
                  </div>
                  <div className="text-xs text-slate-600 truncate mt-0.5">
                    {tutor.subjectFocus}
                  </div>
                  <div className="mt-1.5 text-[11px] font-medium text-emerald-700 group-hover:text-emerald-900">
                    Start studying →
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
