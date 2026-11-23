import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  RefreshCw,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
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
  {
    id: "fc-6",
    grade: "Grade 7",
    subject: "Biology",
    question: "Name the seven characteristics of living things (MRS GREN).",
    answer: "Movement, Respiration, Sensitivity, Growth, Reproduction, Excretion, Nutrition.",
    examinerTip: "Write all seven words in full. A single letter like 'R' earns no mark because it could mean two things.",
  },
  {
    id: "fc-7",
    grade: "Grade 8",
    subject: "Mathematics",
    question: "State Pythagoras' theorem for a right-angled triangle.",
    answer: "The square of the hypotenuse equals the sum of the squares of the other two sides: c² = a² + b².",
    examinerTip: "The hypotenuse is the longest side, opposite the right angle. Find it first before substituting.",
  },
  {
    id: "fc-8",
    grade: "Grade 8",
    subject: "Biology",
    question: "Write the word equation for photosynthesis.",
    answer: "Carbon dioxide + water → glucose + oxygen, in the presence of light and chlorophyll.",
    examinerTip: "Always include the conditions: light energy and chlorophyll. Examiners look for both.",
  },
  {
    id: "fc-9",
    grade: "Grade 9",
    subject: "Mathematics",
    question: "What are the formulae for the area and circumference of a circle?",
    answer: "Area = πr². Circumference = 2πr (or πd).",
    examinerTip: "Area is in square units (cm²) and circumference is in plain units (cm). Check you used the radius, not the diameter.",
  },
  {
    id: "fc-10",
    grade: "Grade 10",
    subject: "Physics",
    question: "State the formula for speed and name its units.",
    answer: "Speed = distance ÷ time. Units: metres per second (m/s) or kilometres per hour (km/h).",
    examinerTip: "Convert units first. If distance is in km and time in minutes, change one of them before you divide.",
  },
  {
    id: "fc-11",
    grade: "Grade 10",
    subject: "Biology",
    question: "Define osmosis.",
    answer: "The net movement of water molecules from a region of higher water potential to a region of lower water potential through a partially permeable membrane.",
    examinerTip: "Say 'water molecules' and 'partially permeable membrane'. Writing only 'water moves' loses marks.",
  },
  {
    id: "fc-12",
    grade: "Grade 11",
    subject: "Mathematics",
    question: "How do you find the gradient of a line through two points, and what is the equation of a straight line?",
    answer: "Gradient m = (y₂ − y₁) ÷ (x₂ − x₁). Straight line: y = mx + c, where c is the y-intercept.",
    examinerTip: "Subtract the y-values and the x-values in the same order, or your gradient will have the wrong sign.",
  },
  {
    id: "fc-13",
    grade: "Grade 11",
    subject: "Physics",
    question: "State Newton's second law of motion.",
    answer: "The resultant force on an object equals its mass multiplied by its acceleration: F = ma.",
    examinerTip: "Use the resultant (net) force, not just one of the forces. Force in newtons, mass in kg, acceleration in m/s².",
  },
  {
    id: "fc-14",
    grade: "Grade 8",
    subject: "Mathematics",
    question: "What is the formula for simple interest?",
    answer: "I = (P × R × T) ÷ 100, where P is the principal, R the rate per year (%), and T the time in years.",
    examinerTip: "Match the time to the rate. If the rate is per year, change months into years before you calculate.",
  },
];

// ---------- Spaced repetition (Leitner boxes), stored on this device ----------
// Box 0 = new or forgotten. Each time a learner gets a card right it moves up a box
// and comes back after a longer gap.
const STORAGE_KEY = "kasukulu_flashcards_v1";
const MASTERED_BOX = 4;
const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30];
const DAY_MS = 24 * 60 * 60 * 1000;

interface CardState {
  box: number;
  due: number; // epoch ms
}

type CardStateMap = Record<string, CardState>;

function loadStates(): CardStateMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as CardStateMap) : {};
  } catch {
    return {};
  }
}

function saveStates(map: CardStateMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Storage blocked: reviewing still works for this visit.
  }
}

function isDue(state: CardState | undefined, now: number): boolean {
  return !state || state.due <= now;
}

function buildQueue(cards: Flashcard[], states: CardStateMap, now: number): string[] {
  return cards
    .filter((c) => isDue(states[c.id], now))
    .sort((a, b) => (states[a.id]?.due ?? 0) - (states[b.id]?.due ?? 0))
    .map((c) => c.id);
}

function selectCards(
  wingMode: "school" | "alevel",
  gradeFilter: GradeLevel | "All",
  subject: string
): { wingCards: Flashcard[]; filteredCards: Flashcard[] } {
  const wingCards = FLASHCARDS_LIBRARY.filter((card) =>
    wingMode === "alevel" ? card.grade === "A-Level" : card.grade !== "A-Level"
  );
  const filteredCards = wingCards.filter((card) => {
    const matchesGrade =
      wingMode === "alevel" ||
      gradeFilter === "All" ||
      card.grade === gradeFilter;
    const matchesSubject = subject === "All" || card.subject === subject;
    return matchesGrade && matchesSubject;
  });
  return { wingCards, filteredCards };
}

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
  const [mode, setMode] = useState<"review" | "browse">("review");
  const [states, setStates] = useState<CardStateMap>(() => loadStates());
  // Built on the first render so the "all caught up" screen never flashes by mistake.
  const [queue, setQueue] = useState<string[]>(() =>
    buildQueue(
      selectCards(wingMode, gradeFilter, "All").filteredCards,
      loadStates(),
      Date.now()
    )
  );

  const { wingCards, filteredCards } = selectCards(
    wingMode,
    gradeFilter,
    selectedSubject
  );

  // Rebuild today's review queue when the filters (and so the deck) change.
  const deckSignature = filteredCards.map((c) => c.id).join(",");
  useEffect(() => {
    setQueue(buildQueue(filteredCards, loadStates(), Date.now()));
    setIsFlipped(false);
    setCurrentIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckSignature]);

  const now = Date.now();
  const stats = useMemo(() => {
    const t = Date.now();
    let due = 0;
    let mastered = 0;
    let nextDue: number | null = null;
    for (const c of filteredCards) {
      const st = states[c.id];
      if (isDue(st, t)) due += 1;
      else if (st && (nextDue === null || st.due < nextDue)) nextDue = st.due;
      if (st && st.box >= MASTERED_BOX) mastered += 1;
    }
    return { due, mastered, nextDue };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckSignature, states]);

  const reviewCard =
    mode === "review"
      ? filteredCards.find((c) => c.id === queue[0]) ?? null
      : null;
  const browseCard =
    filteredCards[currentIndex] ?? filteredCards[0] ?? wingCards[0];
  const currentCard = mode === "review" ? reviewCard : browseCard;

  const rate = (known: boolean) => {
    if (!reviewCard) return;
    const t = Date.now();
    const prevBox = states[reviewCard.id]?.box ?? 0;
    const box = known ? Math.min(INTERVAL_DAYS.length - 1, prevBox + 1) : 0;
    const next: CardStateMap = {
      ...states,
      [reviewCard.id]: { box, due: t + INTERVAL_DAYS[box] * DAY_MS },
    };
    setStates(next);
    saveStates(next);
    setQueue((q) => {
      const rest = q.slice(1);
      return known ? rest : [...rest, reviewCard.id];
    });
    setIsFlipped(false);
  };

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

  const daysUntilNext =
    stats.nextDue !== null
      ? Math.max(1, Math.ceil((stats.nextDue - now) / DAY_MS))
      : null;

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
              {mode === "review"
                ? `${queue.length} to review today · ${stats.mastered} of ${filteredCards.length} mastered`
                : `Card ${currentIndex + 1} of ${filteredCards.length}`}
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

      {/* Review / Browse switch */}
      <div
        role="tablist"
        aria-label="Flashcard mode"
        className="inline-flex items-center gap-1 p-1 bg-slate-100 border border-slate-200/80 rounded-xl"
      >
        {(
          [
            { id: "review", label: "Smart review" },
            { id: "browse", label: "Browse all" },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => {
              setMode(m.id);
              setIsFlipped(false);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[36px] ${
              mode === m.id
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* All caught up */}
      {mode === "review" && !currentCard && (
        <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-white p-8 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-emerald-700 mx-auto" />
          <div className="text-base font-bold text-slate-900">
            You're all caught up! 🎉
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {daysUntilNext !== null
              ? `Your next cards come back in ${daysUntilNext} ${
                  daysUntilNext === 1 ? "day" : "days"
                }. Coming back on time is what makes them stick.`
              : "Come back tomorrow to keep the cards fresh."}
          </p>
          <button
            type="button"
            onClick={() => setMode("browse")}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold min-h-[44px] cursor-pointer"
          >
            Browse all cards anyway
          </button>
        </div>
      )}

      {/* Interactive Flashcard */}
      {currentCard && (
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
      )}

      {/* Review controls */}
      {mode === "review" && currentCard && (
        <div>
          {isFlipped ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => rate(false)}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-amber-400 bg-amber-50 text-amber-900 text-sm font-semibold hover:bg-amber-100 min-h-[48px] cursor-pointer"
              >
                <X className="w-4 h-4" />
                Not yet
              </button>
              <button
                type="button"
                onClick={() => rate(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold min-h-[48px] cursor-pointer"
              >
                <Check className="w-4 h-4" />
                I knew it
              </button>
            </div>
          ) : (
            <p className="text-center text-xs text-slate-500">
              Try to remember the answer, then tap the card to check.
            </p>
          )}
        </div>
      )}

      {/* Browse navigation */}
      {mode === "browse" && (
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
      )}
    </div>
  );
}
