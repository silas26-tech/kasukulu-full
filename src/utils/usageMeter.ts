// Records what the AI costs, per request, per feature and per device, so the real
// cost of a learner is known before prices are set. Server only (uses Node modules).
import { AsyncLocalStorage } from "node:async_hooks";
import fs from "node:fs";
import path from "node:path";

export interface UsageContext {
  deviceId: string | null;
  route: string;
}
export const usageContext = new AsyncLocalStorage<UsageContext>();

// Prices in US dollars. Change them with environment variables if your Gemini
// prices differ (see the pricing page in Google AI Studio).
const num = (v: string | undefined, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : d;
};
const PRICE = {
  textInPerM: num(process.env.PRICE_TEXT_IN_PER_M, 0.5),
  textOutPerM: num(process.env.PRICE_TEXT_OUT_PER_M, 3.0),
  ttsOutPerM: num(process.env.PRICE_TTS_OUT_PER_M, 20),
  liveUsdPerMin: num(process.env.PRICE_LIVE_PER_MIN, 0.04),
};
export const USD_TO_ZMW = num(process.env.USD_TO_ZMW, 25);

interface Bucket {
  requests: number;
  inTokens: number;
  outTokens: number;
  liveSeconds: number;
  costUsd: number;
}
interface DayData {
  total: Bucket;
  routes: Record<string, Bucket>;
  devices: Record<string, Bucket>;
}

const newBucket = (): Bucket => ({ requests: 0, inTokens: 0, outTokens: 0, liveSeconds: 0, costUsd: 0 });

const DIR = path.resolve(process.env.USAGE_DIR || ".cache");
const FILE = path.join(DIR, "usage.json");
const MAX_DAYS = 45;
const MAX_DEVICES_PER_DAY = 3000;

let days: Record<string, DayData> = {};
let dirty = false;

try {
  const parsed = JSON.parse(fs.readFileSync(FILE, "utf8"));
  if (parsed && typeof parsed === "object") days = parsed;
} catch {
  // first run
}

/** Today's date in Zambia (UTC+2), as YYYY-MM-DD. */
export function zambiaDay(offsetDays = 0): string {
  return new Date(Date.now() + 2 * 3600 * 1000 - offsetDays * 86400 * 1000)
    .toISOString()
    .slice(0, 10);
}

function add(b: Bucket, inTokens: number, outTokens: number, liveSeconds: number, costUsd: number) {
  b.requests += liveSeconds > 0 ? 0 : 1;
  b.inTokens += inTokens;
  b.outTokens += outTokens;
  b.liveSeconds += liveSeconds;
  b.costUsd += costUsd;
}

function record(inTokens: number, outTokens: number, liveSeconds: number, costUsd: number, routeOverride?: string) {
  const ctx = usageContext.getStore();
  const day = zambiaDay();
  const data = (days[day] ??= { total: newBucket(), routes: {}, devices: {} });
  const route = routeOverride ?? ctx?.route ?? "other";
  add(data.total, inTokens, outTokens, liveSeconds, costUsd);
  add((data.routes[route] ??= newBucket()), inTokens, outTokens, liveSeconds, costUsd);
  const device = ctx?.deviceId ?? "unknown";
  if (data.devices[device] || Object.keys(data.devices).length < MAX_DEVICES_PER_DAY) {
    add((data.devices[device] ??= newBucket()), inTokens, outTokens, liveSeconds, costUsd);
  }
  dirty = true;
}

/** Call after every Gemini reply. kind "tts" is priced as audio output. */
export function recordGeminiResponse(response: unknown, kind: "text" | "tts" = "text"): void {
  try {
    const u = (response as any)?.usageMetadata;
    if (!u) return;
    const inTokens = Number(u.promptTokenCount) || 0;
    const outTokens = (Number(u.candidatesTokenCount) || 0) + (Number(u.thoughtsTokenCount) || 0);
    const cost =
      kind === "tts"
        ? (inTokens * PRICE.textInPerM + outTokens * PRICE.ttsOutPerM) / 1e6
        : (inTokens * PRICE.textInPerM + outTokens * PRICE.textOutPerM) / 1e6;
    record(inTokens, outTokens, 0, cost, kind === "tts" ? "/api/tutor/speak" : undefined);
  } catch {
    // metering must never break a learner's request
  }
}

/** Call when a live voice call ends. */
export function recordLiveSeconds(deviceId: string | null, seconds: number): void {
  try {
    if (!(seconds > 0)) return;
    usageContext.run({ deviceId, route: "live voice call" }, () =>
      record(0, 0, seconds, (seconds / 60) * PRICE.liveUsdPerMin)
    );
  } catch {
    // ignore
  }
}

function flush(): void {
  if (!dirty) return;
  dirty = false;
  try {
    const keep = Object.keys(days).sort().slice(-MAX_DAYS);
    days = Object.fromEntries(keep.map((k) => [k, days[k]]));
    fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(days));
  } catch (err) {
    console.warn("Could not save usage data:", err);
  }
}
setInterval(flush, 60_000).unref();
for (const sig of ["SIGTERM", "SIGINT"] as const) {
  process.on(sig, () => {
    flush();
    process.exit(0);
  });
}

const round = (n: number, d = 4) => Math.round(n * 10 ** d) / 10 ** d;

function sumDays(n: number) {
  const out = { costUsd: 0, requests: 0, liveMinutes: 0, deviceDays: 0 };
  for (let i = 0; i < n; i++) {
    const d = days[zambiaDay(i)];
    if (!d) continue;
    out.costUsd += d.total.costUsd;
    out.requests += d.total.requests;
    out.liveMinutes += d.total.liveSeconds / 60;
    out.deviceDays += Object.keys(d.devices).filter((k) => k !== "unknown").length;
  }
  return out;
}

export function usageReport() {
  const today = days[zambiaDay()];
  const w = sumDays(7);
  const m = sumDays(30);

  const routes: Record<string, { costUsd: number; requests: number; liveMinutes: number }> = {};
  const devices: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = days[zambiaDay(i)];
    if (!d) continue;
    for (const [r, b] of Object.entries(d.routes)) {
      const x = (routes[r] ??= { costUsd: 0, requests: 0, liveMinutes: 0 });
      x.costUsd += b.costUsd;
      x.requests += b.requests;
      x.liveMinutes += b.liveSeconds / 60;
    }
    for (const [id, b] of Object.entries(d.devices)) {
      if (id !== "unknown") devices[id] = (devices[id] ?? 0) + b.costUsd;
    }
  }

  const series = Array.from({ length: 14 }, (_, i) => {
    const key = zambiaDay(13 - i);
    const d = days[key];
    return {
      day: key,
      costUsd: round(d?.total.costUsd ?? 0),
      requests: d?.total.requests ?? 0,
      devices: d ? Object.keys(d.devices).filter((k) => k !== "unknown").length : 0,
    };
  });

  // Average cost of one active learner on one active day (last 7 days).
  const costPerActiveDay = w.deviceDays > 0 ? w.costUsd / w.deviceDays : 0;

  return {
    generatedAt: new Date().toISOString(),
    usdToZmw: USD_TO_ZMW,
    prices: PRICE,
    today: {
      costUsd: round(today?.total.costUsd ?? 0),
      requests: today?.total.requests ?? 0,
      activeDevices: today ? Object.keys(today.devices).filter((k) => k !== "unknown").length : 0,
    },
    last7: { costUsd: round(w.costUsd), requests: w.requests, liveMinutes: round(w.liveMinutes, 1) },
    last30: { costUsd: round(m.costUsd), requests: m.requests, liveMinutes: round(m.liveMinutes, 1) },
    costPerActiveLearnerDayUsd: round(costPerActiveDay),
    projectedMonthlyPerLearnerUsd: round(costPerActiveDay * 20, 3),
    routes: Object.entries(routes)
      .map(([route, v]) => ({ route, costUsd: round(v.costUsd), requests: v.requests, liveMinutes: round(v.liveMinutes, 1) }))
      .sort((a, b) => b.costUsd - a.costUsd),
    topDevices: Object.entries(devices)
      .map(([id, costUsd]) => ({ id: id.slice(0, 6), costUsd: round(costUsd) }))
      .sort((a, b) => b.costUsd - a.costUsd)
      .slice(0, 10),
    series,
  };
}
