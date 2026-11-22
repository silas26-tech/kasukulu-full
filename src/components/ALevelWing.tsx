import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookMarked,
  Camera,
  CheckCircle2,
  CheckSquare,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Layers,
  Loader2,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Send,
  ShieldCheck,
  Square,
  Volume2,
} from "lucide-react";
import {
  A_LEVEL_TUTORS,
  type BlackboardNote,
  type GradeLevel,
  type LearnerProfile,
  type QuizQuestion,
  type StudyProgress,
  type SyllabusTopic,
  type TranscriptEntry,
  type TutorPersona,
  type WeaknessItem,
} from "../data/curriculum";
import {
  A_LEVEL_ENTRY_REQUIREMENTS,
  A_LEVEL_PATHWAYS,
  A_LEVEL_READINESS_CHECKLIST,
  A_LEVEL_SUBJECT_GUIDELINES,
} from "../data/alevelGuidelines";
import { TutorPortrait } from "./TutorPortrait";
import { VoiceWaveform } from "./VoiceWaveform";
import { RightStudyPanel, type StudyTab } from "./RightStudyPanel";
import { PastPapersPanel } from "./PastPapersPanel";
import { StudyFlashcards } from "./StudyFlashcards";
import { MonthlyTestsPanel } from "./MonthlyTestsPanel";
import alevelHeroImg from "../assets/images/hero_alevel_wing_1794867956425.jpg";

export type ALevelSectionTab =
  | "guidelines"
  | "studio"
  | "papers"
  | "mastery";

const CHECKLIST_STORAGE_KEY = "kasukulu_alevel_checklist_v1";

function loadChecklist(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {};
  }
}

function formatCallDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

interface ALevelWingProps {
  profile: LearnerProfile;
  progress: StudyProgress;
  activeTutor: TutorPersona;
  onSelectALevelTutor: (tutorId: string) => void;
  activeTopic: SyllabusTopic | null;
  customTopic: string;
  onCustomTopicChange: (val: string) => void;
  onSelectTopic: (topic: SyllabusTopic) => void;

  // Voice & Chat Studio state/handlers
  voiceMode: "live" | "turn";
  onVoiceModeChange: (mode: "live" | "turn") => void;
  callStatus: "idle" | "connecting" | "connected" | "error";
  callStatusLabel: string;
  callError: string | null;
  onClearCallError: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  callSeconds: number;
  turnState: string;
  activeSpeaker: "idle" | "learner" | "tutor";
  audioLevel: number;
  onStartLiveCall: () => void;
  onStopLiveCall: () => void;

  transcript: TranscriptEntry[];
  studyPanelRef: React.RefObject<HTMLDivElement | null>;
  textInput: string;
  onTextInputChange: (val: string) => void;
  onSendTextOrTurn: (
    prompt: string,
    tutorIdOverride?: string,
    customTopicOverride?: string
  ) => void;
  isSendingTurn: boolean;
  isRecordingClip: boolean;
  isTranscribing: boolean;
  onToggleTurnRecording: () => void;
  onOpenSnapModal: () => void;
  onSpeakText: (text: string, id: string) => void;
  speakingId: string | null;

  // Right Study Panel state/handlers
  rightTab: StudyTab;
  onRightTabChange: (tab: StudyTab) => void;
  blackboard: BlackboardNote | null;
  blackboardLoading: boolean;
  blackboardError: string | null;
  onRefreshBlackboard: () => void;
  onSaveBlackboard: () => void;
  quizQuestions: QuizQuestion[];
  quizLoading: boolean;
  quizError: string | null;
  onGenerateQuiz: () => void;
  onRecordQuizAnswer: (isCorrect: boolean) => void;
  onLoadSavedNote: (note: BlackboardNote) => void;
  onDeleteSavedNote: (id: string) => void;
  onResetProgress: () => void;
  onSendPadToTutor: (imageBase64: string) => void;
  onStartMonthlyTest: (test: {
    id: string;
    title: string;
    subject: string;
    grade: GradeLevel;
  }) => void;
  isReturningLearner?: boolean;
  onAskTutorAboutWeakness: (item: WeaknessItem) => void;
  onRemoveWeakness: (id: string) => void;
  onClearAllWeaknesses: () => void;
}

export function ALevelWing({
  profile,
  progress,
  activeTutor,
  isReturningLearner = false,
  onSelectALevelTutor,
  activeTopic,
  customTopic,
  onCustomTopicChange,
  onSelectTopic,
  voiceMode,
  onVoiceModeChange,
  callStatus,
  callStatusLabel,
  callError,
  onClearCallError,
  isMuted,
  onToggleMute,
  callSeconds,
  turnState,
  activeSpeaker,
  audioLevel,
  onStartLiveCall,
  onStopLiveCall,
  transcript,
  studyPanelRef,
  textInput,
  onTextInputChange,
  onSendTextOrTurn,
  isSendingTurn,
  isRecordingClip,
  isTranscribing,
  onToggleTurnRecording,
  onOpenSnapModal,
  onSpeakText,
  speakingId,
  rightTab,
  onRightTabChange,
  blackboard,
  blackboardLoading,
  blackboardError,
  onRefreshBlackboard,
  onSaveBlackboard,
  quizQuestions,
  quizLoading,
  quizError,
  onGenerateQuiz,
  onRecordQuizAnswer,
  onLoadSavedNote,
  onDeleteSavedNote,
  onResetProgress,
  onSendPadToTutor,
  onStartMonthlyTest,
  onAskTutorAboutWeakness,
  onRemoveWeakness,
  onClearAllWeaknesses,
}: ALevelWingProps) {
  const [sectionTab, setSectionTab] = useState<ALevelSectionTab>("guidelines");
  const [selectedGuidelineId, setSelectedGuidelineId] = useState<string>(
    A_LEVEL_SUBJECT_GUIDELINES[0].id
  );
  const [checklist, setChecklist] =
    useState<Record<string, boolean>>(loadChecklist);
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checklist));
    } catch {
      // ignore storage errors
    }
  }, [checklist]);

  const alevelProfile: LearnerProfile = {
    ...profile,
    grade: "A-Level",
  };

  const currentALevelTutor =
    A_LEVEL_TUTORS.find((t) => t.id === activeTutor.id) ?? A_LEVEL_TUTORS[0];

  const activeSubjectGuideline =
    A_LEVEL_SUBJECT_GUIDELINES.find((g) => g.id === selectedGuidelineId) ??
    A_LEVEL_SUBJECT_GUIDELINES[0];

  const activeTopicLabel =
    customTopic.trim() ||
    activeTopic?.title ||
    currentALevelTutor.subjectFocus;

  const latestTutorLine =
    [...transcript].reverse().find((entry) => entry.role === "tutor")?.text ??
    null;

  const completedChecklistCount = A_LEVEL_READINESS_CHECKLIST.filter(
    (item) => checklist[item.id]
  ).length;
  const checklistPct = Math.round(
    (completedChecklistCount / A_LEVEL_READINESS_CHECKLIST.length) * 100
  );

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const launchStudioWithPrompt = (
    tutorId: string,
    prompt: string,
    topicTitle?: string
  ) => {
    onSelectALevelTutor(tutorId);
    if (topicTitle) onCustomTopicChange(topicTitle);
    onRightTabChange("blackboard");
    setSectionTab("studio");
    onSendTextOrTurn(prompt, tutorId, topicTitle);
  };

  return (
    <div className="space-y-8">
      {/* Dedicated A-Level Wing Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch shadow-sm border border-slate-800">
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <div className="text-xs font-medium text-amber-300">
              {isReturningLearner ? (
                <>
                  <span>Welcome back, {profile.name || "Scholar"}</span>
                  <span aria-hidden="true"> · </span>
                </>
              ) : null}
              A-Level Wing
              <span aria-hidden="true"> · </span>
              AS & A2 Upper-Sixth Sanctuary
              <span aria-hidden="true"> · </span>
              Separated from Grade 7–12
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-[1.12] text-balance">
              Advanced Level Study Sanctuary for {profile.name || "Scholar"}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Study independently with dedicated A-Level specialist professors,
              complete AS & A2 entry and examiner requirements, and solve
              university-prep papers at full analytical depth.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onRightTabChange("blackboard");
                  setSectionTab("studio");
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[44px] cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Enter A-Level Tutor Studio</span>
              </button>

              <button
                type="button"
                onClick={() => setSectionTab("guidelines")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0 min-h-[44px] cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Guidelines & Requirements</span>
              </button>

              <button
                type="button"
                onClick={() => setSectionTab("papers")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0 min-h-[44px] cursor-pointer"
              >
                <FileText className="w-4 h-4 text-emerald-300" />
                <span>A-Level Past Papers</span>
              </button>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
              <span>
                Specialist:{" "}
                <strong className="text-white font-semibold">
                  {currentALevelTutor.name}
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                Readiness:{" "}
                <strong className="text-amber-300 font-semibold">
                  {completedChecklistCount}/{A_LEVEL_READINESS_CHECKLIST.length}
                </strong>{" "}
                requirements checked
              </span>
              <span aria-hidden="true">·</span>
              <span>360 guided hrs/subject standard</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative min-h-[220px] sm:min-h-[260px] bg-slate-900">
          {!heroImgFailed ? (
            <img
              src={alevelHeroImg}
              alt="A-Level university preparatory desk with integral calculus, organic ring mechanisms, and physics textbooks"
              referrerPolicy="no-referrer"
              onError={() => setHeroImgFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 p-6">
              <GraduationCap className="w-12 h-12 text-amber-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent lg:bg-gradient-to-r lg:from-slate-950/75 lg:via-slate-950/25 lg:to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 text-xs text-slate-100">
            <span className="font-semibold text-amber-300">
              AS & A2 Analytical Standard
            </span>
            <span aria-hidden="true"> · </span>
            <span>Proofs, curly arrows, SI precision & M1/A1/B1 schemes</span>
          </div>
        </div>
      </section>

      {/* Dedicated A-Level Specialist Tutors Strip (Strictly A-Level Specialists Only) */}
      <section aria-label="A-Level Specialist Tutors" className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Your Dedicated A-Level Specialist Tutors
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Select an Upper-Sixth specialist professor for one-on-one voice,
              blackboard, and past-paper coaching.
            </p>
          </div>
          <span className="text-xs text-slate-500">
            4 A-Level Specialists · Isolated from Grade 7–12 tutors
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {A_LEVEL_TUTORS.map((tutor) => {
            const selected = tutor.id === currentALevelTutor.id;
            return (
              <div
                key={tutor.id}
                className={`rounded-2xl border p-4 transition-all flex flex-col justify-between gap-3 ${
                  selected
                    ? "border-slate-900 bg-white shadow-xs ring-1 ring-slate-900"
                    : "border-slate-200 bg-white hover:border-slate-400"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectALevelTutor(tutor.id)}
                  className="flex items-start gap-3.5 text-left w-full cursor-pointer"
                >
                  <TutorPortrait
                    tutorId={tutor.id}
                    name={tutor.name}
                    sizeClass="w-12 h-12"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {tutor.name}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500 shrink-0">
                        {tutor.voiceName}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-snug">
                      {tutor.subjectFocus}
                    </div>
                  </div>
                </button>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onSpeakText(
                        tutor.sampleGreeting,
                        `alevel-greet-${tutor.id}`
                      )
                    }
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-950 transition-colors whitespace-nowrap"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                    {speakingId === `alevel-greet-${tutor.id}`
                      ? "Stop Voice"
                      : "Hear Voice"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectALevelTutor(tutor.id);
                      setSectionTab("studio");
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-900 hover:text-emerald-800 transition-colors whitespace-nowrap"
                  >
                    <span>Study Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Internal A-Level Navigation Tabs */}
      <div
        role="tablist"
        aria-label="A-Level Wing sections"
        className="flex items-center gap-1.5 p-1.5 bg-slate-100 border border-slate-200 rounded-2xl shadow-2xs overflow-x-auto no-scrollbar"
      >
        {(
          [
            {
              id: "guidelines",
              label: "Guidelines & Requirements",
              icon: ClipboardCheck,
            },
            {
              id: "studio",
              label: "A-Level Tutor Studio",
              icon: PhoneCall,
            },
            {
              id: "papers",
              label: "A-Level Past Papers",
              icon: FileText,
            },
            {
              id: "mastery",
              label: "Flashcards & Mastery Tests",
              icon: Layers,
            },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = sectionTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSectionTab(tab.id)}
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

      {/* TAB 1: GUIDELINES & EVERY REQUIREMENT */}
      {sectionTab === "guidelines" && (
        <div className="space-y-8">
          {/* 01. Entry Prerequisites & Study Load */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  01. A-Level Entry Requirements & Study Standards
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Mandatory academic prerequisites, weekly commitment, and approved
                  examination instruments before starting AS & A2 modules.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  launchStudioWithPrompt(
                    currentALevelTutor.id,
                    `Review the A-Level entry prerequisites and weekly study plan for ${currentALevelTutor.subjectFocus} with me step-by-step.`,
                    "A-Level Study Plan & Prerequisites"
                  )
                }
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 whitespace-nowrap"
              >
                <span>Ask {currentALevelTutor.name} to plan my schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {A_LEVEL_ENTRY_REQUIREMENTS.map((req) => (
                <div
                  key={req.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2"
                >
                  <div className="text-xs font-medium text-amber-800">
                    {req.category}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {req.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {req.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 02. Recommended Subject Combinations & University Pathways */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                02. Subject Combinations & University Admission Pathways
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Standard 3-principal A-Level tracks aligned with UNZA, Copperbelt
                University (CBU), and international university admissions.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {A_LEVEL_PATHWAYS.map((pathway) => (
                <div
                  key={pathway.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-slate-900">
                      {pathway.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {pathway.targetDegrees}
                    </p>
                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                      <div className="text-slate-700">
                        <span className="font-semibold text-slate-900">
                          Core Subjects:
                        </span>{" "}
                        {pathway.coreSubjects.join(" · ")}
                      </div>
                      <div className="text-slate-700">
                        <span className="font-semibold text-slate-900">
                          Optional 4th:
                        </span>{" "}
                        {pathway.recommendedFourth}
                      </div>
                      <div className="text-emerald-800 font-medium">
                        {pathway.minimumEntry}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      launchStudioWithPrompt(
                        pathway.tutorIds[0],
                        `I am following the "${pathway.title}" A-Level pathway (${pathway.coreSubjects.join(", ")}). Help me understand what mastery is required across Papers 1 to 5.`,
                        pathway.title
                      )
                    }
                    className="inline-flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <span>Start Pathway Coaching</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* 03. Subject-by-Subject Paper Structure, Practicals & Examiner Rules */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  03. Subject Paper Structure, Practicals & Marking Guidelines
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Select a subject below to inspect every paper code, duration,
                  weighting, practical requirement, and examiner rule.
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl overflow-x-auto">
                {A_LEVEL_SUBJECT_GUIDELINES.map((g) => {
                  const active = g.id === activeSubjectGuideline.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedGuidelineId(g.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? "bg-white text-slate-900 shadow-xs font-semibold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {g.subject.split(" (")[0].split(" &")[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="text-xs text-slate-500 font-mono">
                    {activeSubjectGuideline.syllabusCode}
                    <span aria-hidden="true"> · </span>
                    {activeSubjectGuideline.guidedHours}
                  </div>
                  <h3 className="mt-1 text-xl font-semibold text-slate-900">
                    {activeSubjectGuideline.subject}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    launchStudioWithPrompt(
                      activeSubjectGuideline.tutorId,
                      `Coach me on the exact A-Level examiner guidelines and Paper 1–5 requirements for ${activeSubjectGuideline.subject}.`,
                      `${activeSubjectGuideline.subject} Guidelines`
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <BookMarked className="w-4 h-4" />
                  <span>
                    Review With{" "}
                    {A_LEVEL_TUTORS.find(
                      (t) => t.id === activeSubjectGuideline.tutorId
                    )?.name ?? currentALevelTutor.name}
                  </span>
                </button>
              </div>

              {/* Paper Breakdown Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2.5 pr-4 font-semibold">Component</th>
                      <th className="py-2.5 pr-4 font-semibold">
                        Assessed Topics & Skills
                      </th>
                      <th className="py-2.5 pr-4 font-semibold">Duration</th>
                      <th className="py-2.5 font-semibold">Weighting</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeSubjectGuideline.papers.map((p) => (
                      <tr key={p.paper}>
                        <td className="py-3 pr-4 font-semibold text-slate-900 whitespace-nowrap">
                          {p.paper}
                        </td>
                        <td className="py-3 pr-4 text-slate-700 leading-relaxed">
                          {p.focus}
                        </td>
                        <td className="py-3 pr-4 font-mono text-slate-600 tabular-nums whitespace-nowrap">
                          {p.duration}
                        </td>
                        <td className="py-3 font-mono font-medium text-emerald-800 tabular-nums whitespace-nowrap">
                          {p.weighting}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Examiner Marking Rules + Practical Requirement */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                <div className="lg:col-span-8 space-y-2.5">
                  <div className="text-xs font-semibold text-slate-900">
                    Mandatory Examiner & Marking Scheme Rules
                  </div>
                  <ol className="space-y-2">
                    {activeSubjectGuideline.examinerRules.map((rule, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 leading-relaxed"
                      >
                        <span className="font-mono text-xs font-semibold text-slate-900 bg-slate-100 border border-slate-200 rounded-md px-2 py-0.5 tabular-nums shrink-0 mt-0.5">
                          0{idx + 1}
                        </span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="lg:col-span-4 rounded-xl bg-slate-900 text-slate-100 p-4 space-y-2 self-start">
                  <div className="text-xs font-semibold text-amber-300">
                    Practical & Planning Requirement
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeSubjectGuideline.practicalRequirement}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 04. Interactive A-Level Readiness Checklist */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  04. Your A-Level Readiness Checklist
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Track every requirement as you progress from AS foundation to A2
                  university readiness. Saved on this device.
                </p>
              </div>
              <div className="text-right">
                <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                  {checklistPct}%
                </div>
                <div className="text-xs text-slate-500 tabular-nums">
                  {completedChecklistCount} of {A_LEVEL_READINESS_CHECKLIST.length}{" "}
                  completed
                </div>
              </div>
            </div>

            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-emerald-700 transition-all duration-200"
                style={{ width: `${checklistPct}%` }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {A_LEVEL_READINESS_CHECKLIST.map((item) => {
                const checked = Boolean(checklist[item.id]);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                      checked
                        ? "border-emerald-700 bg-emerald-50/70"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    {checked ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    ) : (
                      <CheckSquare className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-600 leading-relaxed">
                        {item.requirement}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: ISOLATED A-LEVEL TUTOR STUDIO — VOICE CONSOLE + BOARD & WORK PAD */}
      {sectionTab === "studio" && (
        <div className="space-y-6">
          {/* Top Compact Acoustic Voice & Prompt Console */}
          <section
            aria-label="A-Level Voice Tutor Stage"
            className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs"
          >
            {/* Mode Switcher Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200/90 rounded-xl shadow-2xs">
                <button
                  type="button"
                  onClick={() => onVoiceModeChange("live")}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    voiceMode === "live"
                      ? "bg-slate-900 text-amber-300 shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Live Voice Class</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      callStatus === "connected" ||
                      callStatus === "connecting"
                    ) {
                      onStopLiveCall();
                    }
                    onVoiceModeChange("turn");
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    voiceMode === "turn"
                      ? "bg-slate-900 text-amber-300 shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Push-to-Talk & Type</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {latestTutorLine && (
                  <button
                    type="button"
                    onClick={() =>
                      onSpeakText(latestTutorLine, "latest-alevel-tutor-line")
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-xs font-medium text-amber-900 hover:bg-amber-100 transition-colors whitespace-nowrap"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                    {speakingId === "latest-alevel-tutor-line"
                      ? "Stop Reply"
                      : "Replay Last Reply"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenSnapModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Snap / Screenshot</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onSpeakText(
                      currentALevelTutor.sampleGreeting,
                      `greeting-${currentALevelTutor.id}`
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                  {speakingId === `greeting-${currentALevelTutor.id}`
                    ? "Stop Voice Sample"
                    : "Hear Tutor Voice"}
                </button>
              </div>
            </div>

            {/* Dark Acoustic Stage */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 px-5 sm:px-6 py-5 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <TutorPortrait
                    tutorId={currentALevelTutor.id}
                    name={currentALevelTutor.name}
                    sizeClass="w-14 h-14"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-white">
                        {currentALevelTutor.name}
                      </span>
                      <span className="text-xs text-amber-300 font-medium">
                        · A-Level Specialist
                      </span>
                      {callStatus === "connected" && (
                        <span className="font-mono text-xs text-slate-300 tabular-nums">
                          · {formatCallDuration(callSeconds)}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      {currentALevelTutor.subjectFocus}
                      <span aria-hidden="true"> · </span>
                      Voice {currentALevelTutor.voiceName}
                    </div>
                    <div
                      className={`text-xs mt-1 font-medium ${
                        turnState === "waiting_for_learner"
                          ? "text-amber-300"
                          : turnState === "paused"
                          ? "text-slate-300"
                          : "text-emerald-300"
                      }`}
                    >
                      {voiceMode === "live"
                        ? callStatusLabel
                        : isRecordingClip
                        ? "Recording your question..."
                        : isTranscribing
                        ? "Transcribing speech..."
                        : isSendingTurn
                        ? `${currentALevelTutor.name} is preparing an A-Level response...`
                        : "Board & Work Pad ready — speak or ask below"}
                    </div>
                  </div>
                </div>

                {voiceMode === "live" && (
                  <div className="flex items-center gap-2.5 shrink-0">
                    {callStatus === "connected" ||
                    callStatus === "connecting" ? (
                      <>
                        <button
                          type="button"
                          onClick={onToggleMute}
                          disabled={callStatus === "connecting"}
                          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap min-h-[44px] ${
                            isMuted
                              ? "bg-amber-600 text-white hover:bg-amber-500"
                              : "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700"
                          }`}
                        >
                          {isMuted ? (
                            <>
                              <Mic className="w-4 h-4" />
                              Resume Mic
                            </>
                          ) : (
                            <>
                              <MicOff className="w-4 h-4" />
                              Hold / Think
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={onStopLiveCall}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-medium hover:bg-red-500 transition-colors whitespace-nowrap min-h-[44px]"
                        >
                          <PhoneOff className="w-4 h-4" />
                          End Call
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={onStartLiveCall}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 text-sm font-semibold hover:bg-amber-300 transition-colors whitespace-nowrap min-h-[44px]"
                      >
                        <PhoneCall className="w-4 h-4" />
                        Start A-Level Voice Class
                      </button>
                    )}
                  </div>
                )}
              </div>

              <VoiceWaveform
                active={
                  callStatus === "connected" ||
                  isRecordingClip ||
                  speakingId !== null
                }
                speaker={
                  speakingId
                    ? "tutor"
                    : isRecordingClip
                    ? "learner"
                    : activeSpeaker
                }
                level={isRecordingClip || speakingId ? 0.65 : audioLevel}
              />

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {voiceMode === "live" && callStatus === "connected" ? (
                  <>
                    <span className="text-xs text-slate-400 mr-1">
                      Call replies:
                    </span>
                    {[
                      {
                        label: "I understand, next step",
                        prompt:
                          "Yes, I understand that step. Please go to the next step and wait for me.",
                      },
                      {
                        label: "Explain marking scheme",
                        prompt:
                          "Show me exactly where the M1, A1, or B1 marks are awarded in this A-Level step.",
                      },
                      {
                        label: "Give me a moment",
                        prompt:
                          "Hold on a moment please, let me work through the algebra on my pad.",
                      },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onSendTextOrTurn(item.prompt)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition-colors whitespace-nowrap"
                      >
                        {item.label}
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    <span className="text-xs text-slate-400 mr-1">
                      A-Level prompts:
                    </span>
                    {[
                      activeTopic?.starterPrompt ??
                        `Teach me ${activeTopicLabel} at A-Level depth step-by-step.`,
                      "Walk me through an A2 exam question with M1/A1 marks",
                      "What common examiner pitfalls should I avoid here?",
                    ].map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onSendTextOrTurn(prompt)}
                        disabled={isSendingTurn}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition-colors text-left truncate max-w-[260px]"
                      >
                        {idx === 0
                          ? `Explain ${activeTopic?.title ?? activeTopicLabel}`
                          : prompt}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>

            {callError && (
              <div className="mx-5 mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900">
                <span>{callError}</span>
                {voiceMode === "live" && (
                  <button
                    type="button"
                    onClick={() => {
                      onVoiceModeChange("turn");
                      onClearCallError();
                    }}
                    className="font-semibold underline hover:text-amber-950 whitespace-nowrap"
                  >
                    Use Push-to-Talk & Type
                  </button>
                )}
              </div>
            )}

            {/* Compact Speak & Ask Control Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSendTextOrTurn(textInput);
              }}
              className="border-t border-slate-200 p-3.5 sm:px-5 bg-slate-50/80 flex items-center gap-2.5"
            >
              {voiceMode === "turn" && (
                <button
                  type="button"
                  onClick={onToggleTurnRecording}
                  disabled={isTranscribing || isSendingTurn}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 min-h-[44px] ${
                    isRecordingClip
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-white border border-slate-300 text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  {isTranscribing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Transcribing
                    </>
                  ) : isRecordingClip ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      Stop & Ask
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-emerald-700" />
                      Speak
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={onOpenSnapModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 hover:border-slate-500 text-xs font-medium transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
              >
                <Camera className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">Snap / Screenshot</span>
              </button>

              <input
                type="text"
                value={textInput}
                onChange={(e) => onTextInputChange(e.target.value)}
                placeholder={`Ask ${currentALevelTutor.name} an A-Level question...`}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[44px]"
              />

              <button
                type="submit"
                disabled={!textInput.trim() || isSendingTurn}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
              >
                {isSendingTurn ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Ask
              </button>
            </form>
          </section>

          {/* Full-Width Interactive Study Workspace: Board & Work Pad Side-by-Side */}
          <div ref={studyPanelRef}>
            <RightStudyPanel
              activeTab={rightTab}
              onTabChange={onRightTabChange}
              wingMode="alevel"
              tutor={currentALevelTutor}
              profile={alevelProfile}
              activeTopic={activeTopic}
              customTopic={customTopic}
              onCustomTopicChange={onCustomTopicChange}
              onSelectTopic={onSelectTopic}
              blackboard={blackboard}
              blackboardLoading={blackboardLoading}
              blackboardError={blackboardError}
              onRefreshBlackboard={onRefreshBlackboard}
              onSaveBlackboard={onSaveBlackboard}
              onAskTutorText={onSendTextOrTurn}
              quizQuestions={quizQuestions}
              quizLoading={quizLoading}
              quizError={quizError}
              onGenerateQuiz={onGenerateQuiz}
              onRecordQuizAnswer={onRecordQuizAnswer}
              onSpeakText={onSpeakText}
              speakingId={speakingId}
              progress={progress}
              onLoadSavedNote={onLoadSavedNote}
              onDeleteSavedNote={onDeleteSavedNote}
              onResetProgress={onResetProgress}
              onSendPadToTutor={onSendPadToTutor}
              sendingPadToTutor={isSendingTurn}
              liveCallActive={
                voiceMode === "live" && callStatus === "connected"
              }
              onStartMonthlyTest={onStartMonthlyTest}
              onOpenSnapModal={onOpenSnapModal}
              onAskTutorAboutWeakness={onAskTutorAboutWeakness}
              onRemoveWeakness={onRemoveWeakness}
              onClearAllWeaknesses={onClearAllWeaknesses}
            />
          </div>
        </div>
      )}

      {/* TAB 3: DEDICATED A-LEVEL PAST PAPERS */}
      {sectionTab === "papers" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <PastPapersPanel
            defaultGrade="A-Level"
            wingMode="alevel"
            onRecordQuizAnswer={onRecordQuizAnswer}
            onSpeakText={onSpeakText}
            speakingId={speakingId}
          />
        </div>
      )}

      {/* TAB 4: A-LEVEL FLASHCARDS & MONTHLY MASTERY TESTS */}
      {sectionTab === "mastery" && (
        <div className="space-y-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <StudyFlashcards
              gradeFilter="A-Level"
              wingMode="alevel"
              onAskTutorAboutCard={(card) => {
                launchStudioWithPrompt(
                  currentALevelTutor.id,
                  `Please explain this A-Level concept thoroughly with marking-scheme tips: ${card.question} — Answer: ${card.answer}`,
                  card.subject
                );
              }}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <MonthlyTestsPanel
              profile={alevelProfile}
              wingMode="alevel"
              onStartTest={(test) => {
                setSectionTab("studio");
                onStartMonthlyTest(test);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
