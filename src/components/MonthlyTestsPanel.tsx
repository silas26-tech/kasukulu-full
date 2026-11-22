import { useState } from "react";
import { Award, BookOpen, CheckCircle, Clock, FileText, Play, Sparkles, Trophy } from "lucide-react";
import type { GradeLevel, LearnerProfile } from "../data/curriculum";

interface MonthlyTestModule {
  id: string;
  monthNumber: number;
  title: string;
  grade: GradeLevel;
  subject: string;
  description: string;
  topicsCovered: string[];
  totalMarks: number;
  durationMinutes: number;
}

const MONTHLY_TESTS_LIBRARY: MonthlyTestModule[] = [
  {
    id: "m1-math-g12",
    monthNumber: 1,
    title: "Month 1: Algebra & Quadratic Functions",
    grade: "Grade 12",
    subject: "Mathematics",
    description: "Comprehensive assessment covering algebraic fractions, indices, and quadratic equations by factorization and formula.",
    topicsCovered: ["Indices & Logarithms", "Quadratic Equations", "Completing the Square", "Simultaneous Equations"],
    totalMarks: 25,
    durationMinutes: 45,
  },
  {
    id: "m2-bio-g12",
    monthNumber: 2,
    title: "Month 2: Cell Biology & Genetics",
    grade: "Grade 12",
    subject: "Biology",
    description: "Assesses cellular structures, enzyme action, mitosis/meiosis, and monohybrid genetic crosses with phenotypic ratios.",
    topicsCovered: ["Enzymes & Substrates", "Cell Division", "Mendelian Genetics", "DNA Structure"],
    totalMarks: 30,
    durationMinutes: 45,
  },
  {
    id: "m3-phys-g12",
    monthNumber: 3,
    title: "Month 3: Current Electricity & Electromagnetism",
    grade: "Grade 12",
    subject: "Physics",
    description: "Evaluates Ohm's Law, series/parallel resistor circuits, electrical power consumption (kWh), and electromagnetic induction.",
    topicsCovered: ["Ohm's Law", "Equivalent Resistance", "Electrical Energy Costs", "Transformers"],
    totalMarks: 25,
    durationMinutes: 45,
  },
  {
    id: "m1-sci-g9",
    monthNumber: 1,
    title: "Month 1: Matter, Forces & Energy",
    grade: "Grade 9",
    subject: "Integrated Science",
    description: "Test on particle theory of matter, density calculations, moments of forces, and simple machine mechanical advantage.",
    topicsCovered: ["States of Matter", "Density = m/V", "Principle of Moments", "Energy Conversions"],
    totalMarks: 20,
    durationMinutes: 30,
  },
  {
    id: "m1-comp-g7",
    monthNumber: 1,
    title: "Month 1: Ratios, Percentages & Data",
    grade: "Grade 7",
    subject: "Mathematics",
    description: "Composite test on sharing quantities in ratios, percentage profit/loss in Kwacha, and bar chart interpretation.",
    topicsCovered: ["Ratios & Proportions", "Percentage Profit & Loss", "Unitary Method", "Bar Graphs"],
    totalMarks: 20,
    durationMinutes: 30,
  },
  {
    id: "m1-math-alevel",
    monthNumber: 1,
    title: "A-Level Month 1: Advanced Calculus & 3D Vectors",
    grade: "A-Level",
    subject: "Mathematics",
    description: "Rigorous assessment on integration by parts, substitution, first-order differential equations, and 3D vector line equations.",
    topicsCovered: ["Integration by Parts", "Separable Differential Equations", "Scalar Product a·b", "3D Intersecting Lines"],
    totalMarks: 35,
    durationMinutes: 60,
  },
  {
    id: "m1-chem-alevel",
    monthNumber: 1,
    title: "A-Level Month 1: Organic Mechanisms & Energetics",
    grade: "A-Level",
    subject: "Chemistry",
    description: "Evaluates nucleophilic substitution (SN1 vs SN2), curly arrow mechanisms, Born-Haber lattice cycles, and Gibbs Free Energy (ΔG).",
    topicsCovered: ["SN1 & SN2 Mechanisms", "Carbocation Stability", "Born-Haber Cycles", "Gibbs Free Energy ΔG"],
    totalMarks: 30,
    durationMinutes: 50,
  },
  {
    id: "m1-phys-alevel",
    monthNumber: 1,
    title: "A-Level Month 1: Fields, Capacitance & Quantum Physics",
    grade: "A-Level",
    subject: "Physics",
    description: "Assesses gravitational & electric potential, RC circuit time constants, and the photoelectric effect with de Broglie wavelength.",
    topicsCovered: ["Gravitational Potential V = -GM/r", "Capacitor Discharge Q = Q₀e^(-t/RC)", "Photoelectric Equation", "de Broglie Wavelength"],
    totalMarks: 35,
    durationMinutes: 60,
  },
  {
    id: "m1-bio-alevel",
    monthNumber: 1,
    title: "A-Level Month 1: Respiration Biochemistry & Gene Tech",
    grade: "A-Level",
    subject: "Biology",
    description: "Covers Krebs cycle electron carriers, chemiosmotic ATP synthesis, PCR thermal cycling, and gel electrophoresis analysis.",
    topicsCovered: ["Oxidative Phosphorylation", "Krebs Cycle", "PCR Temperature Steps", "Recombinant Plasmids"],
    totalMarks: 30,
    durationMinutes: 50,
  },
];

interface MonthlyTestsPanelProps {
  profile: LearnerProfile;
  wingMode?: "school" | "alevel";
  onStartTest: (test: MonthlyTestModule) => void;
}

export function MonthlyTestsPanel({
  profile,
  wingMode = "school",
  onStartTest,
}: MonthlyTestsPanelProps) {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | "All">("All");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");

  const wingTests = MONTHLY_TESTS_LIBRARY.filter((test) =>
    wingMode === "alevel" ? test.grade === "A-Level" : test.grade !== "A-Level"
  );

  const filteredTests = wingTests.filter((test) => {
    const matchesGrade =
      wingMode === "alevel" ||
      selectedGrade === "All" ||
      test.grade === selectedGrade;
    const matchesSubject =
      selectedSubject === "All" || test.subject === selectedSubject;
    return matchesGrade && matchesSubject;
  });

  const subjectOptions =
    wingMode === "alevel"
      ? ["All", "Mathematics", "Chemistry", "Physics", "Biology"]
      : ["All", "Mathematics", "Biology", "Physics", "Integrated Science"];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-amber-50/60 p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
          <Award className="w-4 h-4 text-amber-600" />
          <span>
            {wingMode === "alevel"
              ? "A-Level Monthly Mastery Assessments"
              : "Monthly Topic-Completion & Mastery Tests"}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          {wingMode === "alevel"
            ? "A-Level AS & A2 Progress Assessments"
            : "ECZ Monthly Progress Assessments"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
          {wingMode === "alevel"
            ? "Test your A-Level subject mastery with structured calculus, mechanism, field physics, and molecular biology assessments marked against official M1/A1/B1 schemes."
            : "After completing your daily topics, test your mastery every month with official ECZ-style monthly assessments. Each test is marked step-by-step against official grading schemes to verify your exam readiness."}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {wingMode === "school" && (
          <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200/80 rounded-xl overflow-x-auto no-scrollbar">
            {(["All", "Grade 7", "Grade 9", "Grade 12"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGrade(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedGrade === g
                    ? "bg-slate-900 text-white shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200/80 rounded-xl overflow-x-auto no-scrollbar">
          {subjectOptions.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubject(sub)}
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

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTests.map((test) => (
          <div
            key={test.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4 shadow-2xs hover:border-emerald-600/60 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold">
                  Month {test.monthNumber} Assessment
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {test.grade} · {test.subject}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-900">
                  {test.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {test.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {test.topicsCovered.map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  {test.durationMinutes} mins
                </span>
                <span>·</span>
                <span>{test.totalMarks} Marks</span>
              </div>

              <button
                type="button"
                onClick={() => onStartTest(test)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Monthly Test</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
