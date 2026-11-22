import React from 'react';
import {
  getBiologyTopicsForLearner,
  normalizeBiologyForm,
} from '../data/biologyFormSyllabus';

interface BiologyTopicsForFormProps {
  learnerGradeOrForm: string;
  onSelectTopic: (topicTitle: string, formLabel: string) => void;
}

export const BiologyTopicsForForm: React.FC<BiologyTopicsForFormProps> = ({
  learnerGradeOrForm,
  onSelectTopic,
}) => {
  const activeForm = normalizeBiologyForm(learnerGradeOrForm);
  const topics = getBiologyTopicsForLearner(activeForm);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">
          Biology Syllabus — {activeForm}
        </h3>
        <span className="text-xs opacity-75">{topics.length} topics</span>
      </div>

      <div className="space-y-2">
        {topics.map((topic) => (
          <button
            key={topic.id}
            type="button"
            onClick={() => onSelectTopic(topic.title, activeForm)}
            className="w-full text-left rounded-xl border p-3 hover:opacity-90 transition"
          >
            <div className="text-xs opacity-70">{topic.unit}</div>
            <div className="font-medium">{topic.title}</div>
            <p className="text-xs opacity-80 mt-1">{topic.summary}</p>
          </button>
        ))}
      </div>
    </section>
  );
};
