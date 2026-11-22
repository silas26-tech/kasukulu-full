import { useEffect, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  BookmarkPlus,
  BookOpen,
  CalendarCheck2,
  CheckCircle2,
  CheckSquare,
  Compass,
  FileText,
  GraduationCap,
  HelpCircle,
  Keyboard,
  Loader2,
  PenTool,
  Presentation,
  RefreshCw,
  Trash2,
  Volume2,
  XCircle,
  Zap,
} from "lucide-react";
import {
  A_LEVEL_TOPICS,
  ECZ_SCHOOL_TOPICS,
  subjectNeedsWrittenAnswer,
  type BlackboardNote,
  type GradeLevel,
  type LearnerProfile,
  type QuizQuestion,
  type StudyProgress,
  type SyllabusTopic,
  type TutorPersona,
  type WeaknessItem,
} from "../data/curriculum";
import { WeeklyProgressChart } from "./WeeklyProgressChart";
import { WritingPad } from "./WritingPad";
import { WrittenAnswerPad } from "./WrittenAnswerPad";

import { MonthlyTestsPanel } from "./MonthlyTestsPanel";
import { StudyFlashcards } from "./StudyFlashcards";
import { LessonPanel } from "./LessonPanel";
import { StudyWeaknessesPanel } from "./StudyWeaknessesPanel";

export type StudyTab =
  | "blackboard"
  | "pad"
  | "papers"
  | "topics"
  | "lesson"
  | "quiz"
  | "progress"
  | "monthly"
  | "flashcards"
  | "weaknesses";

interface RightStudyPanelProps {
  activeTab: StudyTab;
  onTabChange: (tab: StudyTab) => void;
  wingMode?: "school" | "alevel";
  tutor: TutorPersona;
  profile: LearnerProfile;
  activeTopic: SyllabusTopic | null;
  customTopic: string;
  onCustomTopicChange: (value: string) => void;
  onSelectTopic: (topic: SyllabusTopic) => void;
  blackboard: BlackboardNote | null;
  blackboardLoading: boolean;
  blackboardError: string | null;
  onRefreshBlackboard: () => void;
  onSaveBlackboard: () => void;
  onAskTutorText: (prompt: string) => void;
  quizQuestions: QuizQuestion[];
  quizLoading: boolean;
  quizError: string | null;
  onGenerateQuiz: () => void;
  onRecordQuizAnswer: (isCorrect: boolean, question?: QuizQuestion) => void;
  onSpeakText: (text: string, id: string) => void;
  speakingId: string | null;
  progress: StudyProgress;
  onLoadSavedNote: (note: BlackboardNote) => void;
  onDeleteSavedNote: (id: string) => void;
  onResetProgress: () => void;
  onSendPadToTutor: (imageBase64: string) => void;
  sendingPadToTutor: boolean;
  liveCallActive: boolean;
  onStartMonthlyTest: (test: {
    id: string;
    title: string;
    subject: string;
    grade: GradeLevel;
  }) => void;
  onOpenSnapModal?: () => void;
  onAskTutorAboutWeakness: (item: WeaknessItem) => void;
  onRemoveWeakness: (id: string) => void;
  onClearAllWeaknesses: () => void;
}

const GRADE_FILTERS: Array<"All" | GradeLevel> = [
  "All",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

const ALEVEL_SUBJECT_FILTERS = [
  "All",
  "Pure Mathematics",
  "Mathematics",
  "Chemistry",
  "Physics",
  "Biology",
];

export function RightStudyPanel({
  activeTab,
  onTabChange,
  wingMode = "school",
  tutor,
  profile,
  activeTopic,
  customTopic,
  onCustomTopicChange,
  onSelectTopic,
  blackboard,
  blackboardLoading,
  blackboardError,
  onRefreshBlackboard,
  onSaveBlackboard,
  onAskTutorText,
  quizQuestions,
  quizLoading,
  quizError,
  onGenerateQuiz,
  onRecordQuizAnswer,
  onSpeakText,
  speakingId,
  progress,
  onLoadSavedNote,
  onDeleteSavedNote,
  onResetProgress,
  onSendPadToTutor,
  sendingPadToTutor,
  liveCallActive,
  onStartMonthlyTest,
  onOpenSnapModal,
  onAskTutorAboutWeakness,
  onRemoveWeakness,
  onClearAllWeaknesses,
}: RightStudyPanelProps) {
  const [gradeFilter, setGradeFilter] = useState<"All" | GradeLevel>(
    profile.grade === "A-Level" ? "Grade 12" : profile.grade
  );
  const [alevelSubjectFilter, setAlevelSubjectFilter] = useState<string>("All");
  const [autoStartLesson, setAutoStartLesson] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});

  const activeSubjectContext =
    customTopic.trim() ||
    blackboard?.subject ||
    activeTopic?.subject ||
    tutor.subjectFocus;
  const needsWrittenAnswer = subjectNeedsWrittenAnswer(activeSubjectContext);

  const [padMode, setPadMode] = useState<"keyboard" | "draw">(
    needsWrittenAnswer ? "keyboard" : "draw"
  );
  const [keyboardFocusSignal, setKeyboardFocusSignal] = useState(0);

  useEffect(() => {
    if (needsWrittenAnswer) {
      setPadMode("keyboard");
      setKeyboardFocusSignal((n) => n + 1);
    } else {
      setPadMode("draw");
    }
  }, [needsWrittenAnswer, activeTopic?.id, activeSubjectContext]);

  const filteredTopics =
    wingMode === "alevel"
      ? A_LEVEL_TOPICS.filter((topic) => {
          if (alevelSubjectFilter === "All") return true;
          return topic.subject
            .toLowerCase()
            .includes(alevelSubjectFilter.toLowerCase());
        })
      : ECZ_SCHOOL_TOPICS.filter((topic) => {
          if (gradeFilter !== "All" && topic.grade !== gradeFilter) return false;
          return true;
        });

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (selectedAnswers[qIdx] !== undefined) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
    const q = quizQuestions[qIdx];
    const isCorrect = q?.correctIndex === optIdx;
    onRecordQuizAnswer(isCorrect, q);
  };

  const handleRegenerateQuiz = () => {
    setSelectedAnswers({});
    onGenerateQuiz();
  };

  const accuracyPct =
    progress.quizAnswered > 0
      ? Math.round((progress.quizCorrect / progress.quizAnswered) * 100)
      : 0;

  const isBoardAndPadActive =
    activeTab === "blackboard" || activeTab === "pad";

  return (
    <section
      aria-label="Study Blackboard, Work Pad, and ECZ Tools"
      className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs"
    >
      {/* Segmented Study Panel Tabs */}
      <div className="border-b border-slate-200 bg-slate-50/90 px-3 sm:px-5 py-3">
        <div
          role="tablist"
          aria-label="Study tools"
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5"
        >
          {(
            [
              {
                id: "blackboard",
                label: "Board & Work Pad",
                icon: Presentation,
              },
              { id: "topics", label: "Topics", icon: Compass },
              { id: "lesson", label: "Lesson", icon: GraduationCap },
              { id: "quiz", label: "Quiz", icon: CheckSquare },
              { id: "progress", label: "Progress", icon: BarChart3 },
              { id: "monthly", label: "Monthly", icon: CalendarCheck2 },
              { id: "flashcards", label: "Flashcards", icon: Zap },
              { id: "weaknesses", label: "My Weaknesses", icon: AlertCircle },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active =
              tab.id === "blackboard"
                ? isBoardAndPadActive
                : activeTab === tab.id;
            const activeClass =
              wingMode === "alevel"
                ? "bg-gradient-to-b from-slate-900 to-slate-800 text-amber-300 border-slate-900 shadow-sm"
                : "bg-gradient-to-b from-emerald-700 to-emerald-800 text-white border-emerald-800 shadow-sm";
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onTabChange(tab.id as StudyTab)}
                className={`inline-flex items-center justify-center gap-1.5 shrink-0 py-2 px-3.5 rounded-xl border text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  active
                    ? activeClass
                    : "bg-white border-slate-200/90 text-slate-700 hover:text-slate-950 hover:border-emerald-600/50 hover:bg-emerald-50/50 shadow-2xs"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    active
                      ? "text-amber-300"
                      : tab.id === "weaknesses"
                      ? "text-amber-600"
                      : wingMode === "alevel"
                      ? "text-slate-600"
                      : "text-emerald-700"
                  }`}
                />
                <span>{tab.label}</span>
                {tab.id === "progress" && progress.savedNotes.length > 0 && (
                  <span
                    className={`font-mono text-[10px] tabular-nums ${
                      active ? "text-emerald-200" : "text-slate-400"
                    }`}
                  >
                    {progress.savedNotes.length}
                  </span>
                )}
                {tab.id === "weaknesses" && (progress.weaknesses?.length ?? 0) > 0 && (
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                      active ? "bg-amber-400 text-slate-950 font-bold" : "bg-amber-100 text-amber-900 font-bold"
                    }`}
                  >
                    {progress.weaknesses.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 p-5 sm:p-6">
        {isBoardAndPadActive && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: Live Study Blackboard */}
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Presentation className="w-3.5 h-3.5 text-emerald-700" />
                    <span>
                      {blackboard?.grade ?? profile.grade}
                      <span aria-hidden="true"> · </span>
                      {blackboard?.subject ??
                        activeTopic?.subject ??
                        tutor.subjectFocus}
                    </span>
                  </div>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    {blackboard?.title ??
                      activeTopic?.title ??
                      "Live Study Blackboard"}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={onRefreshBlackboard}
                    disabled={blackboardLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {blackboardLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    Generate Note
                  </button>
                  {blackboard && (
                    <button
                      type="button"
                      onClick={onSaveBlackboard}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-medium hover:bg-emerald-800 transition-colors whitespace-nowrap"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      Save
                    </button>
                  )}
                </div>
              </div>

              {blackboardError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
                  {blackboardError}
                </div>
              )}

              {blackboardLoading && !blackboard && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex items-center gap-3 text-sm text-slate-600">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                  Preparing your blackboard lesson note...
                </div>
              )}

              {!blackboard && !blackboardLoading && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-6 space-y-3">
                  <div className="text-sm font-semibold text-slate-900">
                    Blackboard ready for {profile.grade}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    As {tutor.name} speaks with you, formulas and worked steps
                    appear right here beside your Work Pad. Or click{" "}
                    <span className="font-medium text-slate-900">
                      Generate Note
                    </span>{" "}
                    to prepare a worked example immediately.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={onRefreshBlackboard}
                      className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-medium hover:bg-emerald-800 transition-colors whitespace-nowrap"
                    >
                      Build Worked Example
                    </button>
                    <button
                      type="button"
                      onClick={() => onTabChange("topics")}
                      className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                    >
                      Browse {wingMode === "alevel" ? "A-Level" : "ECZ"} Topics
                    </button>
                  </div>
                </div>
              )}

              {blackboard && (
                <div className="space-y-5 max-h-[580px] sm:max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="rounded-xl bg-slate-900 text-slate-50 p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs font-medium text-emerald-300">
                      <span>Key Rule or Formula</span>
                      {blackboard.updatedAt && (
                        <span className="font-mono text-[11px] text-slate-400">
                          {blackboard.updatedAt}
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-sm leading-relaxed text-white">
                      {blackboard.keyRule}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="text-xs font-semibold text-slate-700">
                      Worked Steps
                    </div>
                    <ol className="space-y-2.5">
                      {blackboard.workedSteps.map((step, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed"
                        >
                          <span className="font-mono text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-0.5 tabular-nums shrink-0 mt-0.5">
                            0{idx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-amber-800">
                        Check Your Understanding
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onSpeakText(
                            blackboard.checkQuestion,
                            `bb-check-${blackboard.id}`
                          )
                        }
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-emerald-700 transition-colors whitespace-nowrap"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        {speakingId === `bb-check-${blackboard.id}`
                          ? "Playing..."
                          : "Listen"}
                      </button>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed">
                      {blackboard.checkQuestion}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setPadMode("keyboard");
                          setKeyboardFocusSignal((n) => n + 1);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <Keyboard className="w-3.5 h-3.5" />
                        Write Answer
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onAskTutorText(
                            `Please guide me through this check question: ${blackboard.checkQuestion}`
                          )
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-900 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Work through this with {tutor.name}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Interactive Work Pad (Auto-opens Keyboard for Written Subjects) */}
            <div className="lg:col-span-6 lg:border-l lg:border-slate-200 lg:pl-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {padMode === "keyboard" ? (
                      <Keyboard className="w-3.5 h-3.5 text-emerald-700" />
                    ) : (
                      <PenTool className="w-3.5 h-3.5 text-emerald-700" />
                    )}
                    <span>
                      {profile.grade}
                      <span aria-hidden="true"> · </span>
                      {activeTopic?.subject ??
                        blackboard?.subject ??
                        tutor.subjectFocus}
                    </span>
                  </div>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    {padMode === "keyboard"
                      ? "Written Answer Board"
                      : "Interactive Work Pad"}
                  </h2>
                </div>

                {/* Mode Switcher: Keyboard vs Draw Pad */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200/80 rounded-xl shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setPadMode("keyboard");
                      setKeyboardFocusSignal((n) => n + 1);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      padMode === "keyboard"
                        ? "bg-white text-slate-900 shadow-xs font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Keyboard className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Keyboard</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPadMode("draw")}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      padMode === "draw"
                        ? "bg-white text-slate-900 shadow-xs font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Draw Pad</span>
                  </button>
                </div>
              </div>

              {padMode === "keyboard" ? (
                <WrittenAnswerPad
                  key={activeTopic?.id ?? (customTopic.trim() || tutor.id)}
                  subjectLabel={
                    activeTopic?.subject ??
                    blackboard?.subject ??
                    tutor.subjectFocus
                  }
                  questionPrompt={blackboard?.checkQuestion ?? null}
                  liveCallActive={liveCallActive}
                  sendingToTutor={sendingPadToTutor}
                  autoOpenKeyboard={needsWrittenAnswer}
                  focusSignal={keyboardFocusSignal}
                  onOpenSnapModal={onOpenSnapModal}
                  onSubmitAnswer={(answerText) => {
                    const contextTitle =
                      blackboard?.title ??
                      activeTopic?.title ??
                      activeSubjectContext;
                    const promptMessage = blackboard?.checkQuestion
                      ? `Here is my written answer for "${contextTitle}" (Question: ${blackboard.checkQuestion}):\n\n"${answerText}"\n\nPlease mark my written answer, tell me what I got right, and show how to improve it step by step.`
                      : `Here is my written answer on ${contextTitle}:\n\n"${answerText}"\n\nPlease review my answer and guide me step by step.`;
                    onAskTutorText(promptMessage);
                  }}
                />
              ) : (
                <WritingPad
                  onSendToTutor={onSendPadToTutor}
                  sendingToTutor={sendingPadToTutor}
                  liveCallActive={liveCallActive}
                  onOpenSnapModal={onOpenSnapModal}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === "lesson" && (
          <LessonPanel
            tutor={tutor}
            profile={profile}
            activeTopic={activeTopic}
            customTopic={customTopic}
            autoStart={autoStartLesson}
            onAutoStartHandled={() => setAutoStartLesson(false)}
            onChooseAnotherTopic={() => onTabChange("topics")}
            onAskTutorText={onAskTutorText}
            onRecordQuizAnswer={onRecordQuizAnswer}
            onSpeakText={onSpeakText}
            speakingId={speakingId}
          />
        )}

        {activeTab === "topics" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {wingMode === "alevel"
                  ? "A-Level AS & A2 Syllabus Topics"
                  : "ECZ Syllabus Topics"}
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                {wingMode === "alevel"
                  ? "Select an Advanced Level Pure Math, Chemistry, Physics, or Biology topic or enter your own problem."
                  : "Select a Zambian curriculum topic or enter your own homework question."}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700">
                Custom Topic or Homework Focus
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => onCustomTopicChange(e.target.value)}
                  placeholder="e.g. Grade 12 Vectors, Nitrogen Cycle, Essay Writing..."
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customTopic.trim()) {
                      onRefreshBlackboard();
                      onTabChange("blackboard");
                    }
                  }}
                  disabled={!customTopic.trim()}
                  className="px-3.5 py-2 rounded-lg bg-emerald-700 text-white text-xs font-medium hover:bg-emerald-800 disabled:opacity-40 transition-colors whitespace-nowrap"
                >
                  Study This
                </button>
              </div>
            </div>

            {wingMode === "alevel" ? (
              <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200/80 rounded-xl overflow-x-auto no-scrollbar">
                {ALEVEL_SUBJECT_FILTERS.map((subj) => {
                  const active = alevelSubjectFilter === subj;
                  return (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => setAlevelSubjectFilter(subj)}
                      className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? "bg-slate-900 text-amber-300 shadow-xs font-semibold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                      }`}
                    >
                      {subj}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200/80 rounded-xl overflow-x-auto no-scrollbar">
                {GRADE_FILTERS.map((grade) => {
                  const active = gradeFilter === grade;
                  return (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setGradeFilter(grade)}
                      className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? "bg-emerald-700 text-white shadow-xs font-semibold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                      }`}
                    >
                      {grade}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
              {filteredTopics.map((topic) => {
                const isSelected = activeTopic?.id === topic.id;
                return (
                  <div
                    key={topic.id}
                    className={isSelected ? "bg-emerald-50/70" : ""}
                  >
                  <button
                    type="button"
                    onClick={() => onSelectTopic(topic)}
                    className={`w-full text-left py-3.5 px-3 transition-colors ${
                      isSelected ? "" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500">
                        {topic.grade}
                        <span aria-hidden="true"> · </span>
                        {topic.subject}
                      </span>
                      {isSelected && (
                        <span className="text-xs font-medium text-emerald-700">
                          Active Topic
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">
                      {topic.title}
                    </div>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {topic.summary}
                    </p>
                  </button>
                  <div className="px-3 pb-3">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTopic(topic);
                        setAutoStartLesson(true);
                        onTabChange("lesson");
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold min-h-[40px] cursor-pointer"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      Start lesson
                    </button>
                  </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "quiz" && (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-slate-500">
                  {profile.grade}
                  <span aria-hidden="true"> · </span>
                  {activeTopic?.subject ?? tutor.subjectFocus}
                </div>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  ECZ Practice Check
                </h2>
              </div>
              <button
                type="button"
                onClick={handleRegenerateQuiz}
                disabled={quizLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 text-white text-xs font-medium hover:bg-emerald-800 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
              >
                {quizLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                {quizQuestions.length > 0 ? "New Questions" : "Generate Quiz"}
              </button>
            </div>

            {quizError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
                {quizError}
              </div>
            )}

            {quizLoading && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex items-center gap-3 text-sm text-slate-600">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                Writing 3 ECZ-aligned questions for{" "}
                {customTopic.trim() ||
                  activeTopic?.title ||
                  tutor.subjectFocus}
                ...
              </div>
            )}

            {!quizLoading && quizQuestions.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-6 space-y-3">
                <div className="text-sm font-medium text-slate-900">
                  Test your readiness
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Generate 3 multiple-choice questions on{" "}
                  <span className="font-medium text-slate-900">
                    {customTopic.trim() ||
                      activeTopic?.title ||
                      tutor.subjectFocus}
                  </span>{" "}
                  with spoken explanations from {tutor.name}.
                </p>
              </div>
            )}

            {!quizLoading && quizQuestions.length > 0 && (
              <div className="space-y-6">
                {quizQuestions.map((q, qIdx) => {
                  const chosen = selectedAnswers[qIdx];
                  const answered = chosen !== undefined;
                  const isRight = chosen === q.correctIndex;

                  return (
                    <div
                      key={qIdx}
                      className="rounded-xl border border-slate-200 p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-xs font-medium text-slate-500 tabular-nums">
                          Question 0{qIdx + 1}
                        </span>
                        {answered && (
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium ${
                              isRight ? "text-emerald-700" : "text-amber-800"
                            }`}
                          >
                            {isRight ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Correct
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                Review Needed (Saved to Weaknesses)
                              </>
                            )}
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-medium text-slate-900 leading-relaxed">
                        {q.question}
                      </p>

                      <div className="space-y-1.5">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = chosen === optIdx;
                          const isCorrectOpt = q.correctIndex === optIdx;
                          let style =
                            "border-slate-200 bg-white text-slate-700 hover:border-slate-300";
                          if (answered) {
                            if (isCorrectOpt) {
                              style =
                                "border-emerald-600 bg-emerald-50 text-emerald-950 font-medium";
                            } else if (isSelected) {
                              style =
                                "border-red-400 bg-red-50 text-red-900";
                            } else {
                              style =
                                "border-slate-200 bg-slate-50 text-slate-500";
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              disabled={answered}
                              onClick={() => handleSelectOption(qIdx, optIdx)}
                              className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-xs transition-colors flex items-center gap-2.5 ${style}`}
                            >
                              <span className="font-mono text-xs opacity-70 shrink-0">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {answered && (
                        <div className="pt-2 border-t border-slate-100 space-y-2">
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {q.explanation}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              onSpeakText(q.explanation, `quiz-exp-${qIdx}`)
                            }
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-900 transition-colors"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            {speakingId === `quiz-exp-${qIdx}`
                              ? "Playing explanation..."
                              : `Hear ${tutor.name} explain`}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "progress" && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Study Progress
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  Saved on this device for {profile.name || "Learner"}
                  <span aria-hidden="true"> · </span>
                  {profile.grade}
                </p>
              </div>
              <button
                type="button"
                onClick={onResetProgress}
                className="text-xs font-medium text-slate-500 hover:text-red-700 transition-colors whitespace-nowrap"
              >
                Reset Log
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 p-3.5">
                <div className="text-xs text-slate-500">Sessions</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900 tabular-nums">
                  {progress.sessionsCompleted}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3.5">
                <div className="text-xs text-slate-500">Quiz Accuracy</div>
                <div className="mt-1 text-2xl font-semibold text-emerald-700 tabular-nums">
                  {accuracyPct}%
                </div>
                <div className="text-xs text-slate-500 tabular-nums">
                  {progress.quizCorrect}/{progress.quizAnswered} correct
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3.5">
                <div className="text-xs text-slate-500">Weaknesses</div>
                <div className="mt-1 text-2xl font-semibold text-amber-700 tabular-nums">
                  {progress.weaknesses?.length ?? 0}
                </div>
              </div>
            </div>

            <WeeklyProgressChart progress={progress} />

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                Saved Blackboard Notes ({progress.savedNotes.length})
              </div>

              {progress.savedNotes.length === 0 ? (
                <p className="text-xs text-slate-500 leading-relaxed">
                  No saved notes yet. Click{" "}
                  <span className="font-medium text-slate-700">Save</span> on
                  any Blackboard breakdown to keep it for revision before exams.
                </p>
              ) : (
                <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
                  {progress.savedNotes.map((note) => (
                    <div
                      key={note.id}
                      className="py-3 flex items-start justify-between gap-3"
                    >
                      <button
                        type="button"
                        onClick={() => onLoadSavedNote(note)}
                        className="text-left flex-1 min-w-0 group"
                      >
                        <div className="text-xs text-slate-500">
                          {note.grade}
                          <span aria-hidden="true"> · </span>
                          {note.subject}
                        </div>
                        <div className="text-sm font-medium text-slate-900 group-hover:text-emerald-700 truncate">
                          {note.title}
                        </div>
                        <div className="mt-0.5 font-mono text-xs text-slate-600 truncate">
                          {note.keyRule}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteSavedNote(note.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors shrink-0"
                        aria-label={`Delete saved note ${note.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "monthly" && (
          <MonthlyTestsPanel
            profile={profile}
            wingMode={wingMode}
            onStartTest={onStartMonthlyTest}
          />
        )}

        {activeTab === "flashcards" && (
          <StudyFlashcards
            gradeFilter={wingMode === "alevel" ? "A-Level" : profile.grade}
            wingMode={wingMode}
            onAskTutorAboutCard={(card) => {
              onCustomTopicChange(card.question);
              onTabChange("blackboard");
              onAskTutorText(
                `Please explain this concept clearly: ${card.question} - Answer: ${card.answer}`
              );
            }}
          />
        )}

        {activeTab === "weaknesses" && (
          <StudyWeaknessesPanel
            weaknesses={progress.weaknesses || []}
            tutor={tutor}
            onAskTutorAboutWeakness={onAskTutorAboutWeakness}
            onRemoveWeakness={onRemoveWeakness}
            onClearAllWeaknesses={onClearAllWeaknesses}
          />
        )}
      </div>
    </section>
  );
}
