import { useState } from "react";
import {
  ChevronRight,
  Flame,
  Music,
  Pause,
  Play,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  STUDY_TRACKS,
  type StudyTrackId,
  type TrackMood,
} from "../utils/studyMusicEngine";

interface StudyMusicBarProps {
  musicEnabled: boolean;
  isPlaying: boolean;
  inLiveVoiceClass: boolean;
  isRecordingClip: boolean;
  isDucked: boolean;
  trackId: StudyTrackId;
  volume: number;
  onToggleMusic: () => void;
  onSelectTrack: (trackId: StudyTrackId) => void;
  onVolumeChange: (volume: number) => void;
}

export function StudyMusicBar({
  musicEnabled,
  isPlaying,
  inLiveVoiceClass,
  isRecordingClip,
  isDucked,
  trackId,
  volume,
  onToggleMusic,
  onSelectTrack,
  onVolumeChange,
}: StudyMusicBarProps) {
  const [filterMood, setFilterMood] = useState<"all" | TrackMood>("all");

  const activeTrack =
    STUDY_TRACKS.find((t) => t.id === trackId) ?? STUDY_TRACKS[0];

  const displayedTracks =
    filterMood === "all"
      ? STUDY_TRACKS
      : STUDY_TRACKS.filter((t) => t.mood === filterMood);

  const statusText = inLiveVoiceClass
    ? "Paused during Live Voice Class"
    : isRecordingClip
    ? "Paused while recording question"
    : musicEnabled && isPlaying
    ? isDucked
      ? `${activeTrack.name} · Lowered for tutor voice`
      : `${activeTrack.name} · ${activeTrack.subtitle}`
    : musicEnabled
    ? "Ready · Tap Play to start encouraging background study vibes"
    : "Off · Encouraging Zambian study soundscapes";

  const handleNextTrack = () => {
    const currentIndex = STUDY_TRACKS.findIndex((t) => t.id === trackId);
    const nextIndex = (currentIndex + 1) % STUDY_TRACKS.length;
    onSelectTrack(STUDY_TRACKS[nextIndex].id);
  };

  return (
    <div
      role="region"
      aria-label="Study Music Controls"
      className="border-b border-slate-200 bg-white/95 backdrop-blur-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Play/Pause + Status */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleMusic}
            disabled={inLiveVoiceClass}
            aria-label={
              inLiveVoiceClass
                ? "Study music paused during Live Voice Class"
                : musicEnabled && isPlaying
                ? "Pause study music"
                : "Play study music"
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 min-h-[34px] cursor-pointer ${
              inLiveVoiceClass
                ? "bg-amber-50 text-amber-800 border border-amber-200 cursor-not-allowed"
                : musicEnabled && isPlaying
                ? "bg-emerald-700 text-white hover:bg-emerald-800"
                : "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            {inLiveVoiceClass ? (
              <Pause className="w-3.5 h-3.5" />
            ) : musicEnabled && isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span>
              {inLiveVoiceClass
                ? "Paused in Call"
                : musicEnabled && isPlaying
                ? "Pause Music"
                : "Play Music"}
            </span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                musicEnabled && isPlaying && !inLiveVoiceClass
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
              aria-hidden="true"
            >
              {musicEnabled && isPlaying && !inLiveVoiceClass ? (
                <span className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 h-2 bg-emerald-600 rounded-full animate-pulse" />
                  <span className="w-0.5 h-3 bg-emerald-700 rounded-full animate-pulse" />
                  <span className="w-0.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
                </span>
              ) : (
                <Music className="w-3.5 h-3.5" />
              )}
            </span>
            <div className="truncate flex items-center gap-1.5">
              {activeTrack.mood === "encouraging" && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/80 shrink-0">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Encouraging
                </span>
              )}
              <span
                className={`text-xs truncate ${
                  inLiveVoiceClass
                    ? "text-amber-800 font-medium"
                    : "text-slate-600"
                }`}
              >
                {statusText}
              </span>
            </div>
          </div>
        </div>

        {/* Track Picker + Mood Filter + Volume */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mood Filter Tabs */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/90 text-[11px] font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setFilterMood("all")}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all duration-150 whitespace-nowrap ${
                filterMood === "all"
                  ? "bg-emerald-700 text-white shadow-2xs font-semibold"
                  : "hover:text-slate-900 hover:bg-white/70"
              }`}
            >
              All ({STUDY_TRACKS.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMood("encouraging")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg cursor-pointer transition-all duration-150 whitespace-nowrap ${
                filterMood === "encouraging"
                  ? "bg-amber-500 text-slate-950 shadow-2xs font-semibold"
                  : "hover:text-amber-800 hover:bg-white/70"
              }`}
            >
              <Sparkles
                className={`w-3 h-3 ${
                  filterMood === "encouraging" ? "text-slate-950" : "text-amber-600"
                }`}
              />
              Encouraging (4)
            </button>
            <button
              type="button"
              onClick={() => setFilterMood("calm")}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all duration-150 whitespace-nowrap ${
                filterMood === "calm"
                  ? "bg-slate-900 text-white shadow-2xs font-semibold"
                  : "hover:text-slate-900 hover:bg-white/70"
              }`}
            >
              Calm & Lo-Fi (3)
            </button>
          </div>

          {/* Track List */}
          <div
            role="group"
            aria-label="Study music track"
            className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/90 overflow-x-auto max-w-[340px] sm:max-w-[480px] no-scrollbar"
          >
            {displayedTracks.map((track) => {
              const selected = track.id === trackId;
              const isEncouraging = track.mood === "encouraging";
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => onSelectTrack(track.id)}
                  title={track.subtitle}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-150 whitespace-nowrap cursor-pointer shrink-0 ${
                    selected
                      ? isEncouraging
                        ? "bg-amber-500 text-slate-950 shadow-xs font-semibold"
                        : "bg-emerald-700 text-white shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                  }`}
                >
                  {isEncouraging && (
                    <Sparkles
                      className={`w-3 h-3 ${
                        selected ? "text-slate-950" : "text-amber-600"
                      }`}
                    />
                  )}
                  <span>{track.name}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Next Track */}
          <button
            type="button"
            onClick={handleNextTrack}
            title="Next Track"
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-slate-200">
            <button
              type="button"
              onClick={() => onVolumeChange(volume > 0 ? 0 : 0.35)}
              aria-label={
                volume === 0 ? "Unmute study music" : "Mute study music"
              }
              className="p-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              {volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={Math.round(volume * 100)}
              onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
              aria-label="Study music volume"
              className="w-16 sm:w-20 accent-emerald-700 cursor-pointer"
            />
            <span className="text-[11px] font-mono text-slate-500 tabular-nums w-7 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
