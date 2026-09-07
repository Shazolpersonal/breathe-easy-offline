import { describe, it, expect, beforeEach, vi } from "vitest";
import { secureJsonReviver } from "./utils";
import {
  getReminders,
  saveReminders,
  addReminder,
  updateReminder,
  deleteReminder,
  Reminder
} from "./reminders";

const STORAGE_KEY = "breathe_reminders";

describe("reminders", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("getReminders", () => {
    it("returns empty array if no data", () => {
      expect(getReminders()).toEqual([]);
    });

    it("returns parsed data if exists", () => {
      const reminders: Reminder[] = [
        { id: "1", time: "08:00", days: [1, 2], enabled: true },
        { id: "2", time: "20:00", days: [5], enabled: false },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
      expect(getReminders()).toEqual(reminders);
    });
  });

  describe("saveReminders", () => {
    it("saves reminders to localStorage", () => {
      const reminders: Reminder[] = [
        { id: "1", time: "08:00", days: [1, 2], enabled: true },
      ];
      saveReminders(reminders);
      expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(reminders));
    });
  });

  describe("addReminder", () => {
    it("adds a new reminder and assigns an id", () => {
      const newReminder = { time: "09:00", days: [0], enabled: true };
      addReminder(newReminder as unknown as Reminder);

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]", secureJsonReviver);
      expect(stored).toHaveLength(1);
      expect(stored[0].time).toBe("09:00");
    });
  });

  describe("updateReminder", () => {
    it("updates an existing reminder", () => {
      const initial: Reminder[] = [
        { id: "1", time: "08:00", days: [1], enabled: true },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));

      updateReminder("1", { time: "09:00" });

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]", secureJsonReviver);
      expect(stored[0].time).toBe("09:00");
      expect(stored[0].days).toEqual([1]);
    });

    it("does nothing if id not found", () => {
      const initial: Reminder[] = [
        { id: "1", time: "08:00", days: [1], enabled: true },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));

      updateReminder("2", { time: "09:00" });

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]", secureJsonReviver);
      expect(stored[0].time).toBe("08:00");
    });
  });

  describe("deleteReminder", () => {
    it("removes a reminder by id", () => {
      const initial: Reminder[] = [
        { id: "1", time: "08:00", days: [1], enabled: true },
        { id: "2", time: "10:00", days: [2], enabled: false },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));

      deleteReminder("1");

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]", secureJsonReviver);
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe("2");
    });
  });
});
