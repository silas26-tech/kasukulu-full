import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CornerDownLeft,
  Delete,
  Keyboard,
  Send,
  Space,
  Trash2,
} from "lucide-react";
import { SymbolBar } from "./SymbolBar";

interface WrittenAnswerPadProps {
  subjectLabel: string;
  questionPrompt?: string | null;
  liveCallActive?: boolean;
  sendingToTutor?: boolean;
  autoOpenKeyboard?: boolean;
  focusSignal?: number;
  onSubmitAnswer: (answerText: string) => void;
  onOpenSnapModal?: () => void;
}

const SYMBOL_KEYS = [
  "=",
  "+",
  "-",
  "(",
  ")",
  "/",
  "%",
  "°",
  "→",
  "⇌",
  "²",
  "³",
  "₂",
  ":",
  ";",
  "'",
  '"',
];

const NUMBER_ROW = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const QWERTY_ROW_1 = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"];
const QWERTY_ROW_2 = ["a", "s", "d", "f", "g", "h", "j", "k", "l"];
const QWERTY_ROW_3 = ["z", "x", "c", "v", "b", "n", "m"];

export function WrittenAnswerPad({
  subjectLabel,
  questionPrompt,
  liveCallActive = false,
  sendingToTutor = false,
  autoOpenKeyboard = true,
  focusSignal = 0,
  onSubmitAnswer,
  onOpenSnapModal,
}: WrittenAnswerPadProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [keyboardOpen, setKeyboardOpen] = useState(autoOpenKeyboard);
  const [shiftActive, setShiftActive] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    if (autoOpenKeyboard) {
      setKeyboardOpen(true);
    }
  }, [autoOpenKeyboard]);

  useEffect(() => {
    if (focusSignal > 0 || autoOpenKeyboard) {
      setKeyboardOpen(true);
      const timer = window.setTimeout(() => {
        textareaRef.current?.focus();
      }, 40);
      return () => window.clearTimeout(timer);
    }
  }, [focusSignal, autoOpenKeyboard]);

  const insertAtCursor = (token: string) => {
    const el = textareaRef.current;
    setJustSubmitted(false);
    if (!el) {
      setAnswerText((prev) => prev + token);
      return;
    }

    const start = el.selectionStart ?? answerText.length;
    const end = el.selectionEnd ?? answerText.length;
    const nextValue =
      answerText.slice(0, start) + token + answerText.slice(end);
    setAnswerText(nextValue);

    const nextCaret = start + token.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const handleLetterPress = (lowerLetter: string) => {
    const useUpper = capsLock || shiftActive;
    const char = useUpper ? lowerLetter.toUpperCase() : lowerLetter;
    insertAtCursor(char);
    if (shiftActive && !capsLock) {
      setShiftActive(false);
    }
  };

  const handleBackspace = () => {
    const el = textareaRef.current;
    setJustSubmitted(false);
    if (!el) {
      setAnswerText((prev) => prev.slice(0, -1));
      return;
    }
    const start = el.selectionStart ?? answerText.length;
    const end = el.selectionEnd ?? answerText.length;
    if (start === 0 && end === 0) {
      el.focus();
      return;
    }
    let nextValue: string;
    let nextCaret: number;
    if (start !== end) {
      nextValue = answerText.slice(0, start) + answerText.slice(end);
      nextCaret = start;
    } else {
      nextValue = answerText.slice(0, start - 1) + answerText.slice(end);
      nextCaret = start - 1;
    }
    setAnswerText(nextValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const handleShiftPress = () => {
    if (capsLock) {
      setCapsLock(false);
      setShiftActive(false);
    } else if (shiftActive) {
      setCapsLock(true);
    } else {
      setShiftActive(true);
    }
  };

  const handleSubmit = () => {
    const clean = answerText.trim();
    if (!clean || sendingToTutor) return;
    onSubmitAnswer(clean);
    setJustSubmitted(true);
  };

  const wordCount = answerText.trim()
    ? answerText.trim().split(/\s+/).length
    : 0;

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-slate-600">
          <span className="font-medium text-slate-900">
            Written Answer Mode
          </span>
          <span aria-hidden="true"> · </span>
          <span className="tabular-nums">
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setKeyboardOpen((prev) => {
                const next = !prev;
                if (next) {
                  requestAnimationFrame(() => textareaRef.current?.focus());
                }
                return next;
              });
            }}
            className={`inline-flex items-center gap-1.5 px-2.5 h-8 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              keyboardOpen
                ? "border-emerald-700 bg-emerald-50 text-emerald-900 font-semibold"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Keyboard className="w-3.5 h-3.5 text-emerald-700" />
            <span>{keyboardOpen ? "Hide Keyboard" : "Open Keyboard"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAnswerText("");
              setJustSubmitted(false);
              textareaRef.current?.focus();
            }}
            disabled={!answerText}
            aria-label="Clear written answer"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {questionPrompt && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-700 leading-relaxed">
          <span className="font-semibold text-slate-900">Prompt: </span>
          {questionPrompt}
        </div>
      )}

      <SymbolBar subject={subjectLabel} />

      {/* Notebook-lined Answer Area */}
      <div className="rounded-xl border border-slate-300 bg-white overflow-hidden shadow-2xs focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-600/20">
        <textarea
          ref={textareaRef}
          data-answer-field="true"
          value={answerText}
          onChange={(e) => {
            setAnswerText(e.target.value);
            setJustSubmitted(false);
          }}
          inputMode="text"
          enterKeyHint="enter"
          rows={7}
          placeholder={`Write down your ${subjectLabel} answer here...`}
          className="w-full resize-y bg-transparent px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none leading-7"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, #E2E8F0 27px, #E2E8F0 28px)",
            backgroundPositionY: "11px",
          }}
        />
      </div>

      {/* Auto-Opened On-Screen Writing Keyboard */}
      {keyboardOpen && (
        <div
          aria-label="On-screen writing keyboard"
          className="rounded-xl border border-slate-200 bg-slate-100 p-2 sm:p-2.5 space-y-1.5 select-none"
        >
          {/* Quick Scientific / Punctuation / Code Symbols */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200/80">
            {SYMBOL_KEYS.map((sym) => (
              <button
                key={sym}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertAtCursor(sym)}
                className="min-w-[30px] h-7 px-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-200 text-xs font-mono font-medium text-slate-800 transition-colors shrink-0 cursor-pointer"
              >
                {sym}
              </button>
            ))}
          </div>

          {/* Row 1: Numbers */}
          <div className="grid grid-cols-10 gap-1">
            {NUMBER_ROW.map((num) => (
              <button
                key={num}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertAtCursor(num)}
                className="h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-200 text-xs font-mono font-semibold text-slate-900 shadow-2xs transition-colors cursor-pointer"
              >
                {num}
              </button>
            ))}
          </div>

          {/* Row 2: QWERTYUIOP */}
          <div className="grid grid-cols-10 gap-1">
            {QWERTY_ROW_1.map((letter) => (
              <button
                key={letter}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleLetterPress(letter)}
                className="h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-200 text-xs font-semibold text-slate-900 shadow-2xs transition-colors cursor-pointer"
              >
                {capsLock || shiftActive ? letter.toUpperCase() : letter}
              </button>
            ))}
          </div>

          {/* Row 3: ASDFGHJKL */}
          <div className="grid grid-cols-9 gap-1 px-2 sm:px-4">
            {QWERTY_ROW_2.map((letter) => (
              <button
                key={letter}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleLetterPress(letter)}
                className="h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-200 text-xs font-semibold text-slate-900 shadow-2xs transition-colors cursor-pointer"
              >
                {capsLock || shiftActive ? letter.toUpperCase() : letter}
              </button>
            ))}
          </div>

          {/* Row 4: Shift + ZXCVBNM + Backspace */}
          <div className="grid grid-cols-10 gap-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleShiftPress}
              aria-label="Shift or Caps Lock"
              className={`col-span-2 h-9 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
                capsLock
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : shiftActive
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-slate-200/80 text-slate-800 hover:bg-slate-200"
              }`}
            >
              {capsLock ? "CAPS" : "Shift"}
            </button>

            {QWERTY_ROW_3.map((letter) => (
              <button
                key={letter}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleLetterPress(letter)}
                className="h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-200 text-xs font-semibold text-slate-900 shadow-2xs transition-colors cursor-pointer"
              >
                {capsLock || shiftActive ? letter.toUpperCase() : letter}
              </button>
            ))}

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleBackspace}
              aria-label="Backspace"
              className="h-9 rounded-lg border border-slate-300 bg-slate-200/80 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Delete className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Row 5: Punctuation + Space + Enter */}
          <div className="grid grid-cols-12 gap-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertAtCursor(",")}
              className="col-span-2 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 cursor-pointer"
            >
              ,
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertAtCursor(" ")}
              aria-label="Space"
              className="col-span-6 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Space className="w-3.5 h-3.5 text-slate-400" />
              <span>Space</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertAtCursor(".")}
              className="col-span-1 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 cursor-pointer"
            >
              .
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertAtCursor("?")}
              className="col-span-1 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 cursor-pointer"
            >
              ?
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertAtCursor("\n")}
              aria-label="New line"
              className="col-span-2 h-9 rounded-lg border border-slate-300 bg-slate-200/80 hover:bg-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-center gap-1 cursor-pointer"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[11px] text-slate-500">
          {justSubmitted
            ? "Written answer sent to your tutor for marking."
            : liveCallActive
            ? "Submit your typed answer live during your voice class."
            : "Type your answer using your keyboard or the keys above, then send it for feedback."}
        </span>

        <div className="flex items-center gap-2">
          {onOpenSnapModal && (
            <button
              type="button"
              onClick={onOpenSnapModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Take a photo snap or screenshot of textbook or past paper"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-700" />
              <span>Snap Question</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!answerText.trim() || sendingToTutor}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            {sendingToTutor ? "Checking..." : "Submit Answer to Tutor"}
          </button>
        </div>
      </div>
    </div>
  );
}
