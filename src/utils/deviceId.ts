// Gives each browser a random anonymous ID so the server can give every learner
// their own daily AI allowance (instead of everyone on one WiFi sharing one).
const KEY = "kasukulu_device_id_v1";

function makeId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function getDeviceId(): string {
  try {
    const existing = localStorage.getItem(KEY);
    if (existing && /^[a-f0-9]{32}$/.test(existing)) return existing;
    const fresh = makeId();
    localStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    return makeId(); // storage blocked: still unique for this page visit
  }
}

let installed = false;

/** Adds the device ID header to every request this app makes to its own /api. */
export function installDeviceIdHeader(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const id = getDeviceId();
  const original = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
          ? input.href
          : input.url;
      const parsed = new URL(url, window.location.origin);
      if (parsed.origin === window.location.origin && parsed.pathname.startsWith("/api/")) {
        const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
        headers.set("X-Kasukulu-Device", id);
        return original(input, { ...init, headers });
      }
    } catch {
      // fall through to the plain request
    }
    return original(input, init);
  };
}
