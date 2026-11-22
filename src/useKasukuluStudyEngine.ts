import React, { useEffect, useState } from 'react';
import {
  buildTutorVoicePrompt,
  getRecommendedTutorForSubject,
  MistakeItem,
} from './data/curriculum';
import { StreakAndMistakesPanel } from './components/StreakAndMistakesPanel';

const MISTAKES_STORAGE_KEY = 'kasukulu_mistake_bank_v1';

export interface ActiveVoiceSession {
  tutorName: string;
  subject: string;
  topic: string;
  prompt: string;
  autoSpeak: boolean;
}

export function useKasukuluStudyEngine(streakDays: number) {
  const [mistakes, setMistakes] = useState<MistakeItem[]>(() => {
    try {
      const saved = localStorage.getItem(MISTAKES_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as MistakeItem[]) : [];
    } catch {
      return [];
    }
  });

  const [activeVoiceSession, setActiveVoiceSession] =
    useState<ActiveVoiceSession | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(mistakes));
    } catch {
      // Ignore storage quota errors
    }
  }, [mistakes]);

  const recordMistake = (entry: Omit<MistakeItem, 'id' | 'tutorName'>) => {
    const tutorName = getRecommendedTutorForSubject(entry.subject);
    const newItem: MistakeItem = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      tutorName,
    };
    setMistakes((prev) => [newItem, ...prev]);
  };

  const clearMistake = (id: string) => {
    setMistakes((prev) => prev.filter((item) => item.id !== id));
  };

  const startTutorVoiceSession = (
    tutorName: string,
    subject: string,
    topic: string,
    mistake?: MistakeItem
  ) => {
    const resolvedTutor = tutorName || getRecommendedTutorForSubject(subject);
    const prompt = buildTutorVoicePrompt({
      tutorName: resolvedTutor,
      subject,
      topic,
      mistake,
      streakDays,
    });

    setActiveVoiceSession({
      tutorName: resolvedTutor,
      subject,
      topic,
      prompt,
      autoSpeak: true,
    });
  };

  return {
    mistakes,
    recordMistake,
    clearMistake,
    activeVoiceSession,
    startTutorVoiceSession,
  };
}
