import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Flame,
  Home,
  Plus,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import {
  A_LEVEL_TUTORS,
  ECZ_SCHOOL_TUTORS,
  getLocalDateKey,
  type LearnerProfile,
} from "../data/curriculum";
import {
  computeEndTime,
  findNextStudySession,
  formatTime12h,
  getDaysUntilExam,
  getExamEagernessMessage,
  getNextUpcomingExam,
  parseLocalDateKey,
  WEEKDAYS_MON_FIRST,
  type ExamDateEntry,
  type StudyCalendarState,
  type StudyTimetableSlot,
  type WeekdayIndex,
} from "../data/studyCalendar";
import { TutorPortrait } from "./TutorPortrait";

interface StudyCalendarViewProps {
  profile: LearnerProfile;
  calendar: StudyCalendarState;
  onAddTimetableSlots: (slots: Omit<StudyTimetableSlot, "id">[]) => void;
  onDeleteTimetableSlot: (slotId: string) => void;
  onToggleSlotCompleted: (dateKey: string, slotId: string) => void;
  onAddExam: (exam: Omit<ExamDateEntry, "id">) => void;
  onDeleteExam: (examId: string) => void;
  onBackHome: () => void;
  onStartStudyWithTutor: (tutorId: string, topicNote?: string) => void;
}

type ManagerTab = "timetable" | "exams";

const DURATION_OPTIONS = [30, 45, 60, 90, 120];

export function StudyCalendarView({
  profile,
  calendar,
  onAddTimetableSlots,
  onDeleteTimetableSlot,
  onToggleSlotCompleted,
  onAddExam,
  onDeleteExam,
  onBackHome,
  onStartStudyWithTutor,
}: StudyCalendarViewProps) {
  const today = new Date();
  const todayKey = getLocalDateKey(today);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);
  const [managerTab, setManagerTab] = useState<ManagerTab>(
    calendar.exams.length === 0 && calendar.timetable.length > 0
      ? "exams"
      : "timetable"
  );

  const isALevelLearner = profile.grade === "A-Level";
  const wingTutors = isALevelLearner ? A_LEVEL_TUTORS : ECZ_SCHOOL_TUTORS;

  // Timetable Form state
  const [selectedDays, setSelectedDays] = useState<WeekdayIndex[]>([
    1, 3, 5,
  ]);
  const [slotTime, setSlotTime] = useState("17:30");
  const [slotDuration, setSlotDuration] = useState(60);
  const [slotTutorId, setSlotTutorId] = useState(wingTutors[0].id);
  const [slotSubject, setSlotSubject] = useState(
    wingTutors[0].subjectFocus.split("&")[0].trim()
  );
  const [slotTopicNote, setSlotTopicNote] = useState("");
  const [slotError, setSlotError] = useState<string | null>(null);

  // Exam Form state
  const [examTitle, setExamTitle] = useState("");
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return getLocalDateKey(d);
  });
  const [examTime, setExamTime] = useState("08:00");
  const [examTutorId, setExamTutorId] = useState(wingTutors[0].id);
  const [examSubject, setExamSubject] = useState(
    wingTutors[0].subjectFocus.split("&")[0].trim()
  );
  const [examGoal, setExamGoal] = useState("Distinction (80%+)");
  const [examError, setExamError] = useState<string | null>(null);

  const nextExamInfo = useMemo(
    () => getNextUpcomingExam(calendar.exams),
    [calendar.exams]
  );

  const nextStudySession = useMemo(
    () => findNextStudySession(calendar.timetable),
    [calendar.timetable]
  );

  const totalWeeklyMinutes = useMemo(
    () =>
      calendar.timetable.reduce((acc, slot) => acc + slot.durationMinutes, 0),
    [calendar.timetable]
  );

  const totalCompletedCheckins = useMemo(
    () =>
      Object.values(calendar.completedSlotDates).reduce(
        (acc, list) => acc + list.length,
        0
      ),
    [calendar.completedSlotDates]
  );

  // Build Monday-first 42-cell (or 35-cell) calendar grid
  const calendarDays = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const firstWeekdayMonBased = (firstOfMonth.getDay() + 6) % 7; // 0 = Mon .. 6 = Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const totalCells =
      firstWeekdayMonBased + daysInMonth > 35 ? 42 : 35;

    const cells: Array<{
      date: Date;
      dateKey: string;
      inCurrentMonth: boolean;
      weekday: WeekdayIndex;
    }> = [];

    for (let i = 0; i < totalCells; i++) {
      const dayOffset = i - firstWeekdayMonBased;
      const cellDate = new Date(viewYear, viewMonth, 1 + dayOffset);
      cells.push({
        date: cellDate,
        dateKey: getLocalDateKey(cellDate),
        inCurrentMonth: cellDate.getMonth() === viewMonth,
        weekday: cellDate.getDay() as WeekdayIndex,
      });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const examsByDate = useMemo(() => {
    const map: Record<string, ExamDateEntry[]> = {};
    for (const exam of calendar.exams) {
      if (!map[exam.examDate]) map[exam.examDate] = [];
      map[exam.examDate].push(exam);
    }
    return map;
  }, [calendar.exams]);

  const slotsByWeekday = useMemo(() => {
    const map: Record<WeekdayIndex, StudyTimetableSlot[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };
    for (const slot of calendar.timetable) {
      map[slot.dayOfWeek].push(slot);
    }
    for (const key of Object.keys(map)) {
      map[Number(key) as WeekdayIndex].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
    }
    return map;
  }, [calendar.timetable]);

  const selectedDateObj = useMemo(
    () => parseLocalDateKey(selectedDateKey),
    [selectedDateKey]
  );
  const selectedWeekday = selectedDateObj.getDay() as WeekdayIndex;
  const selectedDaySlots = slotsByWeekday[selectedWeekday] ?? [];
  const selectedDayExams = examsByDate[selectedDateKey] ?? [];
  const selectedCompletedIds =
    calendar.completedSlotDates[selectedDateKey] ?? [];

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" }
  );

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDateKey(getLocalDateKey(now));
  };

  const toggleDaySelection = (day: WeekdayIndex) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSlotTutorChange = (tutorId: string) => {
    setSlotTutorId(tutorId);
    const t = wingTutors.find((item) => item.id === tutorId);
    if (t) setSlotSubject(t.subjectFocus.split("&")[0].trim());
  };

  const handleExamTutorChange = (tutorId: string) => {
    setExamTutorId(tutorId);
    const t = wingTutors.find((item) => item.id === tutorId);
    if (t) setExamSubject(t.subjectFocus.split("&")[0].trim());
  };

  const handleSubmitTimetable = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      setSlotError("Pick at least one day of the week for this study time.");
      return;
    }
    if (!slotSubject.trim()) {
      setSlotError("Enter the subject you want to study.");
      return;
    }
    setSlotError(null);
    onAddTimetableSlots(
      selectedDays.map((day) => ({
        dayOfWeek: day,
        startTime: slotTime,
        durationMinutes: slotDuration,
        subject: slotSubject.trim(),
        tutorId: slotTutorId,
        topicNote: slotTopicNote.trim() || undefined,
      }))
    );
    setSlotTopicNote("");
  };

  const handleApplyPreset = (
    preset: "evening" | "morning" | "weekend"
  ) => {
    if (isALevelLearner) {
      if (preset === "evening") {
        onAddTimetableSlots([
          {
            dayOfWeek: 1,
            startTime: "17:30",
            durationMinutes: 90,
            subject: "A-Level Mathematics (9709)",
            tutorId: "kaluba",
            topicNote: "Integration & differential equations",
          },
          {
            dayOfWeek: 2,
            startTime: "17:30",
            durationMinutes: 90,
            subject: "A-Level Chemistry (9701)",
            tutorId: "tembo",
            topicNote: "Organic mechanisms & energetics",
          },
          {
            dayOfWeek: 3,
            startTime: "17:30",
            durationMinutes: 90,
            subject: "A-Level Physics (9702)",
            tutorId: "sibanda",
            topicNote: "Fields, capacitors & quantum derivations",
          },
          {
            dayOfWeek: 4,
            startTime: "17:30",
            durationMinutes: 90,
            subject: "A-Level Biology (9700)",
            tutorId: "kangwa",
            topicNote: "Respiration, genetics & Paper 4 essays",
          },
          {
            dayOfWeek: 5,
            startTime: "17:30",
            durationMinutes: 90,
            subject: "AS & A2 Past Paper Drill",
            tutorId: "kaluba",
            topicNote: "Timed Paper 3/4 M1-A1 marking check",
          },
        ]);
      } else if (preset === "morning") {
        onAddTimetableSlots([
          {
            dayOfWeek: 1,
            startTime: "05:30",
            durationMinutes: 60,
            subject: "Pure Mathematics (9709)",
            tutorId: "kaluba",
            topicNote: "Morning proof & integration drill",
          },
          {
            dayOfWeek: 3,
            startTime: "05:30",
            durationMinutes: 60,
            subject: "Chemistry (9701)",
            tutorId: "tembo",
            topicNote: "Born-Haber cycles & equilibria",
          },
          {
            dayOfWeek: 5,
            startTime: "05:30",
            durationMinutes: 60,
            subject: "Physics (9702)",
            tutorId: "sibanda",
            topicNote: "Paper 5 uncertainty & planning",
          },
        ]);
      } else {
        onAddTimetableSlots([
          {
            dayOfWeek: 6,
            startTime: "09:00",
            durationMinutes: 120,
            subject: "Full A2 Timed Past Paper",
            tutorId: "kaluba",
            topicNote: "Complete structured paper & mark scheme audit",
          },
          {
            dayOfWeek: 0,
            startTime: "15:00",
            durationMinutes: 90,
            subject: "A-Level Practical & Error Review",
            tutorId: "kangwa",
            topicNote: "Experimental design & statistical tests",
          },
        ]);
      }
      return;
    }

    if (preset === "evening") {
      onAddTimetableSlots([
        {
          dayOfWeek: 1,
          startTime: "17:30",
          durationMinutes: 60,
          subject: "Mathematics",
          tutorId: "chanda",
          topicNote: "Worked steps & problem sets",
        },
        {
          dayOfWeek: 2,
          startTime: "17:30",
          durationMinutes: 60,
          subject: "Biology & Chemistry",
          tutorId: "mwansa",
          topicNote: "Key definitions & equations",
        },
        {
          dayOfWeek: 3,
          startTime: "17:30",
          durationMinutes: 60,
          subject: "Physics",
          tutorId: "phiri",
          topicNote: "Formulas & circuits",
        },
        {
          dayOfWeek: 4,
          startTime: "17:30",
          durationMinutes: 45,
          subject: "English & Civic Ed",
          tutorId: "banda",
          topicNote: "Comprehension & essays",
        },
        {
          dayOfWeek: 5,
          startTime: "17:30",
          durationMinutes: 60,
          subject: "ECZ Past Papers",
          tutorId: "chanda",
          topicNote: "Weekly timed revision",
        },
      ]);
    } else if (preset === "morning") {
      onAddTimetableSlots([
        {
          dayOfWeek: 1,
          startTime: "05:30",
          durationMinutes: 45,
          subject: "Mathematics",
          tutorId: "chanda",
          topicNote: "Fresh morning drills",
        },
        {
          dayOfWeek: 3,
          startTime: "05:30",
          durationMinutes: 45,
          subject: "Science Revision",
          tutorId: "mwansa",
          topicNote: "Morning recall quiz",
        },
        {
          dayOfWeek: 5,
          startTime: "05:30",
          durationMinutes: 45,
          subject: "Physics & Formulas",
          tutorId: "phiri",
          topicNote: "Quick calculations",
        },
      ]);
    } else {
      onAddTimetableSlots([
        {
          dayOfWeek: 6,
          startTime: "09:00",
          durationMinutes: 90,
          subject: "ECZ Past Paper Sprint",
          tutorId: "chanda",
          topicNote: "Full Paper 1 & 2 practice",
        },
        {
          dayOfWeek: 0,
          startTime: "15:00",
          durationMinutes: 60,
          subject: "Weak-Topic Review",
          tutorId: "banda",
          topicNote: "Prepare for the new week",
        },
      ]);
    }
  };

  const handleSubmitExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) {
      setExamError("Enter an exam name (for example: ECZ Math Paper 1).");
      return;
    }
    if (!examDate) {
      setExamError("Choose your exam date.");
      return;
    }
    setExamError(null);
    onAddExam({
      title: examTitle.trim(),
      subject: examSubject.trim() || "General ECZ",
      examDate,
      examTime: examTime || undefined,
      targetGoal: examGoal.trim() || undefined,
      tutorId: examTutorId,
    });
    setExamTitle("");
    const d = parseLocalDateKey(examDate);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setSelectedDateKey(examDate);
  };

  const sortedExams = useMemo(
    () =>
      [...calendar.exams].sort((a, b) =>
        a.examDate.localeCompare(b.examDate)
      ),
    [calendar.exams]
  );

  const eagerness = nextExamInfo
    ? getExamEagernessMessage(nextExamInfo.daysLeft)
    : null;

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
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 text-balance">
            Study Timetable & Exam Countdown Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Lock in your best daily hours to study and track every day left
            until your {profile.grade} exams.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 tabular-nums">
            <Clock className="w-3.5 h-3.5 text-emerald-700" />
            <strong className="text-slate-900">
              {(totalWeeklyMinutes / 60).toFixed(
                totalWeeklyMinutes % 60 === 0 ? 0 : 1
              )}
              h
            </strong>{" "}
            planned / week
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 tabular-nums">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <strong className="text-slate-900">{totalCompletedCheckins}</strong>{" "}
            sessions checked off
          </span>
        </div>
      </div>

      {/* Exam Countdown & Next Study Time Hero */}
      <section
        aria-label="Exam Countdown and Next Study Session"
        className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center shadow-sm"
      >
        <div className="lg:col-span-7 space-y-4">
          {nextExamInfo && eagerness ? (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-300 text-xs font-semibold">
                <Flag className="w-3.5 h-3.5" />
                <span>{eagerness.badge}</span>
                <span aria-hidden="true">·</span>
                <span>{nextExamInfo.exam.subject}</span>
              </div>

              <div className="flex flex-wrap items-baseline gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl sm:text-6xl font-bold tracking-tight text-emerald-300 tabular-nums">
                    {nextExamInfo.daysLeft === 0
                      ? "TODAY"
                      : nextExamInfo.daysLeft}
                  </span>
                  {nextExamInfo.daysLeft > 0 && (
                    <span className="text-sm sm:text-base font-medium text-slate-300 uppercase tracking-wider">
                      {nextExamInfo.daysLeft === 1 ? "day left" : "days left"}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-white">
                    {nextExamInfo.exam.title}
                  </h2>
                  <div className="text-xs text-slate-300 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>
                      {parseLocalDateKey(
                        nextExamInfo.exam.examDate
                      ).toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {nextExamInfo.exam.examTime && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{formatTime12h(nextExamInfo.exam.examTime)}</span>
                      </>
                    )}
                    {nextExamInfo.exam.targetGoal && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-300 font-medium">
                          Goal: {nextExamInfo.exam.targetGoal}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {eagerness.message}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    onStartStudyWithTutor(
                      nextExamInfo.exam.tutorId,
                      `${nextExamInfo.exam.title} revision`
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Prepare for This Exam Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setManagerTab("exams")}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Another Exam
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-300/30 text-emerald-300 text-xs font-semibold">
                <Target className="w-3.5 h-3.5" />
                <span>Ignite Your Exam Eagerness</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                When is your next ECZ or school exam, {profile.name || "Learner"}?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Add your exam date to start a live countdown that keeps you
                focused, eager, and right on schedule every single day.
              </p>
              <button
                type="button"
                onClick={() => setManagerTab("exams")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                Set My Exam Date
              </button>
            </div>
          )}
        </div>

        {/* Next Good Time To Study Box */}
        <div className="lg:col-span-5 rounded-2xl bg-white/10 border border-white/15 p-5 space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Next Good Time to Study
            </span>
            <CalendarDays className="w-4 h-4 text-emerald-300" />
          </div>

          {nextStudySession ? (
            (() => {
              const tutor =
                wingTutors.find((t) => t.id === nextStudySession.slot.tutorId) ??
                wingTutors[0];
              return (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <TutorPortrait
                      tutorId={tutor.id}
                      name={tutor.name}
                      sizeClass="w-11 h-11"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {nextStudySession.dayLabel} ·{" "}
                        {formatTime12h(nextStudySession.slot.startTime)} –{" "}
                        {formatTime12h(
                          computeEndTime(
                            nextStudySession.slot.startTime,
                            nextStudySession.slot.durationMinutes
                          )
                        )}
                      </div>
                      <div className="text-xs text-slate-300 truncate">
                        {nextStudySession.slot.subject} with {tutor.name}
                      </div>
                      {nextStudySession.slot.topicNote && (
                        <div className="text-[11px] text-amber-300 truncate mt-0.5">
                          Focus: {nextStudySession.slot.topicNote}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onStartStudyWithTutor(
                        tutor.id,
                        nextStudySession.slot.topicNote ||
                          nextStudySession.slot.subject
                      )
                    }
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-emerald-50 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>
                      {nextStudySession.isToday
                        ? "Start This Study Session"
                        : "Warm Up Early with Tutor"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })()
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-200 leading-relaxed">
                Pick the hours when your mind feels sharpest — early morning at
                5:30 AM or after school at 5:30 PM — and build your weekly study
                rhythm.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPreset("evening")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Load 5:30 PM Routine
                </button>
                <button
                  type="button"
                  onClick={() => setManagerTab("timetable")}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Custom Time
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Calendar Grid + Timetable/Exam Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 cols: Monthly Calendar + Selected Day Agenda */}
        <section
          aria-label="Monthly Study and Exam Calendar"
          className="lg:col-span-7 space-y-4"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
            {/* Month Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-700" />
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  {monthLabel}
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                  className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleJumpToday}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                Study timetable block
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                Exam date
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                Completed study day
              </span>
            </div>

            {/* Weekday Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {WEEKDAYS_MON_FIRST.map((w) => (
                <div key={w.index} className="py-1.5">
                  {w.short}
                </div>
              ))}
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((cell) => {
                const isToday = cell.dateKey === todayKey;
                const isSelected = cell.dateKey === selectedDateKey;
                const daySlots = slotsByWeekday[cell.weekday] ?? [];
                const dayExams = examsByDate[cell.dateKey] ?? [];
                const completedIds =
                  calendar.completedSlotDates[cell.dateKey] ?? [];
                const allSlotsDone =
                  daySlots.length > 0 &&
                  daySlots.every((s) => completedIds.includes(s.id));

                return (
                  <button
                    key={cell.dateKey}
                    type="button"
                    onClick={() => setSelectedDateKey(cell.dateKey)}
                    className={`min-h-[72px] sm:min-h-[82px] rounded-xl p-1.5 sm:p-2 border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "border-emerald-700 bg-emerald-50/70 ring-1 ring-emerald-700"
                        : dayExams.length > 0
                        ? "border-amber-300 bg-amber-50/50 hover:border-amber-400"
                        : cell.inCurrentMonth
                        ? "border-slate-200 bg-white hover:border-slate-300"
                        : "border-slate-100 bg-slate-50/60 text-slate-400 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-xs font-semibold tabular-nums w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday
                            ? "bg-emerald-700 text-white"
                            : cell.inCurrentMonth
                            ? "text-slate-900"
                            : "text-slate-400"
                        }`}
                      >
                        {cell.date.getDate()}
                      </span>
                      {allSlotsDone && (
                        <CheckCircle2
                          className="w-3.5 h-3.5 text-emerald-700 shrink-0"
                          aria-label="All study sessions completed"
                        />
                      )}
                    </div>

                    <div className="space-y-1 mt-1">
                      {dayExams.slice(0, 1).map((ex) => (
                        <div
                          key={ex.id}
                          className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[10px] font-semibold truncate"
                          title={ex.title}
                        >
                          {ex.title}
                        </div>
                      ))}
                      {dayExams.length > 1 && (
                        <div className="text-[10px] font-semibold text-amber-800 px-1">
                          +{dayExams.length - 1} more exam
                        </div>
                      )}
                      {daySlots.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap px-0.5">
                          {daySlots.slice(0, 3).map((s) => {
                            const done = completedIds.includes(s.id);
                            return (
                              <span
                                key={s.id}
                                className={`w-2 h-2 rounded-full ${
                                  done ? "bg-emerald-700" : "bg-emerald-400"
                                }`}
                                title={`${formatTime12h(s.startTime)} · ${s.subject}`}
                              />
                            );
                          })}
                          {daySlots.length > 3 && (
                            <span className="text-[10px] text-emerald-800 font-medium">
                              +{daySlots.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Agenda Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                  Selected Day Agenda
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  {selectedDateObj.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setExamDate(selectedDateKey);
                  setManagerTab("exams");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-medium transition-colors cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                Set Exam on This Date
              </button>
            </div>

            {selectedDayExams.length > 0 && (
              <div className="space-y-2">
                {selectedDayExams.map((exam) => {
                  const daysLeft = getDaysUntilExam(exam.examDate);
                  return (
                    <div
                      key={exam.id}
                      className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold uppercase">
                            Exam
                          </span>
                          <span className="text-sm font-semibold text-slate-900">
                            {exam.title}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600">
                          {exam.subject}
                          {exam.examTime
                            ? ` · ${formatTime12h(exam.examTime)}`
                            : ""}
                          {exam.targetGoal
                            ? ` · Goal: ${exam.targetGoal}`
                            : ""}
                          {" · "}
                          <span className="font-semibold text-amber-900">
                            {daysLeft === 0
                              ? "Today!"
                              : daysLeft > 0
                              ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
                              : "Completed"}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onStartStudyWithTutor(
                            exam.tutorId,
                            `${exam.title} exam prep`
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer"
                      >
                        Revise Now
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedDaySlots.length > 0 ? (
              <div className="space-y-2.5">
                {selectedDaySlots.map((slot) => {
                  const isDone = selectedCompletedIds.includes(slot.id);
                  const tutor =
                    wingTutors.find((t) => t.id === slot.tutorId) ??
                    wingTutors[0];
                  return (
                    <div
                      key={slot.id}
                      className={`rounded-xl border p-3.5 flex flex-wrap items-center justify-between gap-3 transition-colors ${
                        isDone
                          ? "border-emerald-300 bg-emerald-50/60"
                          : "border-slate-200 bg-slate-50/60"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() =>
                            onToggleSlotCompleted(selectedDateKey, slot.id)
                          }
                          aria-label={
                            isDone
                              ? "Mark study session incomplete"
                              : "Mark study session completed"
                          }
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                            isDone
                              ? "bg-emerald-700 text-white"
                              : "bg-white border border-slate-300 text-slate-400 hover:border-emerald-600 hover:text-emerald-700"
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <div className="min-w-0">
                          <div
                            className={`text-sm font-semibold ${
                              isDone
                                ? "line-through text-slate-500"
                                : "text-slate-900"
                            }`}
                          >
                            {formatTime12h(slot.startTime)} –{" "}
                            {formatTime12h(
                              computeEndTime(
                                slot.startTime,
                                slot.durationMinutes
                              )
                            )}{" "}
                            · {slot.subject}
                          </div>
                          <div className="text-xs text-slate-600 truncate">
                            {tutor.name} ({slot.durationMinutes} min)
                            {slot.topicNote ? ` · ${slot.topicNote}` : ""}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onStartStudyWithTutor(
                            tutor.id,
                            slot.topicNote || slot.subject
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <span>Study with {tutor.name.split(" ").pop()}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-3">
                <span>
                  No study block scheduled for{" "}
                  {selectedDateObj.toLocaleDateString(undefined, {
                    weekday: "long",
                  })}{" "}
                  yet.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDays([selectedWeekday]);
                    setManagerTab("timetable");
                  }}
                  className="font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                >
                  + Add {selectedDateObj.toLocaleDateString(undefined, { weekday: "short" })} study time
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Right 5 cols: Study Timetable & Exam Dates Manager */}
        <section
          aria-label="Timetable and Exam Setup"
          className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white overflow-hidden"
        >
          {/* Switcher */}
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => setManagerTab("timetable")}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                managerTab === "timetable"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Study Timetable ({calendar.timetable.length})
            </button>
            <button
              type="button"
              onClick={() => setManagerTab("exams")}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                managerTab === "exams"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Exam Dates ({calendar.exams.length})
            </button>
          </div>

          {managerTab === "timetable" ? (
            <div className="p-5 space-y-5">
              {/* Quick Presets */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Quick Study Time Presets
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("evening")}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:border-emerald-600 hover:bg-emerald-50/50 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    + Evening (5:30 PM)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("morning")}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:border-emerald-600 hover:bg-emerald-50/50 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    + Early Bird (5:30 AM)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("weekend")}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:border-emerald-600 hover:bg-emerald-50/50 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    + Weekend Revision
                  </button>
                </div>
              </div>

              {/* Custom Timetable Form */}
              <form
                onSubmit={handleSubmitTimetable}
                className="space-y-3.5 pt-3 border-t border-slate-100"
              >
                <div className="text-sm font-semibold text-slate-900">
                  Set Your Good Time to Study
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Repeat on Days
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {WEEKDAYS_MON_FIRST.map((w) => {
                      const active = selectedDays.includes(w.index);
                      return (
                        <button
                          key={w.index}
                          type="button"
                          onClick={() => toggleDaySelection(w.index)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            active
                              ? "bg-emerald-700 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {w.short}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="study-start-time"
                      className="block text-xs font-medium text-slate-600 mb-1"
                    >
                      Start Time
                    </label>
                    <input
                      id="study-start-time"
                      type="time"
                      value={slotTime}
                      onChange={(e) => setSlotTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="study-duration"
                      className="block text-xs font-medium text-slate-600 mb-1"
                    >
                      Duration
                    </label>
                    <select
                      id="study-duration"
                      value={slotDuration}
                      onChange={(e) => setSlotDuration(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      {DURATION_OPTIONS.map((mins) => (
                        <option key={mins} value={mins}>
                          {mins} minutes
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="study-tutor"
                      className="block text-xs font-medium text-slate-600 mb-1"
                    >
                      AI Tutor
                    </label>
                    <select
                      id="study-tutor"
                      value={slotTutorId}
                      onChange={(e) => handleSlotTutorChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      {wingTutors.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="study-subject"
                      className="block text-xs font-medium text-slate-600 mb-1"
                    >
                      Subject
                    </label>
                    <input
                      id="study-subject"
                      type="text"
                      value={slotSubject}
                      onChange={(e) => setSlotSubject(e.target.value)}
                      placeholder="e.g. Mathematics"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="study-topic-note"
                    className="block text-xs font-medium text-slate-600 mb-1"
                  >
                    Topic Goal (optional)
                  </label>
                  <input
                    id="study-topic-note"
                    type="text"
                    value={slotTopicNote}
                    onChange={(e) => setSlotTopicNote(e.target.value)}
                    placeholder="e.g. Quadratic equations & Paper 2 practice"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {slotError && (
                  <p className="text-xs text-red-700 font-medium">{slotError}</p>
                )}

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors min-h-[42px] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add to Study Timetable
                </button>
              </form>

              {/* Weekly Schedule List */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="text-xs font-semibold text-slate-700">
                  Your Weekly Study Timetable
                </div>
                {calendar.timetable.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">
                    No study blocks added yet. Pick your best hours above or
                    use a quick preset.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {WEEKDAYS_MON_FIRST.map((day) => {
                      const items = slotsByWeekday[day.index];
                      if (!items || items.length === 0) return null;
                      return (
                        <div key={day.index} className="space-y-1.5">
                          <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">
                            {day.full}
                          </div>
                          {items.map((slot) => {
                            const tutor =
                              wingTutors.find((t) => t.id === slot.tutorId) ??
                              wingTutors[0];
                            return (
                              <div
                                key={slot.id}
                                className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2"
                              >
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-slate-900 truncate">
                                    {formatTime12h(slot.startTime)} ·{" "}
                                    {slot.subject} ({slot.durationMinutes}m)
                                  </div>
                                  <div className="text-[11px] text-slate-600 truncate">
                                    {tutor.name}
                                    {slot.topicNote
                                      ? ` · ${slot.topicNote}`
                                      : ""}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onDeleteTimetableSlot(slot.id)
                                  }
                                  aria-label={`Remove ${day.short} ${slot.subject} study slot`}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5 space-y-5">
              {/* Exam Form */}
              <form onSubmit={handleSubmitExam} className="space-y-3.5">
                <div className="text-sm font-semibold text-slate-900">
                  Set an Exam Date & Goal
                </div>

                <div>
                  <label
                    htmlFor="exam-title"
                    className="block text-xs font-medium text-slate-600 mb-1"
                  >
                    Exam Name
                  </label>
                  <input
                    id="exam-title"
                    type="text"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    placeholder={`e.g. ECZ ${profile.grade} Mathematics Paper 1`}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="exam-date"
                      className="block text-xs font-medium text-slate-600 mb-1"
                    >
                      Exam Date
                    </label>
                    <input
                      id="exam-date"
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="exam-time"
                      className="block text-xs font-medium text-slate-600 mb-1"
                    >
                      Start Time
                    </label>
                    <input
                      id="exam-time"
                      type="time"
                      value={examTime}
                      onChange={(e) => setExamTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="exam-tutor"
                      className="block text-xs font-medium text-slate-600 mb-1"
                    >
                      Prep Tutor
                    </label>
                    <select
                      id="exam-tutor"
                      value={examTutorId}
                      onChange={(e) => handleExamTutorChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      {wingTutors.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="exam-subject"
                      className="block text-xs font-medium text-slate-600 mb-1"
                    >
                      Subject
                    </label>
                    <input
                      id="exam-subject"
                      type="text"
                      value={examSubject}
                      onChange={(e) => setExamSubject(e.target.value)}
                      placeholder="e.g. Mathematics"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="exam-goal"
                    className="block text-xs font-medium text-slate-600 mb-1"
                  >
                    Target Score / Goal
                  </label>
                  <input
                    id="exam-goal"
                    type="text"
                    value={examGoal}
                    onChange={(e) => setExamGoal(e.target.value)}
                    placeholder="e.g. Distinction (85%+)"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {examError && (
                  <p className="text-xs text-red-700 font-medium">{examError}</p>
                )}

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors min-h-[42px] cursor-pointer"
                >
                  <Flag className="w-4 h-4" />
                  Set Exam Date & Start Countdown
                </button>
              </form>

              {/* Exams Countdown List */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="text-xs font-semibold text-slate-700">
                  Upcoming Exam Countdown
                </div>
                {sortedExams.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">
                    No exams added yet. Add your next test or ECZ paper date to
                    see your countdown!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {sortedExams.map((exam) => {
                      const daysLeft = getDaysUntilExam(exam.examDate);
                      return (
                        <div
                          key={exam.id}
                          className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 flex items-center justify-between gap-2.5"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold tabular-nums ${
                                  daysLeft < 0
                                    ? "bg-slate-200 text-slate-600"
                                    : daysLeft === 0
                                    ? "bg-red-600 text-white"
                                    : daysLeft <= 7
                                    ? "bg-amber-500 text-white"
                                    : "bg-emerald-700 text-white"
                                }`}
                              >
                                {daysLeft < 0
                                  ? "Passed"
                                  : daysLeft === 0
                                  ? "TODAY"
                                  : `${daysLeft}d left`}
                              </span>
                              <span className="text-xs font-semibold text-slate-900 truncate">
                                {exam.title}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 mt-0.5 truncate">
                              {parseLocalDateKey(
                                exam.examDate
                              ).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                              {exam.examTime
                                ? ` · ${formatTime12h(exam.examTime)}`
                                : ""}
                              {exam.targetGoal
                                ? ` · ${exam.targetGoal}`
                                : ""}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                onStartStudyWithTutor(
                                  exam.tutorId,
                                  `${exam.title} revision`
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-600 text-[11px] font-medium text-emerald-800 transition-colors cursor-pointer"
                            >
                              Prep
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteExam(exam.id)}
                              aria-label={`Delete exam ${exam.title}`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
