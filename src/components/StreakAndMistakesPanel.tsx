import React from 'react';
import {
  getStreakMilestones,
  getRecommendedTutorForSubject,
  MistakeItem,
} from '../data/curriculum';

interface StreakAndMistakesPanelProps {
  streakDays: number;
  mistakes: MistakeItem[];
  onStartTutorWithTopic: (tutorName: string, subject: string, topic: string) => void;
}

export const StreakAndMistakesPanel: React.FC<StreakAndMistakesPanelProps> = ({
  streakDays,
  mistakes,
  onStartTutorWithTopic,
}) => {
  const milestones = getStreakMilestones(streakDays);
  const nextMilestone = milestones.find((m) => !m.unlocked);
  const topMistake = mistakes[0];
  const recommendedTutor = topMistake
    ? topMistake.tutorName || getRecommendedTutorForSubject(topMistake.subject)
    : 'Madam Chanda';

  return (
    <section className="space-y-4 my-6">
      {/* Streak Milestones */}
      <div className="rounded-2xl border border-amber-500/25 bg-amber-950/20 p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-amber-300 font-semibold">
              Streak Milestones
            </p>
            <h3 className="text-base font-semibold text-white">
              {nextMilestone
                ? `${Math.max(nextMilestone.days - streakDays, 0)} more day(s) to unlock ${nextMilestone.label}`
                : 'All streak milestones unlocked!'}
            </h3>
          </div>
          <span className="text-sm font-bold text-amber-300">
            {streakDays}d active
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {milestones.map((badge) => (
            <div
              key={badge.days}
              className={`px-3 py-1.5 rounded-full text-xs border ${
                badge.unlocked
                  ? 'bg-amber-400/20 border-amber-400 text-amber-200 font-medium'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
              title={badge.reward}
            >
              {badge.unlocked ? '🏅' : '🔒'} {badge.label} ({badge.days}d)
            </div>
          ))}
        </div>
      </div>

      {/* Mistake Bank / Weak-Topic Revision */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-base font-semibold text-white">
            Mistake Bank ({mistakes.length} to review)
          </h3>
          {topMistake && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300">
              {topMistake.subject}
            </span>
          )}
        </div>

        {topMistake ? (
          <div className="space-y-2">
            <p className="text-sm text-slate-200">
              <strong className="text-white">{topMistake.topic}:</strong>{' '}
              {topMistake.question}
            </p>
            <p className="text-xs text-slate-400">
              Your answer: <span className="text-rose-300">{topMistake.yourAnswer}</span>{' '}
              · Correct: <span className="text-emerald-300">{topMistake.correctAnswer}</span>
            </p>
            {topMistake.markingNote && (
              <p className="text-xs text-amber-200/90">
                ECZ Marking Note: {topMistake.markingNote}
              </p>
            )}
            <button
              type="button"
              onClick={() =>
                onStartTutorWithTopic(
                  recommendedTutor,
                  topMistake.subject,
                  topMistake.topic
                )
              }
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition cursor-pointer"
            >
              Ask {recommendedTutor} to explain this step-by-step →
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            No missed questions logged yet. Any question you miss in ECZ Practice Quizzes or Past Papers will appear here for targeted revision.
          </p>
        )}
      </div>
    </section>
  );
};
