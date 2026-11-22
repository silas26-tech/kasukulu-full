import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { TUTOR_IMAGES } from "../data/tutorImages";

interface TutorPortraitProps {
  tutorId: string;
  name: string;
  sizeClass?: string;
}

export function TutorPortrait({
  tutorId,
  name,
  sizeClass = "w-12 h-12",
}: TutorPortraitProps) {
  const [hasError, setHasError] = useState(false);
  const src = TUTOR_IMAGES[tutorId];

  if (!src || hasError) {
    return (
      <div
        className={`${sizeClass} shrink-0 rounded-xl bg-emerald-900/15 border border-emerald-700/20 flex items-center justify-center text-emerald-800`}
        aria-label={name}
      >
        <GraduationCap className="w-5 h-5" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`${sizeClass} shrink-0 rounded-xl object-cover border border-slate-200 bg-slate-100`}
    />
  );
}
