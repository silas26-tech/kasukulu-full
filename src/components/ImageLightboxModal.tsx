import { Download, X, ZoomIn } from "lucide-react";

interface ImageLightboxModalProps {
  imageUrl: string | null;
  caption?: string | null;
  onClose: () => void;
}

export function ImageLightboxModal({
  imageUrl,
  caption,
  onClose,
}: ImageLightboxModalProps) {
  if (!imageUrl) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image view"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top actions */}
        <div className="w-full flex items-center justify-between pb-3 text-white">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300 truncate">
            <ZoomIn className="w-4 h-4 text-emerald-400" />
            <span className="truncate">{caption || "Learner Study Snap"}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              download="kasukulu-study-snap.jpg"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors text-xs inline-flex items-center gap-1.5"
              title="Download Snap"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors"
              aria-label="Close image preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Full Image */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl max-h-[80vh] flex items-center justify-center">
          <img
            src={imageUrl}
            alt={caption || "Full resolution snap"}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
        </div>
      </div>
    </div>
  );
}
