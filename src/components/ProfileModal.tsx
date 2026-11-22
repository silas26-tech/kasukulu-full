import { X } from "lucide-react";
import {
  type GradeLevel,
  type LanguageAid,
  type LearnerProfile,
  type LearningPace,
  ZAMBIAN_PROVINCES,
  ZAMBIAN_SUBJECTS_BY_GRADE,
} from "../data/curriculum";

interface ProfileModalProps {
  open: boolean;
  profile: LearnerProfile;
  onChange: (next: LearnerProfile) => void;
  onClose: () => void;
  onSwitchLearner?: () => void;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
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
    detail: "Calm pace with frequent checks for understanding",
  },
  {
    value: "Exam Revision",
    detail: "ECZ marking-scheme tips, units, and past-paper precision",
  },
  {
    value: "Challenge Me",
    detail: "Prompted problem solving before revealing full solutions",
  },
];

export function ProfileModal({
  open,
  profile,
  onChange,
  onClose,
  onSwitchLearner,
  isAdmin = false,
  onOpenAdmin,
}: ProfileModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-xl p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="profile-modal-title"
              className="text-xl font-semibold text-slate-900"
            >
              Personalize Your Study Profile
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Your AI voice tutors adapt explanations, local examples, and ECZ
              depth to these preferences.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Close profile dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">
                First Name
              </span>
              <input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  onChange({ ...profile, name: e.target.value })
                }
                placeholder="e.g. Mutale"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </label>

            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">
                Province
              </span>
              <select
                value={profile.province}
                onChange={(e) =>
                  onChange({ ...profile, province: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
              ECZ Grade Level
            </span>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
              {GRADES.map((grade) => {
                const active = profile.grade === grade;
                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => onChange({ ...profile, grade })}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      active
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {grade}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="block text-sm font-medium text-slate-700 mb-2">
              All Zambian Subjects Available ({profile.grade})
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              {ZAMBIAN_SUBJECTS_BY_GRADE[profile.grade]?.map((subject) => (
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
                const active = profile.languageAid === lang;
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => onChange({ ...profile, languageAid: lang })}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium text-left transition-colors ${
                      active
                        ? "border-emerald-700 bg-emerald-50 text-emerald-900"
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
              Tutoring Pace
            </span>
            <div className="space-y-2">
              {PACES.map((item) => {
                const active = profile.pace === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => onChange({ ...profile, pace: item.value })}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                      active
                        ? "border-emerald-700 bg-emerald-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="text-sm font-semibold text-slate-900">
                      {item.value}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {item.detail}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3">
            {onSwitchLearner && (
              <button
                type="button"
                onClick={onSwitchLearner}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer"
              >
                Switch Learner Profile
              </button>
            )}
            {onOpenAdmin && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
                className="text-xs text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                {isAdmin ? "Admin Console" : "Staff Portal"}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
