import { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Camera,
  FileText,
  GraduationCap,
  Home,
  Loader2,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Square,
  Trophy,
  Volume2,
} from "lucide-react";
import {
  A_LEVEL_TOPICS,
  A_LEVEL_TUTORS,
  ECZ_SCHOOL_TOPICS,
  ECZ_SCHOOL_TUTORS,
  ECZ_TOPICS,
  TUTORS,
  getLocalDateKey,
  type BlackboardNote,
  type GradeLevel,
  type LearnerProfile,
  type QuizQuestion,
  type StudyProgress,
  type SyllabusTopic,
  type TranscriptEntry,
  type TutorPersona,
  type WeaknessItem,
} from "./data/curriculum";
import {
  computeRmsLevel,
  downsampleTo16kHz,
  float32ToPcm16Base64,
  pcm24kBase64ToAudioBuffer,
  playWavBase64,
} from "./utils/audioUtils";
import { TutorPortrait } from "./components/TutorPortrait";
import { VoiceWaveform } from "./components/VoiceWaveform";
import { ProfileModal } from "./components/ProfileModal";
import { WelcomeOnboarding } from "./components/WelcomeOnboarding";
import { HomeHub, type HomeDestination } from "./components/HomeHub";
import { PastPapersPanel } from "./components/PastPapersPanel";
import { SubjectsPanel } from "./components/SubjectsPanel";
import { CompetitionDashboard } from "./components/CompetitionDashboard";
import { ALevelWing } from "./components/ALevelWing";
import { AdminDashboard } from "./components/AdminDashboard";
import {
  RightStudyPanel,
  type StudyTab,
} from "./components/RightStudyPanel";
import {
  STUDY_TRACKS,
  StudyMusicEngine,
  type StudyTrackId,
} from "./utils/studyMusicEngine";
import { StudyMusicBar } from "./components/StudyMusicBar";
import { StudyCalendarView } from "./components/StudyCalendarView";
import { SnapModal, type SnapData } from "./components/SnapModal";
import {
  loadStudyCalendar,
  STUDY_CALENDAR_STORAGE_KEY,
  type ExamDateEntry,
  type StudyCalendarState,
  type StudyTimetableSlot,
} from "./data/studyCalendar";
import appLogoImg from "./assets/images/app_logo_kasukulu_1794875593858.jpg";
import type { User } from "firebase/auth";
import { signOutLearner, subscribeToAuth } from "./firebase";
import { checkAdminSession, isUserAdmin, setAdminSession } from "./utils/adminAuth";

const PROFILE_STORAGE_KEY = "lubuto_learner_profile_v1";
const PROGRESS_STORAGE_KEY = "lubuto_study_progress_v1";
const ONBOARDED_STORAGE_KEY = "kasukulu_onboarded_v1";
const STUDY_MUSIC_STORAGE_KEY = "kasukulu_study_music_v1";

interface StudyMusicPrefs {
  enabled: boolean;
  trackId: StudyTrackId;
  volume: number;
}

function loadStudyMusicPrefs(): StudyMusicPrefs {
  try {
    const raw = localStorage.getItem(STUDY_MUSIC_STORAGE_KEY);
    if (!raw) {
      return { enabled: true, trackId: "victoria-dawn", volume: 0.35 };
    }
    const parsed = JSON.parse(raw) as Partial<StudyMusicPrefs>;
    const validTrack: StudyTrackId =
      STUDY_TRACKS.some((t) => t.id === parsed.trackId)
        ? (parsed.trackId as StudyTrackId)
        : "victoria-dawn";
    return {
      enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : true,
      trackId: validTrack,
      volume:
        typeof parsed.volume === "number"
          ? Math.max(0, Math.min(1, parsed.volume))
          : 0.35,
    };
  } catch {
    return { enabled: true, trackId: "victoria-dawn", volume: 0.35 };
  }
}

const DEFAULT_PROFILE: LearnerProfile = {
  name: "Mutale",
  grade: "Grade 12",
  languageAid: "English + Bemba",
  pace: "Step-by-step",
  province: "Lusaka",
};

const DEFAULT_PROGRESS: StudyProgress = {
  sessionsCompleted: 0,
  quizAnswered: 0,
  quizCorrect: 0,
  topicsStudied: [],
  savedNotes: [],
  weaknesses: [],
  dailyActivity: {},
};

type VoiceMode = "live" | "turn";
type CallStatus = "idle" | "connecting" | "connected" | "error";
type TurnState =
  | "idle"
  | "tutor_speaking"
  | "waiting_for_learner"
  | "learner_speaking"
  | "tutor_thinking"
  | "paused";

function formatCallDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function loadProfile(): LearnerProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function loadProgress(): StudyProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = { ...DEFAULT_PROGRESS, ...JSON.parse(raw) } as StudyProgress;
    if (!parsed.dailyActivity) {
      parsed.dailyActivity = {};
    }
    if (
      Object.keys(parsed.dailyActivity).length === 0 &&
      (parsed.sessionsCompleted > 0 || parsed.quizAnswered > 0)
    ) {
      const today = getLocalDateKey();
      parsed.dailyActivity[today] = {
        date: today,
        sessions: parsed.sessionsCompleted,
        quizAnswered: parsed.quizAnswered,
        quizCorrect: parsed.quizCorrect,
      };
    }
    return parsed;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function nowTimeLabel(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function App() {
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ONBOARDED_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [isReturningLearner, setIsReturningLearner] = useState<boolean>(hasOnboarded);
  const [profile, setProfile] = useState<LearnerProfile>(loadProfile);
  const [progress, setProgress] = useState<StudyProgress>(loadProgress);
  const [profileOpen, setProfileOpen] = useState(false);

  const [appView, setAppView] = useState<
    | "home"
    | "studio"
    | "subjects"
    | "papers"
    | "competitions"
    | "calendar"
    | "alevel"
    | "admin"
  >(() => (loadProfile().grade === "A-Level" ? "alevel" : "home"));

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => checkAdminSession());

  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      setFirebaseUser(user);
      if (isUserAdmin(user)) {
        setIsAdmin(true);
        setAdminSession(true);
      } else if (!checkAdminSession()) {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  const handleAdminSignOut = async () => {
    setAdminSession(false);
    setIsAdmin(false);
    await signOutLearner();
    navigateAppView("home");
  };

  const [selectedTutorId, setSelectedTutorId] = useState<string>(() =>
    loadProfile().grade === "A-Level" ? A_LEVEL_TUTORS[0].id : ECZ_SCHOOL_TUTORS[0].id
  );
  const activeTutor: TutorPersona =
    appView === "alevel"
      ? A_LEVEL_TUTORS.find((t) => t.id === selectedTutorId) ?? A_LEVEL_TUTORS[0]
      : ECZ_SCHOOL_TUTORS.find((t) => t.id === selectedTutorId) ??
        ECZ_SCHOOL_TUTORS[0];

  const effectiveProfile: LearnerProfile =
    appView === "alevel"
      ? { ...profile, grade: "A-Level" }
      : profile.grade === "A-Level"
      ? { ...profile, grade: "Grade 12" }
      : profile;

  const [activeTopic, setActiveTopic] = useState<SyllabusTopic | null>(() => {
    const initialGrade = loadProfile().grade;
    if (initialGrade === "A-Level") {
      return A_LEVEL_TOPICS[0] ?? null;
    }
    return (
      ECZ_SCHOOL_TOPICS.find((t) => t.grade === initialGrade) ??
      ECZ_SCHOOL_TOPICS[0] ??
      null
    );
  });
  const [customTopic, setCustomTopic] = useState("");
  const [studyCalendar, setStudyCalendar] =
    useState<StudyCalendarState>(loadStudyCalendar);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("live");
  const [rightTab, setRightTab] = useState<StudyTab>("blackboard");

  // Live Call state
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [callError, setCallError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [turnState, setTurnState] = useState<TurnState>("idle");
  const [activeSpeaker, setActiveSpeaker] = useState<
    "idle" | "learner" | "tutor"
  >("idle");
  const [audioLevel, setAudioLevel] = useState(0);

  // Transcript & Turn-based state
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [textInput, setTextInput] = useState("");
  const [isSendingTurn, setIsSendingTurn] = useState(false);
  const [isRecordingClip, setIsRecordingClip] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // TTS playback state
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  // Studying music state (auto-pauses during live voice class)
  const [musicPrefs, setMusicPrefs] = useState<StudyMusicPrefs>(
    loadStudyMusicPrefs
  );
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const studyMusicEngineRef = useRef<StudyMusicEngine | null>(null);

  // Blackboard & Quiz state
  const [blackboard, setBlackboard] = useState<BlackboardNote | null>(null);
  const [blackboardLoading, setBlackboardLoading] = useState(false);
  const [blackboardError, setBlackboardError] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Snap & Screenshot state
  const [snapModalOpen, setSnapModalOpen] = useState(false);
  const [isSendingSnap, setIsSendingSnap] = useState(false);

  // Refs for Live WebSocket & Web Audio
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const isMutedRef = useRef<boolean>(false);
  const serverTurnCompleteRef = useRef<boolean>(false);
  const learnerSilenceTimerRef = useRef<number | null>(null);
  const liveTurnSealedRef = useRef<{ learner: boolean; tutor: boolean }>({
    learner: false,
    tutor: false,
  });
  const studyPanelRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const countedTurnSessionRef = useRef<boolean>(false);

  const recordSessionCompleted = useCallback(() => {
    const today = getLocalDateKey();
    setProgress((prev) => {
      const existing = prev.dailyActivity?.[today] ?? {
        date: today,
        sessions: 0,
        quizAnswered: 0,
        quizCorrect: 0,
      };
      return {
        ...prev,
        sessionsCompleted: prev.sessionsCompleted + 1,
        dailyActivity: {
          ...prev.dailyActivity,
          [today]: {
            ...existing,
            sessions: existing.sessions + 1,
          },
        },
      };
    });
  }, []);

  useEffect(() => {
    window.__KASUKULU_MOUNTED__ = true;
  }, []);

  // Persist profile and progress
  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore storage errors on restricted mobile browsers
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore storage errors on restricted mobile browsers
    }
  }, [progress]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STUDY_CALENDAR_STORAGE_KEY,
        JSON.stringify(studyCalendar)
      );
    } catch {
      // ignore storage errors
    }
  }, [studyCalendar]);

  const handleAddTimetableSlots = useCallback(
    (slots: Omit<StudyTimetableSlot, "id">[]) => {
      setStudyCalendar((prev) => ({
        ...prev,
        timetable: [
          ...prev.timetable,
          ...slots.map((slot, idx) => ({
            ...slot,
            id: `slot-${Date.now()}-${idx}-${Math.random()
              .toString(36)
              .slice(2, 6)}`,
          })),
        ],
      }));
    },
    []
  );

  const handleDeleteTimetableSlot = useCallback((slotId: string) => {
    setStudyCalendar((prev) => ({
      ...prev,
      timetable: prev.timetable.filter((s) => s.id !== slotId),
    }));
  }, []);

  const handleToggleSlotCompleted = useCallback(
    (dateKey: string, slotId: string) => {
      setStudyCalendar((prev) => {
        const current = prev.completedSlotDates[dateKey] ?? [];
        const exists = current.includes(slotId);
        const nextList = exists
          ? current.filter((id) => id !== slotId)
          : [...current, slotId];
        return {
          ...prev,
          completedSlotDates: {
            ...prev.completedSlotDates,
            [dateKey]: nextList,
          },
        };
      });
    },
    []
  );

  const handleAddExam = useCallback((exam: Omit<ExamDateEntry, "id">) => {
    setStudyCalendar((prev) => ({
      ...prev,
      exams: [
        ...prev.exams,
        {
          ...exam,
          id: `exam-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        },
      ],
    }));
  }, []);

  const handleDeleteExam = useCallback((examId: string) => {
    setStudyCalendar((prev) => ({
      ...prev,
      exams: prev.exams.filter((ex) => ex.id !== examId),
    }));
  }, []);

  useEffect(() => {
    isMutedRef.current = isMuted;
    if (callStatus === "connected") {
      if (isMuted) {
        setTurnState("paused");
        setActiveSpeaker("idle");
      } else if (activeSourcesRef.current.size > 0) {
        setTurnState("tutor_speaking");
      } else {
        setTurnState("waiting_for_learner");
      }
    }
  }, [isMuted, callStatus]);

  useEffect(() => {
    if (callStatus !== "connected") {
      setCallSeconds(0);
      return;
    }
    const interval = window.setInterval(() => {
      setCallSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [callStatus]);

  const stopTtsPlayback = useCallback(() => {
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current = null;
    }
    setSpeakingId(null);
  }, []);

  const handleSpeakText = useCallback(
    async (text: string, id: string) => {
      if (speakingId === id) {
        stopTtsPlayback();
        return;
      }
      stopTtsPlayback();
      setSpeakingId(id);
      try {
        const res = await fetch("/api/tutor/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, tutorId: activeTutor.id }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Unable to synthesize speech.");
        }
        const audio = playWavBase64(data.audioBase64, () => {
          setSpeakingId(null);
          ttsAudioRef.current = null;
        });
        ttsAudioRef.current = audio;
      } catch (err) {
        setSpeakingId(null);
        setCallError(
          err instanceof Error ? err.message : "Voice playback failed."
        );
      }
    },
    [activeTutor.id, speakingId, stopTtsPlayback]
  );

  const clearQueuedOutputAudio = useCallback(() => {
    for (const src of activeSourcesRef.current) {
      try {
        src.stop();
      } catch {
        // ignore already stopped
      }
    }
    activeSourcesRef.current.clear();
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
  }, []);

  const stopLiveCall = useCallback(() => {
    if (wsRef.current) {
      try {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "stop" }));
        }
        wsRef.current.close();
      } catch {
        // ignore
      }
      wsRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (mediaStreamRef.current) {
      for (const track of mediaStreamRef.current.getTracks()) {
        track.stop();
      }
      mediaStreamRef.current = null;
    }

    clearQueuedOutputAudio();

    if (inputAudioCtxRef.current) {
      void inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      void outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
    }

    if (learnerSilenceTimerRef.current !== null) {
      window.clearTimeout(learnerSilenceTimerRef.current);
      learnerSilenceTimerRef.current = null;
    }

    setCallStatus("idle");
    setTurnState("idle");
    setActiveSpeaker("idle");
    setAudioLevel(0);
    setIsMuted(false);
    serverTurnCompleteRef.current = false;
  }, [clearQueuedOutputAudio]);

  useEffect(() => {
    return () => {
      stopLiveCall();
      stopTtsPlayback();
      studyMusicEngineRef.current?.dispose();
      studyMusicEngineRef.current = null;
    };
  }, [stopLiveCall, stopTtsPlayback]);

  // Persist studying music preferences
  useEffect(() => {
    try {
      localStorage.setItem(STUDY_MUSIC_STORAGE_KEY, JSON.stringify(musicPrefs));
    } catch {
      // ignore storage errors
    }
  }, [musicPrefs]);

  const inLiveVoiceClass =
    callStatus === "connecting" || callStatus === "connected";
  const shouldPlayStudyMusic =
    hasOnboarded &&
    musicPrefs.enabled &&
    !inLiveVoiceClass &&
    !isRecordingClip;

  // Initialize and sync StudyMusicEngine
  useEffect(() => {
    if (!studyMusicEngineRef.current) {
      studyMusicEngineRef.current = new StudyMusicEngine();
    }
    const engine = studyMusicEngineRef.current;
    engine.setTrack(musicPrefs.trackId);
    engine.setVolume(musicPrefs.volume);
    engine.setDucked(speakingId !== null);

    if (shouldPlayStudyMusic) {
      void engine.start().then((started) => {
        setIsMusicPlaying(started);
      });
    } else {
      engine.stop();
      setIsMusicPlaying(false);
    }
  }, [
    musicPrefs.trackId,
    musicPrefs.volume,
    speakingId,
    shouldPlayStudyMusic,
  ]);

  // Unlock Web Audio playback smoothly on first user interaction if browser blocked autoplay
  useEffect(() => {
    if (!shouldPlayStudyMusic || isMusicPlaying) return;
    const unlock = () => {
      const engine = studyMusicEngineRef.current;
      if (!engine) return;
      void engine.start().then((started) => {
        if (started) setIsMusicPlaying(true);
      });
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [shouldPlayStudyMusic, isMusicPlaying]);

  const handleToggleStudyMusic = useCallback(() => {
    if (inLiveVoiceClass) return;
    setMusicPrefs((prev) => {
      const nextEnabled = !prev.enabled;
      if (nextEnabled) {
        if (!studyMusicEngineRef.current) {
          studyMusicEngineRef.current = new StudyMusicEngine();
        }
        const engine = studyMusicEngineRef.current;
        engine.setTrack(prev.trackId);
        engine.setVolume(prev.volume);
        void engine.start().then((started) => {
          setIsMusicPlaying(started);
        });
      } else {
        studyMusicEngineRef.current?.stop();
        setIsMusicPlaying(false);
      }
      return { ...prev, enabled: nextEnabled };
    });
  }, [inLiveVoiceClass]);

  const handleSelectStudyTrack = useCallback((trackId: StudyTrackId) => {
    setMusicPrefs((prev) => ({ ...prev, trackId }));
  }, []);

  const handleStudyVolumeChange = useCallback((volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    setMusicPrefs((prev) => ({ ...prev, volume: clamped }));
  }, []);

  const markTopicStudied = useCallback((topicName: string) => {
    if (!topicName.trim()) return;
    setProgress((prev) => {
      const exists = prev.topicsStudied.includes(topicName);
      return {
        ...prev,
        topicsStudied: exists
          ? prev.topicsStudied
          : [...prev.topicsStudied, topicName],
      };
    });
  }, []);

  const appendTranscript = useCallback(
    (
      role: "learner" | "tutor",
      text: string,
      source: "live" | "chat",
      imageUrl?: string
    ) => {
      const clean = text.trim();
      if (!clean && !imageUrl) return;
      const shouldAppendToLast =
        source === "live" && !liveTurnSealedRef.current[role] && !imageUrl;
      if (source === "live") {
        liveTurnSealedRef.current[role] = false;
        const otherRole = role === "tutor" ? "learner" : "tutor";
        liveTurnSealedRef.current[otherRole] = true;
      }

      setTranscript((prev) => {
        const last = prev[prev.length - 1];
        if (
          shouldAppendToLast &&
          last &&
          last.source === "live" &&
          last.role === role &&
          !last.imageUrl
        ) {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...last,
            text: `${last.text} ${clean}`.replace(/\s+/g, " ").trim(),
          };
          return updated;
        }
        return [
          ...prev,
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            role,
            text: clean,
            timestamp: nowTimeLabel(),
            source,
            imageUrl,
          },
        ];
      });
    },
    []
  );

  const startLiveCall = async () => {
    stopTtsPlayback();
    setCallError(null);
    setCallStatus("connecting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      await inputCtx.resume();
      await outputCtx.resume();
      inputAudioCtxRef.current = inputCtx;
      outputAudioCtxRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;
      serverTurnCompleteRef.current = false;
      liveTurnSealedRef.current = { learner: true, tutor: true };

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/live`);
      wsRef.current = ws;

      ws.onopen = () => {
        const focusLabel =
          customTopic.trim() ||
          activeTopic?.title ||
          activeTutor.subjectFocus;

        const learnerFirstName =
          (effectiveProfile.name || "my friend").trim().split(/\s+/)[0] ||
          "my friend";
        const liveGreetingPrompt = `Greet ${learnerFirstName} warmly and personally by name in your natural educated UK-Zambian voice, introduce "${focusLabel}" in 1 to 2 relaxed spoken sentences, mention that you're putting the key idea on the Board beside their Work Pad, call update_blackboard for "${focusLabel}", and gently ask if they're ready for the first step.`;

        ws.send(
          JSON.stringify({
            type: "start",
            tutorId: activeTutor.id,
            profile: effectiveProfile,
            topicId: activeTopic?.id ?? null,
            customTopic,
            initialGreetingPrompt: liveGreetingPrompt,
          })
        );
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        if (msg.type === "ready") {
          setCallStatus("connected");
          setTurnState("tutor_thinking");
          setRightTab("blackboard");
          recordSessionCompleted();
          markTopicStudied(
            customTopic.trim() ||
              activeTopic?.title ||
              activeTutor.subjectFocus
          );

          // Begin capturing mic input and resampling cleanly to 16kHz PCM
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;

          processor.onaudioprocess = (audioEvent) => {
            if (isMutedRef.current) return;
            if (ws.readyState !== WebSocket.OPEN) return;

            const rawSamples = audioEvent.inputBuffer.getChannelData(0);
            const samples16k = downsampleTo16kHz(
              rawSamples,
              inputCtx.sampleRate
            );
            const rms = computeRmsLevel(samples16k);

            if (activeSourcesRef.current.size === 0) {
              if (rms > 0.12) {
                setActiveSpeaker("learner");
                setTurnState("learner_speaking");
                setAudioLevel(rms);
                if (learnerSilenceTimerRef.current !== null) {
                  window.clearTimeout(learnerSilenceTimerRef.current);
                }
                learnerSilenceTimerRef.current = window.setTimeout(() => {
                  if (
                    !isMutedRef.current &&
                    activeSourcesRef.current.size === 0
                  ) {
                    setActiveSpeaker("idle");
                    setTurnState("tutor_thinking");
                  }
                }, 1100);
              } else {
                setAudioLevel(rms * 0.4);
              }
            }

            const base64 = float32ToPcm16Base64(samples16k);
            ws.send(JSON.stringify({ type: "audio", data: base64 }));
          };

          source.connect(processor);
          processor.connect(inputCtx.destination);
          return;
        }

        if (msg.type === "audio" && msg.data && outputAudioCtxRef.current) {
          serverTurnCompleteRef.current = false;
          const outCtx = outputAudioCtxRef.current;
          const { buffer, rms } = pcm24kBase64ToAudioBuffer(outCtx, msg.data);

          const startAt = Math.max(
            outCtx.currentTime,
            nextStartTimeRef.current
          );
          const bufferSource = outCtx.createBufferSource();
          bufferSource.buffer = buffer;
          bufferSource.connect(outCtx.destination);

          activeSourcesRef.current.add(bufferSource);
          setActiveSpeaker("tutor");
          setTurnState("tutor_speaking");
          setAudioLevel(Math.min(1, Math.max(0.25, rms * 4)));

          bufferSource.onended = () => {
            activeSourcesRef.current.delete(bufferSource);
            if (activeSourcesRef.current.size === 0) {
              setActiveSpeaker("idle");
              setAudioLevel(0.1);
              if (!isMutedRef.current && serverTurnCompleteRef.current) {
                setTurnState("waiting_for_learner");
              }
            }
          };

          bufferSource.start(startAt);
          nextStartTimeRef.current = startAt + buffer.duration;
          return;
        }

        if (msg.type === "inputTranscript" && msg.text) {
          appendTranscript("learner", msg.text, "live");
          return;
        }

        if (msg.type === "outputTranscript" && msg.text) {
          appendTranscript("tutor", msg.text, "live");
          return;
        }

        if (msg.type === "blackboard" && msg.note) {
          setBlackboard({
            id: `${Date.now()}`,
            title: msg.note.blackboardTitle || activeTopicLabel,
            subject: activeTopic?.subject ?? activeTutor.subjectFocus,
            grade: profile.grade,
            keyRule: msg.note.keyRule || "",
            workedSteps: Array.isArray(msg.note.workedSteps)
              ? msg.note.workedSteps
              : [],
            checkQuestion: msg.note.checkQuestion || "",
            updatedAt: nowTimeLabel(),
          });
          setRightTab("blackboard");
          return;
        }

        if (msg.type === "turnComplete") {
          serverTurnCompleteRef.current = true;
          liveTurnSealedRef.current = { learner: true, tutor: true };
          if (activeSourcesRef.current.size === 0 && !isMutedRef.current) {
            setActiveSpeaker("idle");
            setTurnState("waiting_for_learner");
          }
          return;
        }

        if (msg.type === "interrupted") {
          clearQueuedOutputAudio();
          serverTurnCompleteRef.current = false;
          liveTurnSealedRef.current.tutor = true;
          setActiveSpeaker("learner");
          setTurnState("learner_speaking");
          return;
        }

        if (msg.type === "error") {
          setCallError(msg.message || "Live voice session error.");
          stopLiveCall();
          setCallStatus("error");
          return;
        }

        if (msg.type === "closed") {
          stopLiveCall();
        }
      };

      ws.onerror = () => {
        setCallError(
          "Could not connect to the live voice server. You can switch to Push-to-Talk & Type anytime."
        );
        stopLiveCall();
        setCallStatus("error");
      };
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Microphone access was denied or unavailable.";
      setCallError(
        `${msg} — You can still study with voice readback using Push-to-Talk & Type.`
      );
      stopLiveCall();
      setCallStatus("error");
    }
  };

  const handleSelectTutor = (tutorId: string) => {
    if (callStatus === "connected" || callStatus === "connecting") {
      stopLiveCall();
    }
    stopTtsPlayback();
    setSelectedTutorId(tutorId);
    const pool = appView === "alevel" ? A_LEVEL_TOPICS : ECZ_SCHOOL_TOPICS;
    const matchingTopic =
      pool.find(
        (t) => t.tutorId === tutorId && t.grade === effectiveProfile.grade
      ) ??
      pool.find((t) => t.tutorId === tutorId) ??
      null;
    if (matchingTopic) {
      setActiveTopic(matchingTopic);
    }
  };

  const navigateAppView = useCallback(
    (
      nextView:
        | "home"
        | "studio"
        | "subjects"
        | "papers"
        | "competitions"
        | "calendar"
        | "alevel"
        | "admin",
      nextTab?: StudyTab,
      tutorIdOverride?: string,
      topicOverride?: SyllabusTopic | null
    ) => {
      const crossingWings =
        (appView === "alevel" && nextView !== "alevel") ||
        (appView !== "alevel" && nextView === "alevel");
      const targetTutorId = tutorIdOverride ?? selectedTutorId;

      if (crossingWings) {
        if (callStatus === "connected" || callStatus === "connecting") {
          stopLiveCall();
        }
        stopTtsPlayback();
        setBlackboard(null);
        setQuizQuestions([]);
        setTranscript([]);
        if (!tutorIdOverride) {
          setCustomTopic("");
        }

        if (nextView === "alevel") {
          const alTutor =
            A_LEVEL_TUTORS.find((t) => t.id === targetTutorId) ??
            A_LEVEL_TUTORS[0];
          setSelectedTutorId(alTutor.id);
          if (topicOverride !== undefined) {
            setActiveTopic(topicOverride);
          } else {
            setActiveTopic(
              A_LEVEL_TOPICS.find((t) => t.tutorId === alTutor.id) ??
                A_LEVEL_TOPICS[0] ??
                null
            );
          }
        } else {
          const schoolTutor =
            ECZ_SCHOOL_TUTORS.find((t) => t.id === targetTutorId) ??
            ECZ_SCHOOL_TUTORS[0];
          setSelectedTutorId(schoolTutor.id);
          const schoolGrade =
            profile.grade === "A-Level" ? "Grade 12" : profile.grade;
          if (topicOverride !== undefined) {
            setActiveTopic(topicOverride);
          } else {
            setActiveTopic(
              ECZ_SCHOOL_TOPICS.find(
                (t) => t.tutorId === schoolTutor.id && t.grade === schoolGrade
              ) ??
                ECZ_SCHOOL_TOPICS.find((t) => t.grade === schoolGrade) ??
                ECZ_SCHOOL_TOPICS[0] ??
                null
            );
          }
        }
      } else if (topicOverride !== undefined) {
        setActiveTopic(topicOverride);
      }

      if (nextTab) {
        setRightTab(nextTab);
      }
      setAppView(nextView);
    },
    [appView, callStatus, profile.grade, selectedTutorId, stopLiveCall, stopTtsPlayback]
  );

  const handleRefreshBlackboard = useCallback(
    async (
      topicOverride?: SyllabusTopic | null,
      customTopicOverride?: string,
      tutorIdOverride?: string,
      gradeOverride?: GradeLevel
    ) => {
      const topicToUse =
        topicOverride !== undefined ? topicOverride : activeTopic;
      const customToUse =
        customTopicOverride !== undefined ? customTopicOverride : customTopic;
      const targetTutor =
        (tutorIdOverride
          ? TUTORS.find((t) => t.id === tutorIdOverride)
          : topicOverride
          ? TUTORS.find((t) => t.id === topicOverride.tutorId)
          : undefined) ?? activeTutor;
      const targetProfile = gradeOverride
        ? { ...effectiveProfile, grade: gradeOverride }
        : topicOverride
        ? { ...effectiveProfile, grade: topicOverride.grade }
        : effectiveProfile;

      setBlackboardLoading(true);
      setBlackboardError(null);
      try {
        const res = await fetch("/api/tutor/blackboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tutorId: targetTutor.id,
            profile: targetProfile,
            topicId: topicToUse?.id ?? null,
            customTopic: customToUse,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load blackboard.");

        setBlackboard({
          id: `${Date.now()}`,
          title: data.blackboardTitle,
          subject: topicToUse?.subject ?? targetTutor.subjectFocus,
          grade: targetProfile.grade,
          keyRule: data.keyRule,
          workedSteps: data.workedSteps ?? [],
          checkQuestion: data.checkQuestion,
          updatedAt: nowTimeLabel(),
        });
      } catch (err) {
        setBlackboardError(
          err instanceof Error
            ? err.message
            : "Could not build blackboard note."
        );
      } finally {
        setBlackboardLoading(false);
      }
    },
    [
      activeTopic,
      activeTutor,
      customTopic,
      effectiveProfile,
    ]
  );

  const handleSelectTopic = (topic: SyllabusTopic) => {
    if (callStatus === "connected" || callStatus === "connecting") {
      stopLiveCall();
    }
    setActiveTopic(topic);
    setSelectedTutorId(topic.tutorId);
    setCustomTopic("");
    setRightTab("blackboard");
    void handleRefreshBlackboard(topic, "", topic.tutorId, topic.grade);
  };

  const handleSelectTopicFromSubjects = (topic: SyllabusTopic) => {
    if (callStatus === "connected" || callStatus === "connecting") {
      stopLiveCall();
    }
    stopTtsPlayback();
    setActiveTopic(topic);
    setSelectedTutorId(topic.tutorId);
    setCustomTopic("");
    const destView = topic.grade === "A-Level" ? "alevel" : "studio";
    navigateAppView(destView, "blackboard", topic.tutorId, topic);
    void handleRefreshBlackboard(topic, "", topic.tutorId, topic.grade);
  };

  const resolveTutorIdForSubject = (
    subject: string,
    grade: GradeLevel
  ): string => {
    const s = subject.toLowerCase();
    if (grade === "A-Level") {
      if (s.includes("math")) return "kaluba";
      if (s.includes("chem")) return "tembo";
      if (s.includes("phys")) return "sibanda";
      if (s.includes("bio")) return "kangwa";
      if (s.includes("computer")) return "chisanga";
      if (s.includes("econ") || s.includes("account")) return "mulenga";
      return "kaluba";
    }
    if (s.includes("math")) return "chanda";
    if (s.includes("chem") || s.includes("bio") || s.includes("integrated science")) {
      return "mwansa";
    }
    if (s.includes("phys") || s.includes("combined science")) return "phiri";
    if (s.includes("computer") || s.includes("ict") || s.includes("creative")) {
      return "chisanga";
    }
    if (s.includes("account") || s.includes("commerce") || s.includes("business")) {
      return "mulenga";
    }
    if (s.includes("geo") || s.includes("agric")) return "ngandu";
    if (s.includes("literature") || s.includes("zambian")) return "mumba";
    if (
      s.includes("english") ||
      s.includes("civic") ||
      s.includes("social") ||
      s.includes("history") ||
      s.includes("religious")
    ) {
      return "banda";
    }
    return "chanda";
  };

  const handleStartCustomSubjectTopic = (
    subject: string,
    grade: GradeLevel,
    customTitle: string
  ) => {
    if (callStatus === "connected" || callStatus === "connecting") {
      stopLiveCall();
    }
    stopTtsPlayback();
    const cleanTitle = customTitle.trim();
    if (!cleanTitle) return;
    const formattedCustom = `${subject}: ${cleanTitle}`;
    const tutorId = resolveTutorIdForSubject(subject, grade);
    setActiveTopic(null);
    setSelectedTutorId(tutorId);
    setCustomTopic(formattedCustom);
    const destView = grade === "A-Level" ? "alevel" : "studio";
    navigateAppView(destView, "blackboard", tutorId, null);
    void handleRefreshBlackboard(null, formattedCustom, tutorId, grade);
  };

  const handleSendTextOrTurn = async (
    promptText: string,
    tutorIdOverride?: string,
    customTopicOverride?: string
  ) => {
    const clean = promptText.trim();
    if (!clean) return;

    const targetTutor =
      (tutorIdOverride
        ? (appView === "alevel" ? A_LEVEL_TUTORS : ECZ_SCHOOL_TUTORS).find(
            (t) => t.id === tutorIdOverride
          )
        : undefined) ?? activeTutor;
    const topicText =
      customTopicOverride !== undefined ? customTopicOverride : customTopic;

    // If live voice call is active, inject into live session directly
    if (
      voiceMode === "live" &&
      callStatus === "connected" &&
      wsRef.current?.readyState === WebSocket.OPEN
    ) {
      appendTranscript("learner", clean, "live");
      wsRef.current.send(JSON.stringify({ type: "text", text: clean }));
      setTextInput("");
      return;
    }

    // Otherwise run Turn-Based Tutoring + auto-update Blackboard + Voice Readback
    setIsSendingTurn(true);
    setCallError(null);
    appendTranscript("learner", clean, "chat");
    setTextInput("");

    try {
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId: targetTutor.id,
          profile: effectiveProfile,
          topicId: activeTopic?.id ?? null,
          customTopic: topicText,
          history: transcript.slice(-8).map((m) => ({
            role: m.role,
            text: m.text,
          })),
          message: clean,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tutor could not respond.");

      const replyId = `${Date.now()}-tutor`;
      setTranscript((prev) => [
        ...prev,
        {
          id: replyId,
          role: "tutor",
          text: data.spokenReply,
          timestamp: nowTimeLabel(),
          source: "chat",
        },
      ]);

      setBlackboard({
        id: `${Date.now()}`,
        title: data.blackboardTitle,
        subject: activeTopic?.subject ?? targetTutor.subjectFocus,
        grade: effectiveProfile.grade,
        keyRule: data.keyRule,
        workedSteps: data.workedSteps ?? [],
        checkQuestion: data.checkQuestion,
        updatedAt: nowTimeLabel(),
      });
      setRightTab("blackboard");

      markTopicStudied(
        topicText.trim() || activeTopic?.title || targetTutor.subjectFocus
      );
      if (!countedTurnSessionRef.current) {
        countedTurnSessionRef.current = true;
        recordSessionCompleted();
      }

      // Automatically play tutor's voice reply in Push-to-Talk & Type mode
      if (voiceMode === "turn") {
        void handleSpeakText(data.spokenReply, replyId);
      }
    } catch (err) {
      setCallError(
        err instanceof Error ? err.message : "Failed to reach your AI tutor."
      );
    } finally {
      setIsSendingTurn(false);
    }
  };

  const handleSendPadToTutor = async (imageBase64: string) => {
    if (!imageBase64) return;
    const fullDataUrl = `data:image/jpeg;base64,${imageBase64}`;

    const padPrompt = blackboard
      ? `Please check and mark my handwritten Work Pad solution for "${blackboard.title}" (${blackboard.keyRule}). Prompt on board: ${blackboard.workedSteps[0] ?? blackboard.checkQuestion}.`
      : "I just wrote this on my pad. Please look at my written work, tell me what is right or needs fixing in one short step, and update the blackboard.";

    if (
      voiceMode === "live" &&
      callStatus === "connected" &&
      wsRef.current?.readyState === WebSocket.OPEN
    ) {
      appendTranscript(
        "learner",
        "[Shared handwritten work from Writing Pad]",
        "live",
        fullDataUrl
      );
      wsRef.current.send(
        JSON.stringify({
          type: "image",
          data: imageBase64,
          mimeType: "image/jpeg",
          prompt: padPrompt,
        })
      );
      setTurnState("tutor_thinking");
      return;
    }

    setIsSendingTurn(true);
    setCallError(null);
    appendTranscript(
      "learner",
      "[Shared handwritten work from Writing Pad]",
      "chat",
      fullDataUrl
    );

    try {
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId: activeTutor.id,
          profile: effectiveProfile,
          topicId: activeTopic?.id ?? null,
          customTopic,
          history: transcript.slice(-8).map((m) => ({
            role: m.role,
            text: m.text,
          })),
          message: padPrompt,
          padImageBase64: imageBase64,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tutor could not read pad.");

      const replyId = `${Date.now()}-tutor`;
      setTranscript((prev) => [
        ...prev,
        {
          id: replyId,
          role: "tutor",
          text: data.spokenReply,
          timestamp: nowTimeLabel(),
          source: "chat",
        },
      ]);

      setBlackboard({
        id: `${Date.now()}`,
        title: data.blackboardTitle,
        subject: activeTopic?.subject ?? activeTutor.subjectFocus,
        grade: effectiveProfile.grade,
        keyRule: data.keyRule,
        workedSteps: data.workedSteps ?? [],
        checkQuestion: data.checkQuestion,
        updatedAt: nowTimeLabel(),
      });

      markTopicStudied(
        customTopic.trim() || activeTopic?.title || activeTutor.subjectFocus
      );
      if (!countedTurnSessionRef.current) {
        countedTurnSessionRef.current = true;
        recordSessionCompleted();
      }

      void handleSpeakText(data.spokenReply, replyId);
    } catch (err) {
      setCallError(
        err instanceof Error ? err.message : "Failed to inspect your pad."
      );
    } finally {
      setIsSendingTurn(false);
    }
  };

  const handleSendSnapToTutor = async (snap: SnapData) => {
    if (!snap.base64) return;
    setIsSendingSnap(true);
    setCallError(null);

    const fullDataUrl = snap.dataUrl.startsWith("data:")
      ? snap.dataUrl
      : `data:${snap.mimeType};base64,${snap.base64}`;

    const promptText =
      snap.prompt?.trim() ||
      "Please inspect this snap of my work and guide me step-by-step.";

    if (
      voiceMode === "live" &&
      callStatus === "connected" &&
      wsRef.current?.readyState === WebSocket.OPEN
    ) {
      appendTranscript("learner", promptText, "live", fullDataUrl);
      wsRef.current.send(
        JSON.stringify({
          type: "image",
          data: snap.base64,
          mimeType: snap.mimeType || "image/jpeg",
          prompt: promptText,
        })
      );
      setTurnState("tutor_thinking");
      setIsSendingSnap(false);
      return;
    }

    setIsSendingTurn(true);
    appendTranscript("learner", promptText, "chat", fullDataUrl);

    try {
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId: activeTutor.id,
          profile: effectiveProfile,
          topicId: activeTopic?.id ?? null,
          customTopic,
          history: transcript.slice(-8).map((m) => ({
            role: m.role,
            text: m.text,
          })),
          message: promptText,
          snapImageBase64: snap.base64,
          imageMimeType: snap.mimeType || "image/jpeg",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tutor could not inspect snap.");

      const replyId = `${Date.now()}-tutor`;
      setTranscript((prev) => [
        ...prev,
        {
          id: replyId,
          role: "tutor",
          text: data.spokenReply,
          timestamp: nowTimeLabel(),
          source: "chat",
        },
      ]);

      setBlackboard({
        id: `${Date.now()}`,
        title: data.blackboardTitle,
        subject: activeTopic?.subject ?? activeTutor.subjectFocus,
        grade: effectiveProfile.grade,
        keyRule: data.keyRule,
        workedSteps: data.workedSteps ?? [],
        checkQuestion: data.checkQuestion,
        updatedAt: nowTimeLabel(),
      });
      setRightTab("blackboard");

      markTopicStudied(
        customTopic.trim() || activeTopic?.title || activeTutor.subjectFocus
      );
      if (!countedTurnSessionRef.current) {
        countedTurnSessionRef.current = true;
        recordSessionCompleted();
      }

      if (voiceMode === "turn") {
        void handleSpeakText(data.spokenReply, replyId);
      }
    } catch (err) {
      setCallError(
        err instanceof Error ? err.message : "Failed to inspect your snap."
      );
    } finally {
      setIsSendingTurn(false);
      setIsSendingSnap(false);
    }
  };

  const toggleTurnRecording = async () => {
    if (isRecordingClip && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecordingClip(false);
      return;
    }

    setCallError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        for (const t of stream.getTracks()) t.stop();
        const blob = new Blob(recordedChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        setIsTranscribing(true);
        try {
          const reader = new FileReader();
          const base64Data: string = await new Promise((resolve, reject) => {
            reader.onloadend = () => {
              const res = String(reader.result || "");
              const comma = res.indexOf(",");
              resolve(comma >= 0 ? res.slice(comma + 1) : res);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          const trRes = await fetch("/api/tutor/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              audioBase64: base64Data,
              mimeType: blob.type || "audio/webm",
            }),
          });
          const trData = await trRes.json();
          if (!trRes.ok) {
            throw new Error(trData.error || "Transcription failed.");
          }
          if (trData.transcript) {
            await handleSendTextOrTurn(trData.transcript);
          }
        } catch (err) {
          setCallError(
            err instanceof Error
              ? err.message
              : "Could not transcribe voice clip."
          );
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start();
      setIsRecordingClip(true);
    } catch {
      setCallError("Microphone access is needed to record your question.");
    }
  };

  const handleGenerateQuiz = async () => {
    setQuizLoading(true);
    setQuizError(null);
    try {
      const res = await fetch("/api/tutor/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId: activeTutor.id,
          profile: effectiveProfile,
          topicId: activeTopic?.id ?? null,
          customTopic,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate quiz.");
      setQuizQuestions(data.questions ?? []);
    } catch (err) {
      setQuizError(
        err instanceof Error ? err.message : "Could not generate ECZ quiz."
      );
    } finally {
      setQuizLoading(false);
    }
  };

  const handleAskTutorAboutWeakness = (item: WeaknessItem) => {
    setCustomTopic(item.title);
    setRightTab("blackboard");
    void handleSendTextOrTurn(
      `Please help me thoroughly master this weak area step by step: ${item.title} - Question: ${item.prompt}. Explanation: ${item.explanation}`
    );
  };

  const handleRemoveWeakness = (id: string) => {
    setProgress((prev) => ({
      ...prev,
      weaknesses: (prev.weaknesses || []).filter((w) => w.id !== id),
    }));
  };

  const handleClearAllWeaknesses = () => {
    setProgress((prev) => ({ ...prev, weaknesses: [] }));
  };

  const handleRecordQuizAnswer = (isCorrect: boolean, questionObj?: QuizQuestion) => {
    const today = getLocalDateKey();
    setProgress((prev) => {
      const existing = prev.dailyActivity?.[today] ?? {
        date: today,
        sessions: 0,
        quizAnswered: 0,
        quizCorrect: 0,
      };
      let newWeaknesses = prev.weaknesses || [];
      if (!isCorrect && questionObj) {
        const weakItem: WeaknessItem = {
          id: `weak-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: (activeTopic?.title ?? customTopic.trim()) || activeTutor.subjectFocus,
          subject: activeTopic?.subject ?? activeTutor.subjectFocus,
          grade: effectiveProfile.grade,
          prompt: questionObj.question,
          explanation: questionObj.explanation,
          addedAt: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        };
        if (!newWeaknesses.some((w) => w.prompt === weakItem.prompt)) {
          newWeaknesses = [weakItem, ...newWeaknesses].slice(0, 50);
        }
      }
      return {
        ...prev,
        quizAnswered: prev.quizAnswered + 1,
        quizCorrect: prev.quizCorrect + (isCorrect ? 1 : 0),
        weaknesses: newWeaknesses,
        dailyActivity: {
          ...prev.dailyActivity,
          [today]: {
            ...existing,
            quizAnswered: existing.quizAnswered + 1,
            quizCorrect: existing.quizCorrect + (isCorrect ? 1 : 0),
          },
        },
      };
    });
  };

  const handleAddWeakness = (
    title: string,
    subject: string,
    prompt?: string,
    explanation?: string
  ) => {
    setProgress((prev) => {
      const existing = prev.weaknesses || [];
      const newItem: WeaknessItem = {
        id: `weak-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        subject,
        grade: effectiveProfile.grade,
        prompt: prompt || title,
        explanation: explanation || "Saved from ECZ Past Papers for revision.",
        addedAt: new Date().toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      };
      if (existing.some((w) => w.prompt === newItem.prompt && w.title === newItem.title)) {
        return prev;
      }
      return {
        ...prev,
        weaknesses: [newItem, ...existing].slice(0, 50),
      };
    });
  };

  const handleSaveBlackboard = () => {
    if (!blackboard) return;
    setProgress((prev) => {
      const filtered = prev.savedNotes.filter((n) => n.id !== blackboard.id);
      return {
        ...prev,
        savedNotes: [blackboard, ...filtered].slice(0, 20),
      };
    });
    setRightTab("progress");
  };

  const activeTopicLabel =
    customTopic.trim() || activeTopic?.title || activeTutor.subjectFocus;

  const latestTutorLine =
    [...transcript].reverse().find((entry) => entry.role === "tutor")?.text ??
    null;

  const callStatusLabel =
    callStatus === "connecting"
      ? "Dialing your AI voice tutor..."
      : callStatus === "connected"
      ? turnState === "paused"
        ? "Call on hold · Take your time to think"
        : turnState === "tutor_speaking"
        ? `${activeTutor.name} is speaking — interrupt anytime`
        : turnState === "learner_speaking"
        ? "Listening to you..."
        : turnState === "tutor_thinking"
        ? `${activeTutor.name} is thinking...`
        : "Your turn · Speak when you are ready"
      : callStatus === "error"
      ? "Phone call connection paused"
      : "Ready for live two-way phone call";

  if (!hasOnboarded) {
    return (
      <WelcomeOnboarding
        initialProfile={profile}
        onComplete={(newProfile, chosenTutorId) => {
          setProfile(newProfile);
          setSelectedTutorId(chosenTutorId);
          const starterTopic =
            ECZ_TOPICS.find(
              (t) =>
                t.tutorId === chosenTutorId && t.grade === newProfile.grade
            ) ??
            ECZ_TOPICS.find((t) => t.tutorId === chosenTutorId) ??
            null;
          if (starterTopic) {
            setActiveTopic(starterTopic);
          }
          try {
            localStorage.setItem(ONBOARDED_STORAGE_KEY, "true");
          } catch {
            // ignore storage errors
          }
          setIsReturningLearner(false);
          setHasOnboarded(true);
          setAppView(newProfile.grade === "A-Level" ? "alevel" : "home");
        }}
      />
    );
  }

  const handleOpenFromHome = (dest: HomeDestination) => {
    if (dest.tab === "papers") {
      navigateAppView("papers");
      return;
    }
    if (dest.tab === "topics") {
      navigateAppView("subjects");
      return;
    }
    if (dest.voiceMode) {
      setVoiceMode(dest.voiceMode);
    }
    navigateAppView("studio", dest.tab);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Three-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              navigateAppView(profile.grade === "A-Level" ? "alevel" : "home");
            }}
            className="flex items-center gap-2.5 group cursor-pointer whitespace-nowrap shrink-0"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 shadow-2xs group-hover:border-emerald-600 transition-colors">
              <img
                src={appLogoImg}
                alt="Kasukulu Study Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors">
              Kasukulu
            </span>
          </a>

          {/* Zone 2: single-line nav links */}
          <nav
            aria-label="Primary sections"
            className="hidden md:flex items-center gap-1 lg:gap-1.5 text-xs lg:text-sm font-medium text-slate-600"
          >
            <button
              type="button"
              onClick={() => navigateAppView("home")}
              className={`inline-flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                appView === "home"
                  ? "bg-emerald-700 text-white font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              <Home
                className={`w-3.5 h-3.5 ${
                  appView === "home" ? "text-amber-300" : "text-emerald-700"
                }`}
              />
              <span>Home</span>
            </button>
            <button
              type="button"
              onClick={() => navigateAppView("subjects")}
              className={`inline-flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                appView === "subjects"
                  ? "bg-emerald-700 text-white font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              <BookOpen
                className={`w-3.5 h-3.5 ${
                  appView === "subjects"
                    ? "text-amber-300"
                    : "text-emerald-700"
                }`}
              />
              <span>Subjects</span>
            </button>
            <button
              type="button"
              onClick={() => navigateAppView("studio", "blackboard")}
              className={`inline-flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                appView === "studio"
                  ? "bg-emerald-700 text-white font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              <Mic
                className={`w-3.5 h-3.5 ${
                  appView === "studio"
                    ? "text-amber-300"
                    : "text-emerald-700"
                }`}
              />
              <span>Voice Studio</span>
            </button>
            <button
              type="button"
              onClick={() => navigateAppView("papers")}
              className={`inline-flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                appView === "papers"
                  ? "bg-emerald-700 text-white font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              <FileText
                className={`w-3.5 h-3.5 ${
                  appView === "papers"
                    ? "text-amber-300"
                    : "text-emerald-700"
                }`}
              />
              <span>Past Papers</span>
            </button>
            <button
              type="button"
              onClick={() => navigateAppView("calendar")}
              className={`inline-flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                appView === "calendar"
                  ? "bg-emerald-700 text-white font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              <CalendarDays
                className={`w-3.5 h-3.5 ${
                  appView === "calendar" ? "text-amber-300" : "text-emerald-700"
                }`}
              />
              <span>Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => navigateAppView("competitions")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                appView === "competitions"
                  ? "bg-emerald-700 text-white font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              <Trophy
                className={`w-3.5 h-3.5 ${
                  appView === "competitions" ? "text-amber-300" : "text-amber-600"
                }`}
              />
              <span>Competitions</span>
            </button>
            <button
              type="button"
              onClick={() => navigateAppView("alevel", "blackboard")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                appView === "alevel"
                  ? "bg-slate-900 text-amber-300 font-semibold shadow-xs"
                  : "bg-slate-100 text-slate-900 hover:bg-slate-200 font-semibold"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>A-Level</span>
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => navigateAppView("admin")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  appView === "admin"
                    ? "bg-slate-900 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                }`}
              >
                <ShieldCheck
                  className={`w-3.5 h-3.5 ${
                    appView === "admin" ? "text-amber-300" : "text-emerald-700"
                  }`}
                />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-medium hover:bg-emerald-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Personalize
            </button>
          </div>
        </div>
      </header>

      <StudyMusicBar
        musicEnabled={musicPrefs.enabled}
        isPlaying={isMusicPlaying}
        inLiveVoiceClass={inLiveVoiceClass}
        isRecordingClip={isRecordingClip}
        isDucked={speakingId !== null}
        trackId={musicPrefs.trackId}
        volume={musicPrefs.volume}
        onToggleMusic={handleToggleStudyMusic}
        onSelectTrack={handleSelectStudyTrack}
        onVolumeChange={handleStudyVolumeChange}
      />

      <main
        id="studio"
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6"
      >
        {/* Mobile Section Switcher (non-sticky to preserve mobile viewport) */}
        <nav
          aria-label="Mobile sections"
          className="flex md:hidden items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 overflow-x-auto no-scrollbar"
        >
          {(
            [
              { id: "home" as const, label: "Home", icon: Home },
              { id: "subjects" as const, label: "Subjects", icon: BookOpen },
              { id: "studio" as const, label: "Voice Studio", icon: Mic },
              { id: "papers" as const, label: "Past Papers", icon: FileText },
              { id: "calendar" as const, label: "Calendar", icon: CalendarDays },
              { id: "competitions" as const, label: "Competitions", icon: Trophy },
              { id: "alevel" as const, label: "A-Level", icon: GraduationCap },
              ...(isAdmin ? [{ id: "admin" as const, label: "Admin", icon: ShieldCheck }] : []),
            ]
          ).map((item) => {
            const Icon = item.icon;
            const active = appView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === "subjects") {
                    navigateAppView("subjects");
                  } else if (item.id === "papers") {
                    navigateAppView("papers");
                  } else if (item.id === "studio") {
                    navigateAppView("studio", "blackboard");
                  } else if (item.id === "alevel") {
                    navigateAppView("alevel", "blackboard");
                  } else if (item.id === "admin") {
                    navigateAppView("admin");
                  } else if (item.id === "calendar") {
                    navigateAppView("calendar");
                  } else if (item.id === "competitions") {
                    navigateAppView("competitions");
                  } else {
                    navigateAppView("home");
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer ${
                  active
                    ? item.id === "alevel" || item.id === "admin"
                      ? "bg-slate-900 text-amber-300 shadow-xs"
                      : "bg-gradient-to-r from-emerald-700 to-emerald-800 text-white shadow-xs"
                    : "bg-white border border-slate-200/80 text-slate-700 hover:text-slate-950"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    active
                      ? "text-amber-300"
                      : item.id === "competitions"
                      ? "text-amber-600"
                      : "text-emerald-700"
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {appView === "admin" ? (
          <AdminDashboard
            profile={effectiveProfile}
            progress={progress}
            onBackHome={() => navigateAppView("home")}
            isAdmin={isAdmin}
            onAdminAuthSuccess={() => setIsAdmin(true)}
            onAdminSignOut={() => void handleAdminSignOut()}
          />
        ) : appView === "alevel" ? (
          <ALevelWing
            profile={effectiveProfile}
            progress={progress}
            activeTutor={activeTutor}
            onSelectALevelTutor={handleSelectTutor}
            activeTopic={activeTopic}
            customTopic={customTopic}
            onCustomTopicChange={setCustomTopic}
            onSelectTopic={handleSelectTopic}
            voiceMode={voiceMode}
            onVoiceModeChange={setVoiceMode}
            callStatus={callStatus}
            callStatusLabel={callStatusLabel}
            callError={callError}
            onClearCallError={() => setCallError(null)}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted((m) => !m)}
            callSeconds={callSeconds}
            turnState={turnState}
            activeSpeaker={activeSpeaker}
            audioLevel={audioLevel}
            onStartLiveCall={() => void startLiveCall()}
            onStopLiveCall={stopLiveCall}
            transcript={transcript}
            studyPanelRef={studyPanelRef}
            textInput={textInput}
            onTextInputChange={setTextInput}
            onSendTextOrTurn={(prompt, tutorIdOverride, customTopicOverride) =>
              void handleSendTextOrTurn(
                prompt,
                tutorIdOverride,
                customTopicOverride
              )
            }
            isSendingTurn={isSendingTurn}
            isRecordingClip={isRecordingClip}
            isTranscribing={isTranscribing}
            onToggleTurnRecording={() => void toggleTurnRecording()}
            onOpenSnapModal={() => setSnapModalOpen(true)}
            onSpeakText={(text, id) => void handleSpeakText(text, id)}
            speakingId={speakingId}
            rightTab={rightTab}
            onRightTabChange={setRightTab}
            blackboard={blackboard}
            blackboardLoading={blackboardLoading}
            blackboardError={blackboardError}
            onRefreshBlackboard={() => void handleRefreshBlackboard()}
            onSaveBlackboard={handleSaveBlackboard}
            quizQuestions={quizQuestions}
            quizLoading={quizLoading}
            quizError={quizError}
            onGenerateQuiz={() => void handleGenerateQuiz()}
            onRecordQuizAnswer={handleRecordQuizAnswer}
            onAskTutorAboutWeakness={handleAskTutorAboutWeakness}
            onRemoveWeakness={handleRemoveWeakness}
            onClearAllWeaknesses={handleClearAllWeaknesses}
            onLoadSavedNote={(note) => {
              setBlackboard(note);
              setRightTab("blackboard");
            }}
            onDeleteSavedNote={(id) => {
              setProgress((prev) => ({
                ...prev,
                savedNotes: prev.savedNotes.filter((n) => n.id !== id),
              }));
            }}
            onResetProgress={() => setProgress(DEFAULT_PROGRESS)}
            onSendPadToTutor={(imageBase64) =>
              void handleSendPadToTutor(imageBase64)
            }
            onStartMonthlyTest={(test) => {
              setCustomTopic(test.title);
              setRightTab("blackboard");
              void handleSendTextOrTurn(
                `Help me prepare and test me step-by-step on ${test.title} for ${test.subject} (A-Level).`
              );
            }}
            isReturningLearner={isReturningLearner}
          />
        ) : appView === "home" ? (
          <HomeHub
            profile={effectiveProfile}
            progress={progress}
            activeTutorId={activeTutor.id}
            calendar={studyCalendar}
            isReturningLearner={isReturningLearner}
            onOpenDestination={handleOpenFromHome}
            onSelectTutorAndEnter={(tutorId) => {
              handleSelectTutor(tutorId);
              navigateAppView("studio", "blackboard");
            }}
            onOpenCompetitions={() => navigateAppView("competitions")}
            onOpenCalendar={() => navigateAppView("calendar")}
            onStartScheduledStudy={(tutorId, topicNote) => {
              if (A_LEVEL_TUTORS.some((t) => t.id === tutorId)) {
                handleSelectTutor(tutorId);
                if (topicNote) setCustomTopic(topicNote);
                navigateAppView("alevel", "blackboard", tutorId);
                return;
              }
              handleSelectTutor(tutorId);
              if (topicNote) setCustomTopic(topicNote);
              navigateAppView("studio", "blackboard", tutorId);
            }}
            onOpenProfile={() => setProfileOpen(true)}
          />
        ) : appView === "calendar" ? (
          <StudyCalendarView
            profile={effectiveProfile}
            calendar={studyCalendar}
            onAddTimetableSlots={handleAddTimetableSlots}
            onDeleteTimetableSlot={handleDeleteTimetableSlot}
            onToggleSlotCompleted={handleToggleSlotCompleted}
            onAddExam={handleAddExam}
            onDeleteExam={handleDeleteExam}
            onBackHome={() => navigateAppView("home")}
            onStartStudyWithTutor={(tutorId, topicNote) => {
              if (A_LEVEL_TUTORS.some((t) => t.id === tutorId)) {
                handleSelectTutor(tutorId);
                if (topicNote) setCustomTopic(topicNote);
                navigateAppView("alevel", "blackboard", tutorId);
                return;
              }
              handleSelectTutor(tutorId);
              if (topicNote) setCustomTopic(topicNote);
              navigateAppView("studio", "blackboard", tutorId);
            }}
          />
        ) : appView === "subjects" ? (
          <div className="space-y-4">
            <div>
              <button
                type="button"
                onClick={() => navigateAppView("home")}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 hover:text-emerald-950 transition-colors whitespace-nowrap cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                Back to Home
              </button>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
              <SubjectsPanel
                defaultGrade={profile.grade}
                activeTopicId={activeTopic?.id ?? null}
                onSelectTopic={handleSelectTopicFromSubjects}
                onStartCustomSubjectTopic={handleStartCustomSubjectTopic}
              />
            </div>
          </div>
        ) : appView === "papers" ? (
          <div className="space-y-4">
            <div>
              <button
                type="button"
                onClick={() => navigateAppView("home")}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 hover:text-emerald-950 transition-colors whitespace-nowrap cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                Back to Home
              </button>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
              <PastPapersPanel
                defaultGrade={
                  effectiveProfile.grade === "A-Level"
                    ? "A-Level"
                    : effectiveProfile.grade
                }
                wingMode={
                  effectiveProfile.grade === "A-Level" ? "alevel" : "school"
                }
                onRecordQuizAnswer={handleRecordQuizAnswer}
                onSpeakText={(text, id) => void handleSpeakText(text, id)}
                speakingId={speakingId}
                onAddWeakness={handleAddWeakness}
              />
            </div>
          </div>
        ) : appView === "competitions" ? (
          <CompetitionDashboard
            profile={effectiveProfile}
            onUpdateProfile={setProfile}
            onBackHome={() => navigateAppView("home")}
            onGoToVoiceStudio={() => navigateAppView("studio", "blackboard")}
          />
        ) : (
          <>
        {/* Unboxed Learner Metadata & Tutor Selector Strip */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <button
                type="button"
                onClick={() => navigateAppView("home")}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 hover:text-emerald-950 mb-1.5 transition-colors whitespace-nowrap"
              >
                <Home className="w-3.5 h-3.5" />
                Back to Home
              </button>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 text-balance">
                Zambian AI Voice Study Studio
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
                <span className="font-medium text-slate-900">
                  {effectiveProfile.name || "Learner"}
                </span>
                {effectiveProfile.school && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{effectiveProfile.school}</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span>{effectiveProfile.grade}</span>
                <span aria-hidden="true">·</span>
                <span>{effectiveProfile.languageAid}</span>
                <span aria-hidden="true">·</span>
                <span>{effectiveProfile.pace}</span>
                <span aria-hidden="true">·</span>
                <span>{effectiveProfile.province}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
              <span>
                Active Topic:{" "}
                <span className="font-medium text-slate-900">
                  {activeTopicLabel}
                </span>
              </span>
            </div>
          </div>

          {/* 4 Grade 7-12 Zambian AI Tutor Personas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ECZ_SCHOOL_TUTORS.map((tutor) => {
              const selected = tutor.id === activeTutor.id;
              return (
                <button
                  key={tutor.id}
                  type="button"
                  onClick={() => handleSelectTutor(tutor.id)}
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all ${
                    selected
                      ? "border-emerald-700 bg-white shadow-xs ring-1 ring-emerald-700"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <TutorPortrait
                    tutorId={tutor.id}
                    name={tutor.name}
                    sizeClass="w-12 h-12"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {tutor.name}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500 shrink-0">
                        {tutor.voiceName}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 truncate mt-0.5">
                      {tutor.subjectFocus}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Voice Tutor Console + Full-Width Board & Work Pad Stage */}
        <div className="space-y-6">
          {/* Top Compact Acoustic Voice & Prompt Console */}
          <section
            aria-label="AI Voice Tutor Stage"
            className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs"
          >
            {/* Mode Switcher Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200/90 rounded-xl shadow-2xs">
                <button
                  type="button"
                  onClick={() => setVoiceMode("live")}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    voiceMode === "live"
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                  }`}
                >
                  <PhoneCall
                    className={`w-3.5 h-3.5 ${
                      voiceMode === "live" ? "text-amber-300" : "text-emerald-700"
                    }`}
                  />
                  <span>Live Voice Class</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      callStatus === "connected" ||
                      callStatus === "connecting"
                    ) {
                      stopLiveCall();
                    }
                    setVoiceMode("turn");
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    voiceMode === "turn"
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                  }`}
                >
                  <Mic
                    className={`w-3.5 h-3.5 ${
                      voiceMode === "turn" ? "text-amber-300" : "text-emerald-700"
                    }`}
                  />
                  <span>Push-to-Talk & Type</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {latestTutorLine && (
                  <button
                    type="button"
                    onClick={() =>
                      void handleSpeakText(
                        latestTutorLine,
                        "latest-studio-tutor-line"
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-medium text-emerald-900 hover:bg-emerald-100 transition-colors whitespace-nowrap"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                    {speakingId === "latest-studio-tutor-line"
                      ? "Stop Reply"
                      : "Replay Last Reply"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSnapModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
                  title="Snap photo or screenshot for tutor"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Snap / Screenshot</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void handleSpeakText(
                      activeTutor.sampleGreeting,
                      `greeting-${activeTutor.id}`
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                  {speakingId === `greeting-${activeTutor.id}`
                    ? "Stop Voice Sample"
                    : "Hear Tutor Voice"}
                </button>
              </div>
            </div>

            {/* Dark Acoustic Stage */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-slate-50 px-5 sm:px-6 py-5 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <TutorPortrait
                    tutorId={activeTutor.id}
                    name={activeTutor.name}
                    sizeClass="w-14 h-14"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-white">
                        {activeTutor.name}
                      </span>
                      {callStatus === "connected" && (
                        <span className="font-mono text-xs text-slate-300 tabular-nums">
                          · {formatCallDuration(callSeconds)}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      {activeTutor.subjectFocus}
                      <span aria-hidden="true"> · </span>
                      Voice {activeTutor.voiceName}
                    </div>
                    <div
                      className={`text-xs mt-1 font-medium ${
                        turnState === "waiting_for_learner"
                          ? "text-amber-300"
                          : turnState === "paused"
                          ? "text-slate-300"
                          : "text-emerald-300"
                      }`}
                    >
                      {voiceMode === "live"
                        ? callStatusLabel
                        : isRecordingClip
                        ? "Recording your question..."
                        : isTranscribing
                        ? "Transcribing speech..."
                        : isSendingTurn
                        ? `${activeTutor.name} is preparing an answer...`
                        : "Board & Work Pad ready — speak or ask below"}
                    </div>
                  </div>
                </div>

                {voiceMode === "live" && (
                  <div className="flex items-center gap-2.5 shrink-0">
                    {callStatus === "connected" ||
                    callStatus === "connecting" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsMuted((m) => !m)}
                          disabled={callStatus === "connecting"}
                          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap min-h-[44px] ${
                            isMuted
                              ? "bg-amber-600 text-white hover:bg-amber-500"
                              : "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700"
                          }`}
                        >
                          {isMuted ? (
                            <>
                              <Mic className="w-4 h-4" />
                              Resume Mic
                            </>
                          ) : (
                            <>
                              <MicOff className="w-4 h-4" />
                              Hold / Think
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={stopLiveCall}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-medium hover:bg-red-500 transition-colors whitespace-nowrap min-h-[44px]"
                        >
                          <PhoneOff className="w-4 h-4" />
                          End Call
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={startLiveCall}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors whitespace-nowrap min-h-[44px]"
                      >
                        <PhoneCall className="w-4 h-4" />
                        Start Live Voice Class
                      </button>
                    )}
                  </div>
                )}
              </div>

              <VoiceWaveform
                active={
                  callStatus === "connected" ||
                  isRecordingClip ||
                  speakingId !== null
                }
                speaker={
                  speakingId
                    ? "tutor"
                    : isRecordingClip
                    ? "learner"
                    : activeSpeaker
                }
                level={
                  isRecordingClip || speakingId ? 0.65 : audioLevel
                }
              />

              {/* Context-aware Turn & Comprehension Controls */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {voiceMode === "live" && callStatus === "connected" ? (
                  <>
                    <span className="text-xs text-slate-400 mr-1">
                      Call replies:
                    </span>
                    {[
                      {
                        label: "I understand, next step",
                        prompt:
                          "Yes, I understand that step. Please go to the next step and wait for me.",
                      },
                      {
                        label: "Please repeat slowly",
                        prompt:
                          "Wait, please repeat that same step more slowly in simpler words.",
                      },
                      {
                        label: "Give me a moment",
                        prompt:
                          "Hold on a moment please, let me try writing this on my pad.",
                      },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendTextOrTurn(item.prompt)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition-colors whitespace-nowrap"
                      >
                        {item.label}
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    <span className="text-xs text-slate-400 mr-1">
                      Quick prompts:
                    </span>
                    {[
                      activeTopic?.starterPrompt ??
                        `Teach me ${activeTopicLabel} step by step.`,
                      "Give me a Zambian everyday example",
                      "Ask me an ECZ exam question",
                    ].map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendTextOrTurn(prompt)}
                        disabled={isSendingTurn}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition-colors text-left truncate max-w-[260px]"
                      >
                        {idx === 0
                          ? `Explain ${activeTopic?.title ?? activeTopicLabel}`
                          : prompt}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>

            {callError && (
              <div className="mx-5 mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900">
                <span>{callError}</span>
                {voiceMode === "live" && (
                  <button
                    type="button"
                    onClick={() => {
                      setVoiceMode("turn");
                      setCallError(null);
                    }}
                    className="font-semibold underline hover:text-amber-950 whitespace-nowrap"
                  >
                    Use Push-to-Talk & Type
                  </button>
                )}
              </div>
            )}

            {/* Compact Speak & Ask Control Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSendTextOrTurn(textInput);
              }}
              className="border-t border-slate-200 p-3.5 sm:px-5 bg-slate-50/80 flex items-center gap-2.5"
            >
              {voiceMode === "turn" && (
                <button
                  type="button"
                  onClick={toggleTurnRecording}
                  disabled={isTranscribing || isSendingTurn}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 min-h-[44px] ${
                    isRecordingClip
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-white border border-slate-300 text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  {isTranscribing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Transcribing
                    </>
                  ) : isRecordingClip ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      Stop & Ask
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-emerald-700" />
                      Speak
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => setSnapModalOpen(true)}
                title="Take a photo snap or screenshot to share with your AI tutor"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 hover:border-emerald-600 hover:text-emerald-800 text-xs font-medium transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
              >
                <Camera className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">Snap / Screenshot</span>
              </button>

              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={
                  voiceMode === "live" && callStatus === "connected"
                    ? "Send a formula or note into your live voice call..."
                    : `Ask ${activeTutor.name} about ${activeTopicLabel}...`
                }
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[44px]"
              />

              <button
                type="submit"
                disabled={!textInput.trim() || isSendingTurn}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-medium hover:bg-emerald-800 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
              >
                {isSendingTurn ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Ask
              </button>
            </form>
          </section>

          {/* Full-Width Study Workspace: Board & Work Pad Side-by-Side */}
          <div id="study-panel" ref={studyPanelRef}>
            <RightStudyPanel
              activeTab={rightTab}
              onTabChange={setRightTab}
              wingMode="school"
              tutor={activeTutor}
              profile={effectiveProfile}
              activeTopic={activeTopic}
              customTopic={customTopic}
              onCustomTopicChange={setCustomTopic}
              onSelectTopic={handleSelectTopic}
              blackboard={blackboard}
              blackboardLoading={blackboardLoading}
              blackboardError={blackboardError}
              onRefreshBlackboard={() => void handleRefreshBlackboard()}
              onSaveBlackboard={handleSaveBlackboard}
              onAskTutorText={(prompt) => void handleSendTextOrTurn(prompt)}
              quizQuestions={quizQuestions}
              quizLoading={quizLoading}
              quizError={quizError}
              onGenerateQuiz={() => void handleGenerateQuiz()}
              onRecordQuizAnswer={handleRecordQuizAnswer}
              onAskTutorAboutWeakness={handleAskTutorAboutWeakness}
              onRemoveWeakness={handleRemoveWeakness}
              onClearAllWeaknesses={handleClearAllWeaknesses}
              onSpeakText={(text, id) => void handleSpeakText(text, id)}
              speakingId={speakingId}
              progress={progress}
              onLoadSavedNote={(note) => {
                setBlackboard(note);
                setRightTab("blackboard");
              }}
              onDeleteSavedNote={(id) => {
                setProgress((prev) => ({
                  ...prev,
                  savedNotes: prev.savedNotes.filter((n) => n.id !== id),
                }));
              }}
              onResetProgress={() => setProgress(DEFAULT_PROGRESS)}
              onSendPadToTutor={(imageBase64) =>
                void handleSendPadToTutor(imageBase64)
              }
              sendingPadToTutor={isSendingTurn}
              liveCallActive={
                voiceMode === "live" && callStatus === "connected"
              }
              onStartMonthlyTest={(test) => {
                setCustomTopic(test.title);
                setRightTab("blackboard");
                void handleSendTextOrTurn(
                  `Help me prepare and test me step-by-step on ${test.title} for ${test.subject} (${test.grade}).`
                );
              }}
              onOpenSnapModal={() => setSnapModalOpen(true)}
            />
          </div>
        </div>
          </>
        )}
        {/* Discreet Platform Footer */}
        <footer className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Kasukulu — Personalized AI Voice Tutors for Zambian Learners (Grades 7, 9, 12 &amp; A-Level)
          </div>
          <div className="flex items-center gap-3">
            <span>Free Zambian Curriculum Access</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => navigateAppView("admin")}
              className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              {isAdmin ? "Admin Console" : "Staff Portal"}
            </button>
          </div>
        </footer>
      </main>

      <SnapModal
        open={snapModalOpen}
        onClose={() => setSnapModalOpen(false)}
        tutor={activeTutor}
        liveCallActive={voiceMode === "live" && callStatus === "connected"}
        onSendSnap={handleSendSnapToTutor}
        sending={isSendingSnap}
      />

      <ProfileModal
        open={profileOpen}
        profile={profile}
        isAdmin={isAdmin}
        onOpenAdmin={() => navigateAppView("admin")}
        onChange={(next) => {
          const prevGrade = profile.grade;
          setProfile(next);
          if (next.grade === "A-Level" && prevGrade !== "A-Level") {
            navigateAppView("alevel", "blackboard");
          } else if (next.grade !== "A-Level" && prevGrade === "A-Level") {
            navigateAppView("home");
          }
        }}
        onClose={() => setProfileOpen(false)}
        onSwitchLearner={() => {
          stopLiveCall();
          stopTtsPlayback();
          setProfileOpen(false);
          try {
            localStorage.removeItem(ONBOARDED_STORAGE_KEY);
          } catch {
            // ignore
          }
          setIsReturningLearner(false);
          setHasOnboarded(false);
        }}
      />
    </div>
  );
}
