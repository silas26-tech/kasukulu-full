/** Friendly text for a reply that was not JSON (usually a host/proxy error page). */
function describeBadReply(status: number): string {
  if (status === 502 || status === 503 || status === 504 || status === 524) {
    return `The Kasukulu server is busy or restarting (code ${status}). Please wait a minute and try again.`;
  }
  if (status === 404) {
    return "Kasukulu could not find that service (code 404). Please refresh the app and try again.";
  }
  return `The Kasukulu server sent an unexpected reply (code ${status}). Please try again.`;
}

/** Reads a JSON reply; throws a clear message instead of "Unexpected token". */
export async function readJson(res: Response): Promise<any> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    console.warn("Non-JSON reply", res.status, text.slice(0, 200));
    throw new Error(describeBadReply(res.status));
  }
}

/** Like readJson but returns { error } instead of throwing. */
export async function readJsonLoose(res: Response): Promise<any> {
  try {
    return await readJson(res);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected reply." };
  }
}
