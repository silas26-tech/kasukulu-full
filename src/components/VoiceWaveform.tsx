import { useMemo } from "react";

interface VoiceWaveformProps {
  active: boolean;
  speaker: "idle" | "learner" | "tutor";
  level: number;
}

const BAR_WEIGHTS = [
  0.28, 0.45, 0.65, 0.85, 0.55, 0.95, 0.72, 1.0, 0.8, 0.6, 0.9, 0.5, 0.75,
  0.4, 0.3,
];

export function VoiceWaveform({ active, speaker, level }: VoiceWaveformProps) {
  const bars = useMemo(() => {
    const effective = active ? Math.max(0.14, Math.min(1, level)) : 0.08;
    return BAR_WEIGHTS.map((weight, idx) => {
      const waveOffset = Math.sin(idx * 0.9 + effective * 6) * 0.15;
      const heightPct = Math.round(
        Math.max(14, Math.min(96, (effective * weight + Math.abs(waveOffset) * effective) * 100))
      );
      return heightPct;
    });
  }, [active, level]);

  const barColor =
    speaker === "tutor"
      ? "bg-emerald-400"
      : speaker === "learner"
      ? "bg-amber-400"
      : "bg-slate-600";

  return (
    <div
      className="flex items-center justify-center gap-1.5 h-12"
      aria-hidden="true"
    >
      {bars.map((heightPct, i) => (
        <span
          key={i}
          className={`w-1.5 rounded-full transition-[height,background-color] duration-150 ${barColor}`}
          style={{ height: `${heightPct}%` }}
        />
      ))}
    </div>
  );
}
