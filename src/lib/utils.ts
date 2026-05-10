import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Security: Sanitize a string by escaping HTML entities to prevent XSS.
 */
export function sanitizeString(str: string): string;
export function sanitizeString(str: unknown): unknown;
export function sanitizeString(str: unknown): unknown {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Security: Sanitize a string for safe logging (escapes HTML, removes newlines, limits length).
 */
export function sanitizeForLog(str: string): string {
  if (!str) return "";
  const sanitized = sanitizeString(str) as string;
  return sanitized.replace(/[\r\n]+/g, "").substring(0, 200);
}

/**
 * Security: Recursively sanitize all strings within an object or array.
 */
export function sanitizeObjectStrings<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObjectStrings) as unknown as T;
  }
  if (obj !== null && typeof obj === "object") {
    const newObj = {} as Record<string, unknown>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = sanitizeObjectStrings((obj as Record<string, unknown>)[key]);
      }
    }
    return newObj as T;
  }
  return sanitizeString(obj) as unknown as T;
}
