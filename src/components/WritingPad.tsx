import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Eraser, Maximize2, Move, PenTool, Send, Sliders, Trash2, Undo2 } from "lucide-react";

type PaperStyle = "ruled" | "grid" | "blank";
type InteractionMode = "pen" | "scroll";

interface Stroke {
  points: Array<{ x: number; y: number }>;
  color: string;
  width: number;
  isEraser: boolean;
}

interface WritingPadProps {
  onSendToTutor: (imageBase64: string) => void;
  sendingToTutor?: boolean;
  liveCallActive?: boolean;
  onOpenSnapModal?: () => void;
}

const INK_COLORS = [
  { label: "Dark Ink", hex: "#0F172A" },
  { label: "Emerald", hex: "#047857" },
  { label: "Copper", hex: "#B45309" },
  { label: "Red", hex: "#DC2626" },
];

export function WritingPad({
  onSendToTutor,
  sendingToTutor = false,
  liveCallActive = false,
  onOpenSnapModal,
}: WritingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const activeStrokeRef = useRef<Stroke | null>(null);
  const isDrawingRef = useRef(false);

  const [inkColor, setInkColor] = useState("#0F172A");
  const [isEraser, setIsEraser] = useState(false);
  const [paperStyle, setPaperStyle] = useState<PaperStyle>("ruled");
  const [neatAssist, setNeatAssist] = useState(true);
  const [strokeCount, setStrokeCount] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(900);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>("pen");

  const drawPaperAndStrokes = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      style: PaperStyle,
      allStrokes: Stroke[],
      pendingStroke: Stroke | null
    ) => {
      // Crisp professional Canva-style white notebook surface
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      // Background ruling or math grid (repeating down the full scrollable height)
      if (style === "ruled") {
        ctx.strokeStyle = "#E2E8F0";
        ctx.lineWidth = 1;
        const step = 32;
        for (let y = step; y < height; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        // Subtle margin line
        ctx.strokeStyle = "#FECACA";
        ctx.beginPath();
        ctx.moveTo(40, 0);
        ctx.lineTo(40, height);
        ctx.stroke();
      } else if (style === "grid") {
        ctx.strokeStyle = "#E2E8F0";
        ctx.lineWidth = 1;
        const step = 24;
        for (let x = step; x < width; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = step; y < height; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      const renderStroke = (stroke: Stroke) => {
        if (stroke.points.length === 0) return;
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = stroke.isEraser ? "#FFFFFF" : stroke.color;
        ctx.lineWidth = stroke.isEraser ? 20 : stroke.width;

        if (stroke.points.length === 1) {
          const p = stroke.points[0];
          ctx.fillStyle = stroke.isEraser ? "#FFFFFF" : stroke.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, (stroke.isEraser ? 20 : stroke.width) / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length - 1; i++) {
            const midX = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
            const midY = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
            ctx.quadraticCurveTo(
              stroke.points[i].x,
              stroke.points[i].y,
              midX,
              midY
            );
          }
          const last = stroke.points[stroke.points.length - 1];
          ctx.lineTo(last.x, last.y);
          ctx.stroke();
        }
        ctx.restore();
      };

      for (const s of allStrokes) {
        renderStroke(s);
      }
      if (pendingStroke) {
        renderStroke(pendingStroke);
      }
    },
    []
  );

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawPaperAndStrokes(
      ctx,
      width,
      height,
      paperStyle,
      strokesRef.current,
      activeStrokeRef.current
    );
    ctx.restore();
  }, [drawPaperAndStrokes, paperStyle]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(280, Math.floor(rect.width));
      const h = canvasHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      redraw();
    };

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(container);
    return () => observer.disconnect();
  }, [redraw, canvasHeight]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const checkExpandCanvas = (yCoord: number) => {
    if (yCoord > canvasHeight - 180) {
      setCanvasHeight((prev) => prev + 400);
    }
  };

  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    checkExpandCanvas(y);

    if (neatAssist && paperStyle === "ruled" && !isEraser) {
      const lineSpacing = 32;
      const nearestLine = Math.round(y / lineSpacing) * lineSpacing;
      if (Math.abs(y - nearestLine) < 8) {
        y = nearestLine;
      }
    }

    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (interactionMode === "scroll") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const pos = getPointerPos(e);
    activeStrokeRef.current = {
      points: [pos],
      color: inkColor,
      width: 2.5,
      isEraser,
    };
    redraw();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (interactionMode === "scroll") return;
    if (!isDrawingRef.current || !activeStrokeRef.current) return;
    const pos = getPointerPos(e);
    const pts = activeStrokeRef.current.points;

    if (neatAssist && pts.length > 0 && !isEraser) {
      const last = pts[pts.length - 1];
      const smoothedX = last.x * 0.4 + pos.x * 0.6;
      const smoothedY = last.y * 0.4 + pos.y * 0.6;
      activeStrokeRef.current.points.push({ x: smoothedX, y: smoothedY });
    } else {
      activeStrokeRef.current.points.push(pos);
    }

    redraw();
  };

  const finishStroke = () => {
    if (interactionMode === "scroll") return;
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (activeStrokeRef.current && activeStrokeRef.current.points.length > 0) {
      strokesRef.current = [...strokesRef.current, activeStrokeRef.current];
      setStrokeCount(strokesRef.current.length);
    }
    activeStrokeRef.current = null;
    redraw();
  };

  const handleUndo = () => {
    if (strokesRef.current.length === 0) return;
    strokesRef.current = strokesRef.current.slice(0, -1);
    setStrokeCount(strokesRef.current.length);
    redraw();
  };

  const handleClear = () => {
    strokesRef.current = [];
    activeStrokeRef.current = null;
    setStrokeCount(0);
    redraw();
  };

  const handleExtendPage = () => {
    setCanvasHeight((prev) => prev + 400);
  };

  const handleSend = () => {
    const canvas = canvasRef.current;
    if (!canvas || strokeCount === 0) return;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const commaIdx = dataUrl.indexOf(",");
    const base64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
    onSendToTutor(base64);
  };

  return (
    <div className="space-y-3">
      {/* Pad Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {INK_COLORS.map((c) => {
            const active = !isEraser && inkColor === c.hex;
            return (
              <button
                key={c.hex}
                type="button"
                onClick={() => {
                  setIsEraser(false);
                  setInkColor(c.hex);
                }}
                aria-label={`Select ${c.label} pen`}
                className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                  active
                    ? "border-slate-900 bg-slate-100 ring-1 ring-slate-900"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: c.hex }}
                />
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setIsEraser((prev) => !prev)}
            aria-label="Eraser"
            className={`inline-flex items-center gap-1 px-2.5 h-8 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
              isEraser
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            Eraser
          </button>

          {/* Pen vs Scroll Mode Toggle */}
          <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setInteractionMode("pen")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                interactionMode === "pen"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <PenTool className="w-3 h-3 text-emerald-700" />
              <span>Pen</span>
            </button>
            <button
              type="button"
              onClick={() => setInteractionMode("scroll")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                interactionMode === "scroll"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Move className="w-3 h-3 text-slate-700" />
              <span>Scroll</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setNeatAssist((prev) => !prev)}
            title="Straight & standard Canva-like handwriting stabilization"
            className={`inline-flex items-center gap-1 px-2.5 h-8 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
              neatAssist
                ? "border-emerald-700 bg-emerald-50 text-emerald-900 font-semibold"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-700" />
            <span>Neat / Straight</span>
          </button>

          <button
            type="button"
            onClick={handleUndo}
            disabled={strokeCount === 0}
            aria-label="Undo last stroke"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={strokeCount === 0}
            aria-label="Clear writing pad"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleExtendPage}
            title="Extend writing page height by 400px"
            className="inline-flex items-center gap-1 px-2.5 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors whitespace-nowrap"
          >
            <Maximize2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>+ Page</span>
          </button>
        </div>

        {/* Paper Style Switcher */}
        <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-lg">
          {(["ruled", "grid", "blank"] as const).map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setPaperStyle(style)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-colors whitespace-nowrap ${
                paperStyle === style
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Interactive Touch & Mouse Pad */}
      <div
        ref={containerRef}
        className="relative rounded-xl border border-slate-300 bg-white overflow-y-auto max-h-[520px] sm:max-h-[620px] shadow-2xs custom-scrollbar"
      >
        <div style={{ height: `${canvasHeight}px`, width: "100%", position: "relative" }}>
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishStroke}
            onPointerCancel={finishStroke}
            className={`block ${interactionMode === "pen" ? "touch-none cursor-crosshair" : "cursor-grab"} select-none absolute top-0 left-0`}
          />
        </div>
        {strokeCount === 0 && (
          <div className="pointer-events-none absolute inset-x-0 top-12 flex justify-center text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5 bg-white/95 px-3.5 py-2 rounded-lg border border-slate-200 shadow-xs">
              <PenTool className="w-3.5 h-3.5 text-emerald-700" />
              Scroll down or write in full — vertical writing space auto-expands
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[11px] text-slate-500">
          {liveCallActive
            ? "Your tutor inspects your full written work live during the call."
            : "Scroll to write long math derivations or essays in full, then show your tutor."}
        </span>
        <div className="flex items-center gap-2">
          {onOpenSnapModal && (
            <button
              type="button"
              onClick={onOpenSnapModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors whitespace-nowrap shrink-0"
              title="Take a photo snap or screenshot of textbook or past paper"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-700" />
              <span>Snap Question</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleSend}
            disabled={strokeCount === 0 || sendingToTutor}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            {sendingToTutor ? "Checking..." : "Show Pad to Tutor"}
          </button>
        </div>
      </div>
    </div>
  );
}
