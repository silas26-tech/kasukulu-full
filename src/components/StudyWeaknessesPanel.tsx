import { useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Filter,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import type { WeaknessItem, TutorPersona } from "../data/curriculum";

interface StudyWeaknessesPanelProps {
  weaknesses: WeaknessItem[];
  tutor: TutorPersona;
  onAskTutorAboutWeakness: (item: WeaknessItem) => void;
  onRemoveWeakness: (id: string) => void;
  onClearAllWeaknesses: () => void;
  onAddCustomWeakness?: (
    title: string,
    subject: string,
    prompt?: string,
    explanation?: string
  ) => void;
}

const COMMON_SUBJECTS = [
  "Mathematics",
  "Integrated Science",
  "Biology",
  "Chemistry",
  "Physics",
  "English Language",
  "Civic Education",
  "Computer Studies / ICT",
  "Principles of Accounts",
  "Geography",
  "Agricultural Science",
  "A-Level Pure Math",
  "A-Level Chemistry",
  "A-Level Physics",
  "A-Level Biology",
];

export function StudyWeaknessesPanel({
  weaknesses,
  tutor,
  onAskTutorAboutWeakness,
  onRemoveWeakness,
  onClearAllWeaknesses,
  onAddCustomWeakness,
}: StudyWeaknessesPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState(tutor.subjectFocus.split(",")[0].trim() || "Mathematics");
  const [newNotes, setNewNotes] = useState("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("All");

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    if (onAddCustomWeakness) {
      onAddCustomWeakness(
        newTitle.trim(),
        newSubject,
        newNotes.trim() || `Focusing on ${newTitle.trim()} fundamentals.`,
        "Student flagged this concept for 1-on-1 step-by-step master coaching."
      );
    }
    setNewTitle("");
    setNewNotes("");
    setShowAddForm(false);
  };

  const availableSubjects = Array.from(new Set(weaknesses.map((w) => w.subject)));

  const filteredWeaknesses =
    selectedSubjectFilter === "All"
      ? weaknesses
      : weaknesses.filter((w) => w.subject === selectedSubjectFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Targeted Revision Hub</span>
          </div>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            My Weaknesses ({weaknesses.length})
          </h2>
          <p className="mt-1 text-xs text-slate-600 max-w-xl">
            Concepts you missed in quizzes, tricky past paper questions, or topics you flagged are saved here automatically. Practice each one step-by-step with {tutor.name}.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onAddCustomWeakness && (
            <button
              type="button"
              onClick={() => setShowAddForm((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Flag Weak Area</span>
            </button>
          )}

          {weaknesses.length > 0 && (
            <button
              type="button"
              onClick={onClearAllWeaknesses}
              className="text-xs font-medium text-slate-500 hover:text-red-700 transition-colors whitespace-nowrap px-2 py-1.5 cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {showAddForm && onAddCustomWeakness && (
        <form
          onSubmit={handleSubmitCustom}
          className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900">
              Record a Topic You Struggle With
            </span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">
                Topic or Rule Name *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Simultaneous Equations by Elimination"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">
                Subject
              </label>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {COMMON_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700">
              Specific note or question (Optional)
            </label>
            <input
              type="text"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="e.g. I get confused with negative signs when subtracting equations"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-700 text-xs font-semibold text-white hover:bg-emerald-800"
            >
              Save to Weaknesses
            </button>
          </div>
        </form>
      )}

      {availableSubjects.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            type="button"
            onClick={() => setSelectedSubjectFilter("All")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              selectedSubjectFilter === "All"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Subjects ({weaknesses.length})
          </button>
          {availableSubjects.map((s) => {
            const count = weaknesses.filter((w) => w.subject === s).length;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSubjectFilter(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  selectedSubjectFilter === s
                    ? "bg-emerald-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s} ({count})
              </button>
            );
          })}
        </div>
      )}

      {weaknesses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="text-sm font-semibold text-slate-900">
            No weaknesses recorded yet!
          </div>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            When you attempt practice quizzes or past papers, any tricky questions are automatically saved here so you can review and master them step-by-step. You can also tap &quot;Flag Weak Area&quot; above to add any concept.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWeaknesses.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs hover:border-amber-400 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono">{item.grade}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-slate-700">{item.subject}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[11px] text-slate-400">{item.addedAt}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveWeakness(item.id)}
                  className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="Mark as Mastered / Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-sm font-semibold text-slate-900 leading-snug">
                {item.title}
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/60 font-mono">
                {item.prompt}
              </p>

              {item.explanation && (
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-900">Explanation:</strong> {item.explanation}
                </p>
              )}

              <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onAskTutorAboutWeakness(item)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Work on this with {tutor.name}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
