import { useState } from "react";
import { Award, BookOpen, CheckCircle, ChevronLeft, ChevronRight, HelpCircle, Lightbulb, RefreshCw, Sparkles, Zap } from "lucide-react";
import type { GradeLevel } from "../data/curriculum";

interface Flashcard {
  id: string;
  grade: GradeLevel;
  subject: string;
  question: string;
  answer: string;
  examinerTip: string;
}

const FLASHCARDS_LIBRARY: Flashcard[] = [
  {
    id: "fc-1",
    grade: "Grade 12",
    subject: "Mathematics",
    question: "What is the quadratic formula used to solve ax² + bx + c = 0?",
    answer: "x = (-b ± √(b² - 4ac)) / (2a)",
    examinerTip: "Always calculate the discriminant (b² - 4ac) first to determine the nature of the roots before solving.",
  },
  {
    id: "fc-2",
    grade: "Grade 12",
    subject: "Biology",
    question: "What is the primary role of enzymes in cellular metabolism?",
    answer: "Biological catalysts that speed up chemical reactions by lowering activation energy without being consumed.",
    examinerTip: "Remember to mention 'lowering activation energy' and 'remain unchanged at the end of the reaction' for full ECZ marks.",
  },
  {
    id: "fc-3",
    grade: "Grade 12",
    subject: "Physics",
    question: "State Ohm's Law and write its formula.",
    answer: "Current flowing through a metallic conductor is directly proportional to the potential difference across its ends, provided temperature is constant. V = IR.",
    examinerTip: "Never forget the condition 'at constant temperature' — examiners dock marks if omitted.",
  },
  {
    id: "fc-4",
    grade: "Grade 9",
    subject: "Integrated Science",
    question: "What is the formula for calculating density?",
    answer: "Density = Mass / Volume (ρ = m/V). Units are g/cm³ or kg/m³.",
    examinerTip: "Always state your formula clearly with standard units (e.g., kg/m³) to earn method mark M1.",
  },
  {
    id: "fc-5",
    grade: "Grade 7",
    subject: "Mathematics",
    question: "How do you calculate percentage profit?",
    answer: "Percentage Profit = (Profit / Cost Price) × 100%",
    examinerTip: "Profit is always calculated on the Cost Price (CP), never the Selling Price (SP).",
  },
  {
    id: "fc-al-1",
    grade: "A-Level",
    subject: "Mathematics",
    question: "State the Integration by Parts formula and the LIATE priority order for choosing u.",
    answer: "∫ u (dv/dx) dx = uv - ∫ v (du/dx) dx. Choose u in order: Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential.",
    examinerTip: "For ∫ x·ln(x) dx, choose u = ln(x) even though x comes first alphabetically — differentiating ln(x) gives 1/x.",
  },
  {
    id: "fc-al-2",
    grade: "A-Level",
    subject: "Chemistry",
    question: "How does Gibbs Free Energy ΔG° = ΔH° - TΔS° determine reaction feasibility?",
    answer: "A reaction is thermodynamically feasible when ΔG° ≤ 0 (units kJ mol⁻¹). Remember to convert ΔS° from J K⁻¹ mol⁻¹ to kJ K⁻¹ mol⁻¹ by dividing by 1000.",
    examinerTip: "Forgetting to divide ΔS° by 1000 is the most common Paper 4 thermodynamic calculation error.",
  },
  {
    id: "fc-al-3",
    grade: "A-Level",
    subject: "Physics",
    question: "State Einstein's photoelectric equation and define work function Φ.",
    answer: "hf = Φ + ½mv_max². Work function Φ is the minimum photon energy required to eject an electron from the surface of a metal.",
    examinerTip: "Explain that one photon transfers all its energy to one electron, so kinetic energy depends on frequency f, not intensity.",
  },
  {
    id: "fc-al-4",
    grade: "A-Level",
    subject: "Biology",
    question: "How is the proton gradient used to synthesize ATP during oxidative phosphorylation?",
    answer: "H⁺ ions diffuse down their electrochemical gradient from the intermembrane space back into the mitochondrial matrix through ATP synthase (chemiosmosis), providing energy to phosphorylate ADP + Pi into ATP.",
    examinerTip: "Always name 'electrochemical proton gradient', 'inner mitochondrial membrane', and 'ATP synthase' for full A2 marks.",
  },
];

interface StudyFlashcardsProps {
  gradeFilter?: GradeLevel | "All";
  wingMode?: "school" | "alevel";
  onAskTutorAboutCard?: (card: Flashcard) => void;
}

export function StudyFlashcards({
  gradeFilter = "All",
  wingMode = "school",
  onAskTutorAboutCard,
}: StudyFlashcardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("All");

  const wingCards = FLASHCARDS_LIBRARY.filter((card) =>
    wingMode === "alevel" ? card.grade === "A-Level" : card.grade !== "A-Level"
  );

  const filteredCards = wingCards.filter((card) => {
    const matchesGrade =
      wingMode === "alevel" ||
      gradeFilter === "All" ||
      card.grade === gradeFilter;
    const matchesSubject =
      selectedSubject === "All" || card.subject === selectedSubject;
    return matchesGrade && matchesSubject;
  });

  const currentCard =
    filteredCards[currentIndex] ?? filteredCards[0] ?? wingCards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  if (filteredCards.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3">
        <Sparkles className="w-8 h-8 text-emerald-700 mx-auto" />
        <div className="text-sm font-semibold text-slate-900">
          No Flashcards Found for This Filter
        </div>
        <p className="text-xs text-slate-600">
          Try switching your subject filter above to explore quick concept drills.
        </p>
      </div>
    );
  }

  const subjectChips =
    wingMode === "alevel"
      ? ["All", "Mathematics", "Chemistry", "Physics", "Biology"]
      : ["All", "Mathematics", "Biology", "Physics"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {wingMode === "alevel"
                ? "A-Level Concept & Examiner Drills"
                : "ECZ Flashcard Concept Drills"}
            </h3>
            <p className="text-xs text-slate-500">
              Card {currentIndex + 1} of {filteredCards.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200/80 rounded-xl overflow-x-auto no-scrollbar">
          {subjectChips.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => {
                setSelectedSubject(sub);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                selectedSubject === sub
                  ? wingMode === "alevel"
                    ? "bg-slate-900 text-amber-300 shadow-xs font-semibold"
                    : "bg-emerald-700 text-white shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Flashcard */}
      <div
        onClick={() => setIsFlipped((prev) => !prev)}
        className="relative rounded-2xl border-2 border-emerald-700/30 bg-gradient-to-br from-white via-emerald-50/30 to-white p-6 sm:p-8 min-h-[220px] sm:min-h-[240px] flex flex-col justify-between cursor-pointer shadow-sm hover:border-emerald-600 transition-all select-none"
      >
        <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
          <span>
            {currentCard.grade} · {currentCard.subject}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200">
            <RefreshCw className="w-3 h-3" />
            {isFlipped ? "Showing Answer (Tap to flip)" : "Showing Question (Tap to reveal)"}
          </span>
        </div>

        <div className="my-6 text-center space-y-2">
          {!isFlipped ? (
            <div className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
              {currentCard.question}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-base sm:text-lg font-bold text-emerald-900 leading-relaxed">
                {currentCard.answer}
              </div>
              <div className="pt-2 border-t border-emerald-200/60 text-xs text-amber-900 bg-amber-50/80 p-3 rounded-xl text-left flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">Examiner's Tip:</strong>{" "}
                  {currentCard.examinerTip}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
          <span>Tap anywhere to flip card</span>
          {onAskTutorAboutCard && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAskTutorAboutCard(currentCard);
              }}
              className="text-emerald-700 hover:text-emerald-900 font-semibold underline"
            >
              Ask Tutor to Explain →
            </button>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Card</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors cursor-pointer"
        >
          <span>Next Concept</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
