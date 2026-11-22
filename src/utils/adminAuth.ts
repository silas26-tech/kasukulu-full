import type { User } from "firebase/auth";

export const PRIMARY_ADMIN_EMAIL = "razeensilas@gmail.com";
// NOTE: Admin status here only decides which screens to SHOW. Real protection is in
// firestore.rules, which checks the verified Google email on the server. There is
// deliberately no passcode: anything starting with VITE_ is readable by every visitor.
const ADMIN_SESSION_KEY = "kasukulu_admin_session_v1";

export function getAdminEmails(): string[] {
  const envAdmins = (import.meta.env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);
  const defaultList = [PRIMARY_ADMIN_EMAIL.toLowerCase()];
  return Array.from(new Set([...defaultList, ...envAdmins]));
}

export function isUserAdmin(user: User | null | undefined): boolean {
  if (!user || !user.email) return false;
  const userEmail = user.email.trim().toLowerCase();
  const admins = getAdminEmails();
  return admins.includes(userEmail);
}

export function checkAdminSession(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

export function setAdminSession(active: boolean): void {
  try {
    if (active) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    } else {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
  } catch {
    // Ignore sessionStorage errors
  }
}
