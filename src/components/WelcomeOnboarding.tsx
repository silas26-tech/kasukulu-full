import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import {
  A_LEVEL_TUTORS,
  ECZ_SCHOOL_TUTORS,
  ZAMBIAN_PROVINCES,
  ZAMBIAN_SUBJECTS_BY_GRADE,
  type GradeLevel,
  type LanguageAid,
  type LearnerProfile,
  type LearningPace,
} from "../data/curriculum";
import { TutorPortrait } from "./TutorPortrait";
import { PWAInstallButton } from "./PWAInstallButton";
import heroStudyImg from "../assets/images/hero_kasukulu_study_1794757601720.jpg";
import appLogoImg from "../assets/images/app_logo_kasukulu_1794875593858.jpg";

interface WelcomeOnboardingProps {
  initialProfile: LearnerProfile;
  onComplete: (profile: LearnerProfile, tutorId: string) => void;
}

const GRADES: GradeLevel[] = [
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
  "A-Level",
];
const LANGUAGES: LanguageAid[] = [
  "English Only",
  "English + Bemba",
  "English + Nyanja",
  "English + Tonga",
  "English + Lozi",
  "English + Kaonde",
  "English + Luvale",
  "English + Lunda",
  "English + French",
  "English + Swahili",
];
const PACES: { value: LearningPace; detail: string }[] = [
  {
    value: "Step-by-step",
    detail: "One concept at a time with comprehension checks",
  },
  {
    value: "Exam Revision",
    detail: "ECZ marking-scheme tips and past-paper focus",
  },
  {
    value: "Challenge Me",
    detail: "Guided problem solving before showing answers",
  },
];

export function WelcomeOnboarding({
  initialProfile,
  onComplete,
}: WelcomeOnboardingProps) {
  const prefersReducedMotion = useReducedMotion();
  const [step, setStep] = useState<"welcome" | "signup">("welcome");
  const [name, setName] = useState(
    initialProfile.name === "Mutale" ? "" : initialProfile.name
  );
  const [school, setSchool] = useState(initialProfile.school ?? "");
  const [grade, setGrade] = useState<GradeLevel>(initialProfile.grade);
  const [province, setProvince] = useState(initialProfile.province);
  const [languageAid, setLanguageAid] = useState<LanguageAid>(
    initialProfile.languageAid
  );
  const [pace, setPace] = useState<LearningPace>(initialProfile.pace);
  const [tutorId, setTutorId] = useState<string>(
    initialProfile.grade === "A-Level" ? "kaluba" : "chanda"
  );
  const [nameError, setNameError] = useState<string | null>(null);
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const visibleSignupTutors =
    grade === "A-Level" ? A_LEVEL_TUTORS : ECZ_SCHOOL_TUTORS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setNameError("Please enter your first name so your tutor knows who to greet.");
      return;
    }
    setNameError(null);
    onComplete(
      {
        name: cleanName,
        school: school.trim() || undefined,
        grade,
        province,
        languageAid,
        pace,
      },
      tutorId
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Minimal Top Bar */}
      <header className="bg-white/95 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
              <img
                src={appLogoImg}
                alt="Kasukulu Study Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
              Kasukulu
            </span>
          </div>
          <div className="flex items-center gap-3">
            <PWAInstallButton />
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold tracking-wide uppercase hidden sm:inline">
              100% Free Public Access
            </span>
            <span className="hidden md:inline text-xs text-slate-500 whitespace-nowrap shrink-0">
              No Billing Required
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-14">
        {step === "welcome" ? (
          <motion.div
            key="welcome-stage"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-6xl space-y-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
                <div className="text-xs font-medium text-emerald-800">
                  Grade 7
                  <span aria-hidden="true"> · </span>
                  Grade 9
                  <span aria-hidden="true"> · </span>
                  Grade 12
                  <span aria-hidden="true"> · </span>
                  English, Bemba, Nyanja, Tonga & Lozi
                </div>

                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1] text-balance">
                  Welcome to Kasukulu — study aloud with patient Zambian AI tutors
                </h1>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                  Have calm, live phone calls with subject tutors who explain one
                  step at a time, show writings on your phone, and wait until
                  you understand — so with Kasukulu, you enter your ECZ exams
                  ready to pass with flying colors.
                </p>

                {/* Hero Welcome Button */}
                <div className="pt-1 flex flex-wrap items-center gap-5">
                  <button
                    type="button"
                    onClick={() => setStep("signup")}
                    className="group relative inline-flex items-center gap-3.5 px-7 py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white text-base font-semibold shadow-lg shadow-emerald-900/15 ring-2 ring-emerald-700/20 ring-offset-2 ring-offset-slate-50 transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Sparkles
                      className="w-5 h-5 text-amber-300 shrink-0"
                      aria-hidden="true"
                    />
                    <span>Welcome — Set Up Your Study Profile</span>
                    <ArrowRight
                      className="w-5 h-5 shrink-0 transition-transform duration-150 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </button>

                  <span className="text-xs text-slate-500">
                    First-time setup takes 20 seconds
                  </span>
                </div>

                {/* Quiet Proof Strip */}
                <div className="pt-4 border-t border-slate-200 grid grid-cols-3 gap-4 max-w-xl">
                  <div>
                    <div className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                      04
                    </div>
                    <div className="text-xs text-slate-600">
                      Zambian Voice Tutors
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-lg font-bold text-emerald-800 tabular-nums">
                      ECZ
                    </div>
                    <div className="text-xs text-slate-600">
                      Past Papers & Pad
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-lg font-bold text-amber-700 tabular-nums">
                      05
                    </div>
                    <div className="text-xs text-slate-600">
                      Zambian Languages
                    </div>
                  </div>
                </div>
              </div>

              {/* Editorial Photography Showcase */}
              <div className="lg:col-span-5">
                <div className="relative h-full min-h-[280px] sm:min-h-[340px] rounded-3xl overflow-hidden border border-slate-200 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 shadow-sm">
                  {!heroImgFailed && (
                    <img
                      src={heroStudyImg}
                      alt="Zambian secondary school student studying mathematics with headphones and notebook"
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgFailed(true)}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white space-y-1.5">
                    <div className="text-xs font-medium text-emerald-300">
                      Built for Zambia · Grades 7, 9 & 12
                    </div>
                    <p className="text-sm font-medium leading-snug text-slate-100">
                      Listen, write out your steps on the study pad, and revise
                      ECZ past papers until every concept clicks.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Zambian Tutor Introductions */}
            <section aria-label="Meet your tutors" className="space-y-4">
              <div className="text-xs font-semibold text-slate-600">
                Your Personalized Voice Tutors
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {ECZ_SCHOOL_TUTORS.map((tutor) => (
                  <div
                    key={tutor.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 hover:border-emerald-600/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <TutorPortrait
                        tutorId={tutor.id}
                        name={tutor.name}
                        sizeClass="w-12 h-12"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {tutor.name}
                        </div>
                        <div className="text-xs text-emerald-800 truncate">
                          {tutor.subjectFocus}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {tutor.zambianContext}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="signup-stage"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl"
          >
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8 space-y-6"
            >
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setStep("welcome")}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Welcome
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Create your first-time learner profile
                </h1>
                <p className="text-sm text-slate-600">
                  Tell your tutors your grade and preferred language so every
                  phone call and blackboard note helps you master each topic and
                  pass with flying colors.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-sm font-medium text-slate-700 mb-1.5">
                    Your First Name
                  </span>
                  <input
                    type="text"
                    autoFocus
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (nameError) setNameError(null);
                    }}
                    placeholder="e.g. Chileshe"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  {nameError && (
                    <span className="mt-1 block text-xs text-red-700">
                      {nameError}
                    </span>
                  )}
                </label>

                <label className="block">
                  <span className="block text-sm font-medium text-slate-700 mb-1.5">
                    School or Town (optional)
                  </span>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="e.g. Kabulonga, Lusaka"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-sm font-medium text-slate-700 mb-1.5">
                    ECZ Grade Level
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                    {GRADES.map((g) => {
                      const active = grade === g;
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => {
                            setGrade(g);
                            if (g === "A-Level") {
                              if (!A_LEVEL_TUTORS.some((t) => t.id === tutorId)) {
                                setTutorId(A_LEVEL_TUTORS[0].id);
                              }
                            } else if (
                              !ECZ_SCHOOL_TUTORS.some((t) => t.id === tutorId)
                            ) {
                              setTutorId(ECZ_SCHOOL_TUTORS[0].id);
                            }
                          }}
                          className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                            active
                              ? "bg-white text-slate-900 shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="block">
                  <span className="block text-sm font-medium text-slate-700 mb-1.5">
                    Province
                  </span>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {ZAMBIAN_PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div>
                <span className="block text-sm font-medium text-slate-700 mb-2">
                  All Zambian Subjects Covered ({grade})
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  {ZAMBIAN_SUBJECTS_BY_GRADE[grade]?.map((subject) => (
                    <span
                      key={subject}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 shadow-2xs"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-sm font-medium text-slate-700 mb-2">
                  Language Support
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {LANGUAGES.map((lang) => {
                    const active = languageAid === lang;
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setLanguageAid(lang)}
                        className={`py-2 px-3 rounded-xl border text-xs font-medium text-left transition-colors ${
                          active
                            ? "border-emerald-700 bg-emerald-50 text-emerald-950"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="block text-sm font-medium text-slate-700 mb-2">
                  How Should Your Tutor Pace Lessons?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {PACES.map((item) => {
                    const active = pace === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setPace(item.value)}
                        className={`rounded-xl border p-3 text-left transition-colors ${
                          active
                            ? "border-emerald-700 bg-emerald-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="text-xs font-semibold text-slate-900">
                          {item.value}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1 leading-snug">
                          {item.detail}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="block text-sm font-medium text-slate-700 mb-2">
                  {grade === "A-Level"
                    ? "Choose Your A-Level Specialist Tutor"
                    : "Choose Your First Tutor"}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {visibleSignupTutors.map((tutor) => {
                    const active = tutorId === tutor.id;
                    return (
                      <button
                        key={tutor.id}
                        type="button"
                        onClick={() => setTutorId(tutor.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                          active
                            ? "border-emerald-700 bg-emerald-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <TutorPortrait
                          tutorId={tutor.id}
                          name={tutor.name}
                          sizeClass="w-10 h-10"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate">
                            {tutor.name}
                          </div>
                          <div className="text-[11px] text-slate-600 truncate">
                            {tutor.subjectFocus}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold shadow-sm transition-colors whitespace-nowrap min-h-[48px] cursor-pointer"
                >
                  <span>Enter Study Studio</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </main>
    </div>
  );
}
