import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  Check,
  ChevronRight,
  FlipHorizontal,
  Image as ImageIcon,
  Loader2,
  Monitor,
  RefreshCw,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import type { TutorPersona } from "../data/curriculum";

export interface SnapData {
  base64: string;
  mimeType: string;
  dataUrl: string;
  prompt: string;
}

interface SnapModalProps {
  open: boolean;
  onClose: () => void;
  tutor: TutorPersona;
  liveCallActive: boolean;
  onSendSnap: (snap: SnapData) => Promise<void> | void;
  sending?: boolean;
}

type TabMode = "camera" | "screen" | "upload";

const PROMPT_SUGGESTIONS = [
  "Please solve this question step-by-step",
  "Is my working in this photo correct?",
  "Explain the formula or diagram shown here",
  "What is the ECZ marking scheme for this question?",
];

export function SnapModal({
  open,
  onClose,
  tutor,
  liveCallActive,
  onSendSnap,
  sending = false,
}: SnapModalProps) {
  const [activeTab, setActiveTab] = useState<TabMode>("camera");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedMimeType, setCapturedMimeType] = useState<string>("image/jpeg");
  const [promptText, setPromptText] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [isCapturingScreen, setIsCapturingScreen] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  // Start camera stream for live snap
  const startCamera = useCallback(async (mode: "environment" | "user") => {
    stopCamera();
    setCameraError(null);
    setCameraReady(false);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera is not supported on this browser or device.");
      }

      // Try preferred facingMode, fallback to generic video
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
        setCameraReady(true);
      }
    } catch (err) {
      console.warn("Camera init error:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Camera permission denied or camera unavailable.";
      setCameraError(
        `${msg} You can still capture a screenshot or upload an image file.`
      );
    }
  }, [stopCamera]);

  // Manage camera lifecycle based on activeTab and open state
  useEffect(() => {
    if (!open) {
      stopCamera();
      setCapturedImage(null);
      setCameraError(null);
      setScreenError(null);
      return;
    }

    if (activeTab === "camera" && !capturedImage) {
      void startCamera(facingMode);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [open, activeTab, capturedImage, facingMode, startCamera, stopCamera]);

  // Handle clipboard paste (e.g. Snipping tool, screenshots)
  useEffect(() => {
    if (!open) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            processFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [open]);

  // Flip front / back camera
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    void startCamera(nextMode);
  };

  // Capture frame from active camera
  const handleCaptureCamera = () => {
    const video = videoRef.current;
    if (!video || !cameraReady) return;

    const canvas = document.createElement("canvas");
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(dataUrl);
    setCapturedMimeType("image/jpeg");
    stopCamera();
  };

  // Capture screen/window using getDisplayMedia
  const handleCaptureScreen = async () => {
    setScreenError(null);
    setIsCapturingScreen(true);

    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error(
          "Screen capture is not supported on this browser. Please use Camera Snap or Upload Photo."
        );
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser",
        },
        audio: false,
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      // Wait a moment for frame rendering
      await new Promise((r) => setTimeout(r, 200));

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        setCapturedImage(dataUrl);
        setCapturedMimeType("image/jpeg");
      }

      for (const track of stream.getTracks()) {
        track.stop();
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "NotAllowedError") {
        setScreenError(err.message || "Failed to capture screen.");
      }
    } finally {
      setIsCapturingScreen(false);
    }
  };

  // Process uploaded or pasted image file
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawResult = e.target?.result as string;
      if (!rawResult) return;

      // Rescale down if resolution is unnecessarily massive (e.g. > 2400px)
      const img = new Image();
      img.onload = () => {
        const maxDim = 2048;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
            setCapturedImage(dataUrl);
            setCapturedMimeType("image/jpeg");
            return;
          }
        }
        setCapturedImage(rawResult);
        setCapturedMimeType(file.type || "image/jpeg");
      };
      img.src = rawResult;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    if (e.target) {
      e.target.value = "";
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCameraError(null);
    setScreenError(null);
    if (activeTab === "camera") {
      void startCamera(facingMode);
    }
  };

  const handleSend = async () => {
    if (!capturedImage) return;

    const commaIdx = capturedImage.indexOf(",");
    const base64 =
      commaIdx >= 0 ? capturedImage.slice(commaIdx + 1) : capturedImage;

    const cleanPrompt =
      promptText.trim() || "Please inspect this snap and guide me step-by-step.";

    await onSendSnap({
      base64,
      mimeType: capturedMimeType,
      dataUrl: capturedImage,
      prompt: cleanPrompt,
    });

    handleClose();
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setPromptText("");
    onClose();
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="snap-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="snap-modal-title"
                className="text-base font-semibold text-slate-900"
              >
                Snap & Share with {tutor.name}
              </h2>
              <p className="text-xs text-slate-500">
                Take a snap of your textbook, past paper, homework, or capture your screen
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!capturedImage ? (
            <>
              {/* Tab Selector */}
              <div
                role="tablist"
                aria-label="Capture source"
                className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200/90 rounded-xl shadow-2xs"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "camera"}
                  onClick={() => setActiveTab("camera")}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    activeTab === "camera"
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                  }`}
                >
                  <Camera
                    className={`w-4 h-4 ${
                      activeTab === "camera" ? "text-amber-300" : "text-emerald-700"
                    }`}
                  />
                  <span>Camera Snap</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "screen"}
                  onClick={() => setActiveTab("screen")}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    activeTab === "screen"
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                  }`}
                >
                  <Monitor
                    className={`w-4 h-4 ${
                      activeTab === "screen" ? "text-amber-300" : "text-emerald-700"
                    }`}
                  />
                  <span>Screenshot</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "upload"}
                  onClick={() => setActiveTab("upload")}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    activeTab === "upload"
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                  }`}
                >
                  <Upload
                    className={`w-4 h-4 ${
                      activeTab === "upload" ? "text-amber-300" : "text-emerald-700"
                    }`}
                  />
                  <span>Upload / Paste</span>
                </button>
              </div>

              {/* Mode: Camera Viewfinder */}
              {activeTab === "camera" && (
                <div className="space-y-3">
                  <div className="relative rounded-2xl bg-slate-950 overflow-hidden aspect-4/3 flex items-center justify-center border border-slate-800 shadow-inner">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className={`w-full h-full object-cover ${
                        facingMode === "user" ? "scale-x-[-1]" : ""
                      }`}
                    />

                    {/* Viewfinder Target Guidelines */}
                    {cameraReady && (
                      <div className="pointer-events-none absolute inset-6 sm:inset-10 border-2 border-dashed border-emerald-400/60 rounded-xl flex items-center justify-center">
                        <span className="text-[11px] font-medium text-emerald-200/90 bg-slate-950/60 px-2.5 py-1 rounded-md backdrop-blur-xs">
                          Align question or written work inside frame
                        </span>
                      </div>
                    )}

                    {/* Camera Top Controls */}
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleToggleFacingMode}
                        title="Switch Front/Back Camera"
                        className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-xs border border-white/10 transition-colors shadow-sm"
                      >
                        <FlipHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {!cameraReady && !cameraError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-2 bg-slate-950/80">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                        <span className="text-xs">Starting camera...</span>
                      </div>
                    )}

                    {cameraError && (
                      <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-slate-950/95 space-y-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                          <Camera className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-amber-200 max-w-sm leading-relaxed">
                          {cameraError}
                        </p>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => startCamera(facingMode)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-white hover:bg-slate-700"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Retry Camera
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab("upload")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-xs font-medium text-white hover:bg-emerald-800"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Upload Instead
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Shutter Action Bar */}
                  <div className="flex items-center justify-center pt-2">
                    <button
                      type="button"
                      onClick={handleCaptureCamera}
                      disabled={!cameraReady}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-semibold shadow-lg shadow-emerald-900/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                    >
                      <Camera className="w-5 h-5" />
                      Take Snap Now
                    </button>
                  </div>
                </div>
              )}

              {/* Mode: Screen Capture / Screenshot */}
              {activeTab === "screen" && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Capture Any Screen, Window, or Tab
                    </h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                      Snap a question directly from an ECZ online past paper, PDF document, digital textbook, or notes on your screen.
                    </p>
                  </div>

                  {screenError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 max-w-md mx-auto">
                      {screenError}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleCaptureScreen}
                      disabled={isCapturingScreen}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-medium hover:bg-emerald-800 disabled:opacity-50 transition-colors shadow-xs"
                    >
                      {isCapturingScreen ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Selecting Screen...
                        </>
                      ) : (
                        <>
                          <Monitor className="w-4 h-4" />
                          Capture Screenshot
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Mode: File Upload or Clipboard Paste */}
              {activeTab === "upload" && (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) processFile(file);
                  }}
                  className="rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-600 bg-slate-50/70 p-8 text-center space-y-3 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-900">
                      Choose a photo or drop it here
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports JPG, PNG, WEBP · You can also press{" "}
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-[10px]">
                        Ctrl+V
                      </kbd>{" "}
                      to paste
                    </p>
                  </div>
                  <div className="pt-1">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-700" />
                      Browse Files
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Review & Send State */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800 inline-flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <Check className="w-3.5 h-3.5" />
                  Snap Captured Ready
                </span>
                <button
                  type="button"
                  onClick={handleRetake}
                  disabled={sending}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retake / Choose Another
                </button>
              </div>

              {/* Preview Image */}
              <div className="relative rounded-2xl border border-slate-200 bg-slate-900 overflow-hidden max-h-[300px] flex items-center justify-center">
                <img
                  src={capturedImage}
                  alt="Captured study snap"
                  className="w-full h-auto max-h-[300px] object-contain"
                />
              </div>

              {/* Custom Prompt & Questions for Tutor */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  What would you like {tutor.name} to help you with?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="e.g. Please solve question 3 and show me the formula..."
                    className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PROMPT_SUGGESTIONS.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPromptText(suggestion)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 text-slate-600 transition-colors border border-slate-200 text-left"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Context Banner */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 flex items-start gap-2.5 text-xs text-emerald-950">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">
                    {liveCallActive
                      ? "Live Voice Call Active"
                      : "Voice Studio Ready"}
                  </span>
                  <p className="text-[11px] text-emerald-900 mt-0.5 leading-relaxed">
                    {liveCallActive
                      ? `${tutor.name} will inspect this snap live on the call, explain the steps aloud, and update your blackboard.`
                      : `${tutor.name} will analyze this snap, speak the solution, and write the formulas on the blackboard.`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={sending}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          {capturedImage && (
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Snap to {tutor.name}...
                </>
              ) : (
                <>
                  <span>Send Snap to {tutor.name}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
