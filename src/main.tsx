import { Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    __KASUKULU_MOUNTED__?: boolean;
    __KASUKULU_REACT_ROOT__?: Root;
    __recoverKasukuluSW?: () => Promise<unknown>;
  }
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class AppErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Kasukulu runtime error boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-slate-900">
          <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h1 className="text-lg font-bold text-slate-900">
              Let&apos;s refresh Kasukulu
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Something unexpected interrupted startup on this device. Tap below
              to clear stale cached files and reopen cleanly.
            </p>
            <button
              type="button"
              onClick={() => {
                const recover = window.__recoverKasukuluSW
                  ? window.__recoverKasukuluSW()
                  : Promise.resolve();
                void recover.finally(() => {
                  window.location.reload();
                });
              }}
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition-colors cursor-pointer"
            >
              Clear Cache &amp; Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

window.__KASUKULU_MOUNTED__ = true;
try {
  sessionStorage.removeItem('kasukulu_sw_recovery_v1');
} catch {
  // ignore storage errors in restricted mobile browsers
}

if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => {
      regs.forEach((reg) => {
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        void reg.update().catch(() => {});
      });
    })
    .catch(() => {});
}

const rootContainer = document.getElementById('root')!;
const existingRoot = window.__KASUKULU_REACT_ROOT__;
const root = existingRoot ?? (window.__KASUKULU_REACT_ROOT__ = createRoot(rootContainer));

root.render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
