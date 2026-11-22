import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CloudDownload,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  ShieldCheck,
  Volume2,
  XCircle,
} from "lucide-react";
import { type GradeLevel, type QuizQuestion } from "../data/curriculum";
import {
  A_LEVEL_PAST_PAPERS,
  ECZ_SCHOOL_PAST_PAPERS,
  type EczPastPaper,
  type PastPaperNumber,
  type PastPaperQuestion,
} from "../data/eczPastPapers";

// Must match cacheName in vite.config.ts (workbox runtimeCaching).
const PAPER_CACHE_NAME = "ecz-papers";
type OfflineState = "idle" | "saving" | "saved" | "error";

// Embedded PDFs are unreliable on phones (iOS shows only page 1), so default them off.
function isSmallScreen(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(max-width: 767px)").matches
  );
}

interface PastPapersPanelProps {
  defaultGrade: GradeLevel;
  wingMode?: "school" | "alevel";
  onRecordQuizAnswer: (isCorrect: boolean, questionObj?: QuizQuestion) => void;
  onSpeakText: (text: string, id: string) => void;
  speakingId: string | null;
  onAddWeakness?: (
    title: string,
    subject: string,
    prompt?: string,
    explanation?: string
  ) => void;
}

const SCHOOL_GRADE_FILTERS: Array<"All" | GradeLevel> = [
  "All",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

type SubjectGroup =
  | "All"
  | "Mathematics"
  | "Sciences"
  | "Chemistry"
  | "Physics"
  | "Biology"
  | "English & Civic";

const SCHOOL_SUBJECT_GROUPS: SubjectGroup[] = [
  "All",
  "Mathematics",
  "Sciences",
  "Biology",
  "English & Civic",
];

const ALEVEL_SUBJECT_GROUPS: SubjectGroup[] = [
  "All",
  "Mathematics",
  "Chemistry",
  "Physics",
  "Biology",
];

const SCHOOL_PAPER_FILTERS: Array<"All" | PastPaperNumber> = [
  "All",
  "Paper 1",
  "Paper 2",
  "Composite",
];

const ALEVEL_PAPER_FILTERS: Array<"All" | PastPaperNumber> = [
  "All",
  "Paper 1",
  "Paper 2",
];

function matchesSubjectGroup(subject: string, group: SubjectGroup): boolean {
  if (group === "All") return true;
  const s = subject.toLowerCase();
  if (group === "Mathematics") return s.includes("math");
  if (group === "Chemistry") return s.includes("chem");
  if (group === "Physics") return s.includes("phys");
  if (group === "Biology") return s.includes("bio");
  if (group === "Sciences") {
    return (
      s.includes("science") ||
      s.includes("biology") ||
      s.includes("chemistry") ||
      s.includes("physics")
    );
  }
  return (
    s.includes("english") ||
    s.includes("civic") ||
    s.includes("social") ||
    s.includes("language")
  );
}

export function PastPapersPanel({
  defaultGrade,
  wingMode = "school",
  onRecordQuizAnswer,
  onSpeakText,
  speakingId,
  onAddWeakness,
}: PastPapersPanelProps) {
  const [gradeFilter, setGradeFilter] = useState<"All" | GradeLevel>(
    wingMode === "alevel"
      ? "A-Level"
      : defaultGrade === "A-Level"
      ? "Grade 12"
      : defaultGrade
  );
  const [subjectFilter, setSubjectFilter] = useState<SubjectGroup>("All");
  const [yearFilter, setYearFilter] = useState<"All" | number>("All");
  const [paperFilter, setPaperFilter] = useState<"All" | PastPaperNumber>(
    "All"
  );
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState<boolean>(() => !isSmallScreen());
  const [offlineStates, setOfflineStates] = useState<Record<string, OfflineState>>({});
  const [revealedGuides, setRevealedGuides] = useState<Record<string, boolean>>(
    {}
  );
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [flaggedWeaknessKeys, setFlaggedWeaknessKeys] = useState<
    Record<string, boolean>
  >({});

  const allPapers =
    wingMode === "alevel" ? A_LEVEL_PAST_PAPERS : ECZ_SCHOOL_PAST_PAPERS;

  const availableYears = Array.from(
    new Set(allPapers.map((paper) => paper.year))
  ).sort((a, b) => b - a);

  const filteredPapers = allPapers.filter((paper) => {
    if (
      wingMode === "school" &&
      gradeFilter !== "All" &&
      paper.grade !== gradeFilter
    ) {
      return false;
    }
    if (!matchesSubjectGroup(paper.subject, subjectFilter)) return false;
    if (yearFilter !== "All" && paper.year !== yearFilter) return false;
    if (paperFilter !== "All" && paper.paperNumber !== paperFilter) return false;
    return true;
  });

  const activePaper: EczPastPaper | null =
    allPapers.find((p) => p.id === selectedPaperId) ?? null;

  const activePdfUrl = activePaper?.pdfUrl;
  const activePaperId = activePaper?.id;

  // Check whether the open paper is already saved on this device.
  useEffect(() => {
    if (!activePdfUrl || !activePaperId || typeof caches === "undefined") return;
    let cancelled = false;
    caches
      .open(PAPER_CACHE_NAME)
      .then((cache) => cache.match(activePdfUrl))
      .then((hit) => {
        if (!cancelled && hit) {
          setOfflineStates((prev) => ({ ...prev, [activePaperId]: "saved" }));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [activePdfUrl, activePaperId]);

  const savePaperOffline = async (paperId: string, url: string) => {
    if (typeof caches === "undefined") {
      setOfflineStates((prev) => ({ ...prev, [paperId]: "error" }));
      return;
    }
    setOfflineStates((prev) => ({ ...prev, [paperId]: "saving" }));
    try {
      const res = await fetch(url);
      const type = res.headers.get("content-type") ?? "";
      if (!res.ok || !type.includes("pdf")) throw new Error("Not a PDF");
      const cache = await caches.open(PAPER_CACHE_NAME);
      await cache.put(url, res);
      setOfflineStates((prev) => ({ ...prev, [paperId]: "saved" }));
    } catch {
      setOfflineStates((prev) => ({ ...prev, [paperId]: "error" }));
    }
  };

  const toggleGuide = (key: string) => {
    setRevealedGuides((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleMcqPick = (
    key: string,
    optIdx: number,
    question: PastPaperQuestion
  ) => {
    if (mcqAnswers[key] !== undefined) return;
    setMcqAnswers((prev) => ({ ...prev, [key]: optIdx }));
    if (typeof question.correctIndex === "number") {
      const isCorrect = optIdx === question.correctIndex;
      onRecordQuizAnswer(isCorrect, {
        question: question.prompt,
        options: question.options || [],
        correctIndex: question.correctIndex,
        explanation: question.markingGuide.join(". "),
      });
    }
  };

  const handleResetFilters = () => {
    setGradeFilter(wingMode === "alevel" ? "A-Level" : "All");
    setSubjectFilter("All");
    setYearFilter("All");
    setPaperFilter("All");
  };

  if (activePaper) {
    return (
      <div className="space-y-5">
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              setSelectedPaperId(null);
              setShowPdfViewer(false);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Verified Past Papers
          </button>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Record
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {activePaper.year}
                </span>
                <span aria-hidden="true">·</span>
                <span>{activePaper.grade}</span>
                <span aria-hidden="true">·</span>
                <span>{activePaper.paperNumber}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{activePaper.paperCode}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {activePaper.totalMarks} marks
                </span>
              </div>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                {activePaper.title}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {activePaper.sourceLabel} · {activePaper.durationMinutes} min
              </p>
            </div>

            {activePaper.pdfUrl && (
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPdfViewer((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    showPdfViewer
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  {showPdfViewer ? "Hide Paper PDF" : "View Paper PDF"}
                </button>
                <a
                  href={activePaper.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors whitespace-nowrap"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Full PDF
                </a>
                <button
                  type="button"
                  disabled={offlineStates[activePaper.id] === "saving"}
                  onClick={() =>
                    void savePaperOffline(activePaper.id, activePaper.pdfUrl as string)
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60"
                >
                  <CloudDownload className="w-3.5 h-3.5" />
                  {offlineStates[activePaper.id] === "saved"
                    ? "Saved offline ✓"
                    : offlineStates[activePaper.id] === "saving"
                    ? "Saving…"
                    : offlineStates[activePaper.id] === "error"
                    ? "Couldn't save, retry"
                    : "Save for offline"}
                </button>
                <a
                  href={activePaper.pdfUrl}
                  download={`${activePaper.id}.pdf`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </a>
              </div>
            )}
          </div>
        </div>

        {showPdfViewer && activePaper.pdfUrl && (
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shadow-xs">
            <div className="px-4 py-2.5 bg-slate-900 text-slate-100 flex items-center justify-between text-xs">
              <span className="font-medium">
                {activePaper.paperCode} ({activePaper.year}) — Original Past Paper PDF
              </span>
              <span className="font-mono text-[11px] text-slate-300">
                {activePaper.durationMinutes} min · {activePaper.totalMarks} marks
              </span>
            </div>
            <iframe
              src={`${activePaper.pdfUrl}#view=FitH`}
              title={`${activePaper.title} PDF`}
              className="w-full h-[70vh] sm:h-[860px] bg-white"
            />
            <div className="px-4 py-2.5 bg-white border-t border-slate-200 text-[11px] text-slate-600">
              Not showing on your phone?{" "}
              <a
                href={activePaper.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-emerald-800 underline"
              >
                Open the PDF in a new tab
              </a>
              .
            </div>
          </div>
        )}

        <div className="space-y-4">
          {activePaper.questions.map((q, idx) => {
            const qKey = `${activePaper.id}-${idx}`;
            const guideOpen = Boolean(revealedGuides[qKey]);
            const chosen = mcqAnswers[qKey];
            const answered = chosen !== undefined;
            const isCorrect =
              typeof q.correctIndex === "number" && chosen === q.correctIndex;
            const speakKey = `paper-guide-${qKey}`;

            return (
              <div
                key={qKey}
                className="rounded-xl border border-slate-200 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-semibold text-slate-800">
                      {q.number}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      [{q.marks} {q.marks === 1 ? "mark" : "marks"}]
                    </span>
                  </div>
                  {answered && typeof q.correctIndex === "number" && (
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${
                        isCorrect ? "text-emerald-700" : "text-amber-800"
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Correct
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          Review Guide
                        </>
                      )}
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-900 leading-relaxed">
                  {q.prompt}
                </p>

                {q.type === "mcq" && q.options && q.options.length > 0 && (
                  <div className="space-y-1.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = chosen === optIdx;
                      const isRightOpt = q.correctIndex === optIdx;
                      let style =
                        "border-slate-200 bg-white text-slate-700 hover:border-slate-300";
                      if (answered) {
                        if (isRightOpt) {
                          style =
                            "border-emerald-600 bg-emerald-50 text-emerald-950 font-medium";
                        } else if (isSelected) {
                          style = "border-red-400 bg-red-50 text-red-900";
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
                          onClick={() => handleMcqPick(qKey, optIdx, q)}
                          className={`w-full text-left px-3.5 py-2 rounded-lg border text-xs transition-colors flex items-center gap-2.5 ${style}`}
                        >
                          <span className="font-mono text-xs opacity-70 shrink-0">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {guideOpen && q.markingGuide.length > 0 && (
                  <div className="rounded-lg bg-slate-900 text-slate-50 p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-emerald-300">
                        Verified Marking Guide
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onSpeakText(
                            `${q.number}. ${q.markingGuide.join(". ")}`,
                            speakKey
                          )
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-200 hover:text-emerald-300 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        {speakingId === speakKey ? "Stop audio" : "Listen"}
                      </button>
                    </div>
                    <ol className="space-y-1.5 font-mono text-xs text-slate-100 leading-relaxed">
                      {q.markingGuide.map((line, sIdx) => (
                        <li key={sIdx}>{line}</li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <button
                    type="button"
                    onClick={() => toggleGuide(qKey)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-950 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {guideOpen ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        Hide Guide
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        Marking Guide
                      </>
                    )}
                  </button>

                  {onAddWeakness && (
                    <button
                      type="button"
                      onClick={() => {
                        onAddWeakness(
                          `${activePaper.subject}: ${activePaper.paperCode} ${q.number}`,
                          activePaper.subject,
                          q.prompt,
                          q.markingGuide.join(". ") || "Flagged from ECZ Past Paper for targeted revision."
                        );
                        setFlaggedWeaknessKeys((prev) => ({ ...prev, [qKey]: true }));
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      {flaggedWeaknessKeys[qKey] ? "Saved in Weaknesses" : "Save to Weaknesses"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {wingMode === "alevel"
              ? "Verified A-Level Past Papers"
              : "Verified ECZ Past Papers"}
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            {wingMode === "alevel"
              ? "Official AS & A2 past paper PDFs and marking guides. Select any paper to view the original document and check marking schemes."
              : "Official Grade 7, Grade 9 & Grade 12 ECZ past papers and marking schemes. Select any paper to view the original PDF and check marking guides."}
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 shrink-0">
          <ShieldCheck className="w-4 h-4" />
          {filteredPapers.length}{" "}
          {filteredPapers.length === 1 ? "verified paper" : "verified papers"}
        </span>
      </div>

      {/* Filters: Grade, Subject, Year, Paper */}
      <div className="space-y-2">
        {wingMode === "school" && (
          <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200/80 rounded-xl overflow-x-auto no-scrollbar">
            {SCHOOL_GRADE_FILTERS.map((grade) => {
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

        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200/80 rounded-xl overflow-x-auto no-scrollbar">
          {(wingMode === "alevel"
            ? ALEVEL_SUBJECT_GROUPS
            : SCHOOL_SUBJECT_GROUPS
          ).map((group) => {
            const active = subjectFilter === group;
            return (
              <button
                key={group}
                type="button"
                onClick={() => setSubjectFilter(group)}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? wingMode === "alevel"
                      ? "bg-slate-900 text-amber-300 shadow-xs font-semibold"
                      : "bg-slate-900 text-white shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                }`}
              >
                {group}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200/80 rounded-xl overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setYearFilter("All")}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                yearFilter === "All"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
              }`}
            >
              All Years
            </button>
            {availableYears.map((yr) => {
              const active = yearFilter === yr;
              return (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setYearFilter(yr)}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-mono font-medium transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                    active
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                  }`}
                >
                  {yr}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200/80 rounded-xl overflow-x-auto no-scrollbar">
            {(wingMode === "alevel"
              ? ALEVEL_PAPER_FILTERS
              : SCHOOL_PAPER_FILTERS
            ).map((pType) => {
              const active = paperFilter === pType;
              return (
                <button
                  key={pType}
                  type="button"
                  onClick={() => setPaperFilter(pType)}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                  }`}
                >
                  {pType === "All" ? "All Papers" : pType}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filteredPapers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center space-y-2.5">
          <FileText className="w-6 h-6 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900">
            Verified paper coming soon
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            No verified ECZ past paper record matches this exact Grade, Subject,
            Year, and Paper combination yet. Only real verified past papers are
            listed here.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-medium hover:bg-slate-100 transition-colors whitespace-nowrap cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
          {filteredPapers.map((paper) => (
            <button
              key={paper.id}
              type="button"
              onClick={() => {
                setSelectedPaperId(paper.id);
                setShowPdfViewer(!isSmallScreen());
              }}
              className="w-full text-left py-3.5 px-3 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 cursor-pointer"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                  <span className="font-mono font-medium text-slate-700 tabular-nums">
                    {paper.year}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{paper.grade}</span>
                  <span aria-hidden="true">·</span>
                  <span>{paper.subject}</span>
                  <span aria-hidden="true">·</span>
                  <span>{paper.paperNumber}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{paper.paperCode}</span>
                  {paper.pdfUrl && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-700 font-medium">
                        PDF Available
                      </span>
                    </>
                  )}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {paper.title}
                </div>
                <div className="mt-1 text-xs text-slate-500 tabular-nums">
                  {paper.questions.length} verified questions
                  <span aria-hidden="true"> · </span>
                  {paper.durationMinutes} min paper
                  <span aria-hidden="true"> · </span>
                  {paper.totalMarks} marks total
                </div>
              </div>
              <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
