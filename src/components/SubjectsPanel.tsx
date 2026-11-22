import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Search } from "lucide-react";
import {
  ECZ_TOPICS,
  ZAMBIAN_SUBJECTS_BY_GRADE,
  type GradeLevel,
  type SyllabusTopic,
} from "../data/curriculum";

interface SubjectsPanelProps {
  defaultGrade: GradeLevel;
  activeTopicId?: string | null;
  onSelectTopic: (topic: SyllabusTopic) => void;
  onStartCustomSubjectTopic: (
    subject: string,
    grade: GradeLevel,
    customTopicTitle: string
  ) => void;
}

const GRADE_OPTIONS: Array<"All" | GradeLevel> = [
  "All",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
  "A-Level",
];

function normalizeGradeSubjectName(raw: string): string {
  if (raw.startsWith("Zambian Languages")) return "Zambian Languages";
  if (raw === "Chemistry / Science") return "Chemistry";
  return raw;
}

function getCanonicalTopicSubject(topic: SyllabusTopic): string {
  if (topic.grade === "A-Level") {
    if (
      topic.subject === "Pure Mathematics" ||
      topic.subject === "Mathematics (Mechanics)"
    ) {
      return "A-Level Mathematics (9709)";
    }
    if (topic.subject === "Further Mathematics") {
      return "A-Level Further Mathematics (9231)";
    }
    if (topic.subject === "Chemistry") {
      return "A-Level Chemistry (9701)";
    }
    if (topic.subject === "Physics") {
      return "A-Level Physics (9702)";
    }
    if (topic.subject === "Biology") {
      return "A-Level Biology (9700)";
    }
    if (topic.subject === "Economics") {
      return "A-Level Economics (9708)";
    }
    if (topic.subject === "Accounting") {
      return "A-Level Accounting (9706)";
    }
    if (topic.subject === "Computer Science") {
      return "A-Level Computer Science (9618)";
    }
  }
  return normalizeGradeSubjectName(topic.subject);
}

interface SubjectEntry {
  name: string;
  topics: SyllabusTopic[];
  grades: GradeLevel[];
  hasExactGradeMatch: boolean;
}

function matchesSearch(topic: SyllabusTopic, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    topic.title.toLowerCase().includes(q) ||
    topic.subject.toLowerCase().includes(q) ||
    getCanonicalTopicSubject(topic).toLowerCase().includes(q) ||
    topic.summary.toLowerCase().includes(q) ||
    topic.keyTerms.some((term) => term.toLowerCase().includes(q))
  );
}

export function SubjectsPanel({
  defaultGrade,
  activeTopicId,
  onSelectTopic,
  onStartCustomSubjectTopic,
}: SubjectsPanelProps) {
  const [gradeFilter, setGradeFilter] = useState<"All" | GradeLevel>(
    defaultGrade
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [subjectGradeSubFilter, setSubjectGradeSubFilter] = useState<
    "All" | GradeLevel
  >("All");
  const [customTopicTitle, setCustomTopicTitle] = useState("");

  const subjectEntries = useMemo<SubjectEntry[]>(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();

    if (gradeFilter === "All") {
      const grouped = new Map<string, SyllabusTopic[]>();
      for (const topic of ECZ_TOPICS) {
        const key = getCanonicalTopicSubject(topic);
        const list = grouped.get(key) ?? [];
        list.push(topic);
        grouped.set(key, list);
      }

      const entries: SubjectEntry[] = [];
      for (const [name, allTopics] of grouped.entries()) {
        const nameMatches =
          !trimmedQuery || name.toLowerCase().includes(trimmedQuery);
        const matchingTopics = nameMatches
          ? allTopics
          : allTopics.filter((t) => matchesSearch(t, trimmedQuery));

        if (matchingTopics.length === 0) continue;

        const grades = Array.from(
          new Set(allTopics.map((t) => t.grade))
        ) as GradeLevel[];

        entries.push({
          name,
          topics: matchingTopics,
          grades,
          hasExactGradeMatch: true,
        });
      }
      return entries;
    }

    const rawSubjects = ZAMBIAN_SUBJECTS_BY_GRADE[gradeFilter] ?? [];
    const seenNames = new Set<string>();
    const orderedSubjectNames: string[] = [];
    for (const raw of rawSubjects) {
      const normalized = normalizeGradeSubjectName(raw);
      if (!seenNames.has(normalized)) {
        seenNames.add(normalized);
        orderedSubjectNames.push(normalized);
      }
    }

    const entries: SubjectEntry[] = [];
    for (const subjectName of orderedSubjectNames) {
      const exactTopics = ECZ_TOPICS.filter(
        (t) =>
          t.grade === gradeFilter &&
          getCanonicalTopicSubject(t) === subjectName
      );

      const fallbackTopics =
        exactTopics.length > 0
          ? exactTopics
          : ECZ_TOPICS.filter(
              (t) =>
                (gradeFilter === "A-Level"
                  ? t.grade === "A-Level"
                  : t.grade !== "A-Level") &&
                getCanonicalTopicSubject(t) === subjectName
            );

      if (fallbackTopics.length === 0) continue;

      const nameMatches =
        !trimmedQuery || subjectName.toLowerCase().includes(trimmedQuery);
      const matchingTopics = nameMatches
        ? fallbackTopics
        : fallbackTopics.filter((t) => matchesSearch(t, trimmedQuery));

      if (matchingTopics.length === 0) continue;

      const grades = Array.from(
        new Set(fallbackTopics.map((t) => t.grade))
      ) as GradeLevel[];

      entries.push({
        name: subjectName,
        topics: matchingTopics,
        grades,
        hasExactGradeMatch: exactTopics.length > 0,
      });
    }

    return entries;
  }, [gradeFilter, searchQuery]);

  const activeSubjectEntry = useMemo(
    () => subjectEntries.find((s) => s.name === selectedSubject) ?? null,
    [selectedSubject, subjectEntries]
  );

  const visibleSubjectTopics = useMemo(() => {
    if (!activeSubjectEntry) return [];
    if (subjectGradeSubFilter === "All") {
      return activeSubjectEntry.topics;
    }
    const filtered = activeSubjectEntry.topics.filter(
      (t) => t.grade === subjectGradeSubFilter
    );
    return filtered.length > 0 ? filtered : activeSubjectEntry.topics;
  }, [activeSubjectEntry, subjectGradeSubFilter]);

  const totalVisibleTopics = useMemo(
    () => subjectEntries.reduce((sum, entry) => sum + entry.topics.length, 0),
    [subjectEntries]
  );

  const handleSelectSubject = (subjectName: string) => {
    setSelectedSubject(subjectName);
    setSubjectGradeSubFilter("All");
    setCustomTopicTitle("");
  };

  const handleGradeFilterChange = (nextGrade: "All" | GradeLevel) => {
    setGradeFilter(nextGrade);
    setSelectedSubject(null);
    setSubjectGradeSubFilter("All");
  };

  const resolveCustomTargetGrade = (): GradeLevel => {
    if (gradeFilter !== "All") return gradeFilter;
    if (
      activeSubjectEntry &&
      activeSubjectEntry.grades.includes("A-Level") &&
      activeSubjectEntry.grades.length === 1
    ) {
      return "A-Level";
    }
    if (subjectGradeSubFilter !== "All") return subjectGradeSubFilter;
    return activeSubjectEntry?.grades[0] ?? defaultGrade;
  };

  if (activeSubjectEntry) {
    const showGradeSubFilter =
      gradeFilter === "All" && activeSubjectEntry.grades.length > 1;
    const customTargetGrade = resolveCustomTargetGrade();

    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              setSelectedSubject(null);
              setSubjectGradeSubFilter("All");
              setCustomTopicTitle("");
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Subjects
          </button>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                <span>
                  {gradeFilter === "All"
                    ? activeSubjectEntry.grades.join(" · ")
                    : activeSubjectEntry.hasExactGradeMatch
                    ? gradeFilter
                    : `${gradeFilter} · Related ${activeSubjectEntry.grades.join(", ")} topics`}
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-medium text-emerald-700">
                  {visibleSubjectTopics.length}{" "}
                  {visibleSubjectTopics.length === 1 ? "topic" : "topics"}
                </span>
              </div>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                {activeSubjectEntry.name}
              </h2>
              <p className="mt-0.5 text-xs text-slate-600">
                Choose any topic below to start studying it with worked notes
                and practice questions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Filter topics in ${activeSubjectEntry.name}...`}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          {showGradeSubFilter && (
            <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200/80 rounded-xl overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setSubjectGradeSubFilter("All")}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  subjectGradeSubFilter === "All"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Grades
              </button>
              {activeSubjectEntry.grades.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSubjectGradeSubFilter(g)}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    subjectGradeSubFilter === g
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {visibleSubjectTopics.map((topic) => {
            const isActive = topic.id === activeTopicId;
            return (
              <div
                key={topic.id}
                className={`rounded-xl border p-4 flex flex-col justify-between gap-3.5 transition-colors ${
                  isActive
                    ? "border-emerald-700 bg-emerald-50/30"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">
                      {topic.grade}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{topic.keyTerms.slice(0, 3).join(" · ")}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {topic.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 truncate">
                    {isActive ? "Active topic" : "Ready for revision"}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectTopic(topic)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-emerald-700 text-white hover:bg-emerald-800"
                        : "bg-slate-900 text-white hover:bg-emerald-700"
                    }`}
                  >
                    <span>Study Topic</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom topic under this subject */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const clean = customTopicTitle.trim();
            if (!clean) return;
            onStartCustomSubjectTopic(
              activeSubjectEntry.name,
              customTargetGrade,
              clean
            );
          }}
          className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5"
        >
          <div className="text-xs font-semibold text-slate-900">
            Have a specific {activeSubjectEntry.name} topic or homework question?
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customTopicTitle}
              onChange={(e) => setCustomTopicTitle(e.target.value)}
              placeholder={`Type any topic in ${activeSubjectEntry.name} (${customTargetGrade})...`}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <button
              type="submit"
              disabled={!customTopicTitle.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Study Custom Topic</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Subjects & Syllabus Topics
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Pick a subject to view all syllabus topics inside it, then select
            any topic you want to study.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 shrink-0 tabular-nums">
          <BookOpen className="w-4 h-4" />
          {subjectEntries.length}{" "}
          {subjectEntries.length === 1 ? "subject" : "subjects"}
          <span aria-hidden="true">·</span>
          {totalVisibleTopics} {totalVisibleTopics === 1 ? "topic" : "topics"}
        </span>
      </div>

      {/* Grade Filter & Search */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200/80 rounded-xl overflow-x-auto no-scrollbar">
          {GRADE_OPTIONS.map((grade) => {
            const active = gradeFilter === grade;
            return (
              <button
                key={grade}
                type="button"
                onClick={() => handleGradeFilterChange(grade)}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? grade === "A-Level"
                      ? "bg-slate-900 text-amber-300 shadow-xs font-semibold"
                      : "bg-emerald-700 text-white shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                }`}
              >
                {grade}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any subject or topic (e.g. Mathematics, Stoichiometry, Circle Theorems, Python)..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
          />
        </div>
      </div>

      {subjectEntries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center space-y-2.5">
          <BookOpen className="w-6 h-6 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900">
            No matching subjects or topics found
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Try clearing your search or switching the grade filter to "All".
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setGradeFilter("All");
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-medium hover:bg-slate-100 transition-colors whitespace-nowrap cursor-pointer"
          >
            Show All Subjects
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {subjectEntries.map((entry) => {
            const previewTitles = entry.topics
              .slice(0, 3)
              .map((t) => t.title)
              .join(" · ");
            return (
              <button
                key={entry.name}
                type="button"
                onClick={() => handleSelectSubject(entry.name)}
                className="group text-left rounded-xl border border-slate-200 bg-white p-4 hover:border-emerald-700 hover:shadow-xs transition-all duration-150 flex flex-col justify-between gap-3 cursor-pointer"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                    <span>
                      {gradeFilter === "All"
                        ? entry.grades.length > 2
                          ? `${entry.grades[0]} – ${entry.grades[entry.grades.length - 1]}`
                          : entry.grades.join(" · ")
                        : gradeFilter}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-emerald-700 tabular-nums">
                      {entry.topics.length}{" "}
                      {entry.topics.length === 1 ? "topic" : "topics"}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {entry.name}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {previewTitles}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 group-hover:text-emerald-900">
                  <span>Choose Topic</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
