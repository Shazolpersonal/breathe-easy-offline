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
 * Security: Recursively sanitize all strings within an object or array.
 */
export function sanitizeObjectStrings<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObjectStrings) as unknown as T;
  }
  if (obj !== null && typeof obj === "object") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newObj = {} as any;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newObj[key] = sanitizeObjectStrings((obj as any)[key]);
      }
    }
    return newObj as T;
  }
  return sanitizeString(obj) as unknown as T;
}
