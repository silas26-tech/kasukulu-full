// Remembers the last answer box the learner tapped, so the symbol bar and the calculator
// can put text into it (at the cursor) even though tapping a button moves focus away.

type Field = HTMLInputElement | HTMLTextAreaElement;

let lastField: Field | null = null;
let installed = false;

function isAnswerField(el: EventTarget | null): el is Field {
  return (
    (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) &&
    el.dataset.answerField === "true"
  );
}

export function installAnswerFieldTracking(): void {
  if (installed || typeof document === "undefined") return;
  installed = true;
  document.addEventListener("focusin", (e) => {
    if (isAnswerField(e.target)) lastField = e.target;
  });
}

export function hasAnswerField(): boolean {
  return !!lastField && document.contains(lastField) && !lastField.disabled && !lastField.readOnly;
}

/** Inserts text at the cursor of the last answer box. Returns false when there is no box to use. */
export function insertIntoAnswerField(text: string): boolean {
  const el = lastField;
  if (!el || !document.contains(el) || el.disabled || el.readOnly) return false;
  const value = el.value;
  const start = el.selectionStart ?? value.length;
  const end = el.selectionEnd ?? value.length;
  const next = value.slice(0, start) + text + value.slice(end);
  if (el.maxLength > 0 && next.length > el.maxLength) return false;
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (!setter) return false;
  // Use the native setter and an input event so React controlled boxes update their state.
  setter.call(el, next);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  const pos = start + text.length;
  try {
    el.focus({ preventScroll: true });
    el.setSelectionRange(pos, pos);
  } catch {
    // ignore
  }
  return true;
}
