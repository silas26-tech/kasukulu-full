import { useState } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

interface Report {
  generatedAt: string;
  usdToZmw: number;
  today: { costUsd: number; requests: number; activeDevices: number };
  last7: { costUsd: number; requests: number; liveMinutes: number };
  last30: { costUsd: number; requests: number; liveMinutes: number };
  costPerActiveLearnerDayUsd: number;
  projectedMonthlyPerLearnerUsd: number;
  routes: { route: string; costUsd: number; requests: number; liveMinutes: number }[];
  topDevices: { id: string; costUsd: number }[];
  series: { day: string; costUsd: number; requests: number; devices: number }[];
}

const KEY_STORE = "kasukulu_admin_usage_key_v1";

function loadKey(): string {
  try {
    return sessionStorage.getItem(KEY_STORE) ?? "";
  } catch {
    return "";
  }
}

const ROUTE_NAMES: Record<string, string> = {
  "/api/tutor/chat": "Tutor chat",
  "/api/tutor/blackboard": "Blackboard notes",
  "/api/tutor/lesson": "Writing lessons",
  "/api/tutor/lesson/mark": "Marking written answers",
  "/api/tutor/quiz": "Quick quizzes",
  "/api/tutor/mock": "Mock exam papers",
  "/api/tutor/practice": "Weak-spot practice",
  "/api/tutor/speak": "Voice read-aloud",
  "/api/tutor/transcribe": "Voice typing",
  "live voice call": "Live voice calls",
  "/api/competitions/mark": "Competition marking",
};

export function UsageCostCard() {
  const [key, setKey] = useState(loadKey);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/usage", { headers: { "x-admin-key": key } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `The server replied with code ${res.status}.`);
      setReport(data as Report);
      try {
        sessionStorage.setItem(KEY_STORE, key);
      } catch {
        // ignore
      }
    } catch (err) {
      setReport(null);
      setError(err instanceof Error ? err.message : "Could not load the report.");
    } finally {
      setLoading(false);
    }
  };

  const k = (usd: number) => `K${(usd * (report?.usdToZmw ?? 25)).toFixed(2)}`;
  const usd = (n: number) => `$${n.toFixed(n < 1 ? 3 : 2)}`;
  const maxDay = Math.max(0.0001, ...(report?.series.map((s) => s.costUsd) ?? [0]));
  const monthly = report?.projectedMonthlyPerLearnerUsd ?? 0;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">AI usage &amp; cost</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            What the AI really costs, so you can set prices from facts. Figures are estimates from
            token counts and the prices in your host settings.
          </p>
        </div>
        <form
          className="flex flex-col sm:flex-row gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void load();
          }}
        >
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Your ADMIN_USAGE_KEY"
            autoComplete="off"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <button
            type="submit"
            disabled={loading || !key}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-semibold cursor-pointer min-h-[44px]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {report ? "Refresh" : "Show report"}
          </button>
        </form>
        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {report && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Today", value: k(report.today.costUsd), sub: `${usd(report.today.costUsd)} · ${report.today.activeDevices} learners` },
              { label: "Last 7 days", value: k(report.last7.costUsd), sub: usd(report.last7.costUsd) },
              { label: "Last 30 days", value: k(report.last30.costUsd), sub: usd(report.last30.costUsd) },
              { label: "Per learner per month*", value: k(monthly), sub: `${usd(monthly)} (20 study days)` },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500 font-medium">{c.label}</div>
                <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">{c.value}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{c.sub}</div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-950 leading-relaxed">
            <strong className="font-semibold">Price guide:</strong> at this cost, charging at least{" "}
            <strong>{k(monthly * 3)}</strong> a month keeps about two-thirds of each payment before fees
            and tax. *Based on the last 7 days, average cost per active learner per active day × 20.
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-900">Daily cost (last 14 days)</h3>
            <div className="mt-3 flex items-end gap-1 h-28" aria-label="Daily cost chart">
              {report.series.map((s) => (
                <div key={s.day} className="flex-1 flex flex-col items-center justify-end gap-1 h-full" title={`${s.day}: ${k(s.costUsd)}, ${s.devices} learners`}>
                  <div className="w-full rounded-t bg-emerald-600" style={{ height: `${Math.max(2, (s.costUsd / maxDay) * 100)}%` }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>{report.series[0]?.day.slice(5)}</span>
              <span>{report.series[report.series.length - 1]?.day.slice(5)}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-900">What costs the most (30 days)</h3>
            <ul className="mt-2 divide-y divide-slate-100">
              {report.routes.map((r) => (
                <li key={r.route} className="flex items-center justify-between py-2 text-xs gap-3">
                  <span className="text-slate-800">{ROUTE_NAMES[r.route] ?? r.route}</span>
                  <span className="tabular-nums text-slate-600 text-right">
                    {r.liveMinutes > 0 ? `${r.liveMinutes} min` : `${r.requests} requests`} ·{" "}
                    <strong className="text-slate-900">{k(r.costUsd)}</strong>
                  </span>
                </li>
              ))}
              {report.routes.length === 0 && (
                <li className="py-2 text-xs text-slate-500">No usage recorded yet.</li>
              )}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-900">Heaviest learners (30 days)</h3>
            <ul className="mt-2 divide-y divide-slate-100">
              {report.topDevices.map((d) => (
                <li key={d.id} className="flex items-center justify-between py-2 text-xs">
                  <span className="font-mono text-slate-600">device {d.id}</span>
                  <strong className="tabular-nums text-slate-900">{k(d.costUsd)}</strong>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
