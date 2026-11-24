import { useState } from "react";
import { RefreshCw } from "lucide-react";

interface RefreshButtonProps {
  /** True while a live voice call is running, so the learner is asked first. */
  callActive?: boolean;
}

function waitForActivation(reg: ServiceWorkerRegistration, ms: number): Promise<void> {
  return new Promise((resolve) => {
    const worker = reg.installing ?? reg.waiting;
    if (!worker || worker.state === "activated") {
      resolve();
      return;
    }
    const timer = window.setTimeout(resolve, ms);
    worker.addEventListener("statechange", () => {
      if (worker.state === "activated") {
        window.clearTimeout(timer);
        resolve();
      }
    });
  });
}

/** Checks for a newer version of Kasukulu, then reloads the app. */
export async function refreshApp(): Promise<void> {
  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.update();
        reg.waiting?.postMessage({ type: "SKIP_WAITING" });
        await waitForActivation(reg, 4000);
      }
    }
  } catch {
    // Offline or blocked: a plain reload below still works.
  }
  window.location.reload();
}

export function RefreshButton({ callActive = false }: RefreshButtonProps) {
  const [busy, setBusy] = useState(false);

  const onClick = () => {
    if (busy) return;
    if (
      callActive &&
      !window.confirm("You are in a live call. Refreshing will end the call. Continue?")
    ) {
      return;
    }
    setBusy(true);
    void refreshApp();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label="Refresh the app"
      title="Refresh the app and get the latest version"
      className="inline-flex items-center justify-center gap-1.5 w-10 h-10 sm:w-auto sm:px-3 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer shrink-0 disabled:opacity-70"
    >
      <RefreshCw className={`w-4 h-4 ${busy ? "animate-spin" : ""}`} />
      <span className="hidden sm:inline">{busy ? "Refreshing…" : "Refresh"}</span>
    </button>
  );
}
