import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getReminders,
  saveReminders,
  addReminder,
  updateReminder,
  deleteReminder,
  Reminder
} from "./reminders";

const STORAGE_KEY = "breathe_reminders";

describe("reminders library", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("saveReminders", () => {
    it("should save reminders to localStorage", () => {
      const reminders: Reminder[] = [
        { id: "1", time: "08:00", days: [1, 2, 3], enabled: true, message: "Morning breath" }
      ];

      const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
      saveReminders(reminders);

      expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(reminders));
      expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(reminders));
    });
  });

  describe("getReminders", () => {
    it("should return an empty array if no reminders are stored", () => {
      expect(getReminders()).toEqual([]);
    });

    it("should return stored reminders", () => {
      const reminders: Reminder[] = [
        { id: "1", time: "08:00", days: [1, 2, 3], enabled: true, message: "Morning breath" }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));

      expect(getReminders()).toEqual(reminders);
    });

    it("should return an empty array if JSON is invalid", () => {
      localStorage.setItem(STORAGE_KEY, "invalid-json");
      expect(getReminders()).toEqual([]);
    });
  });

  describe("addReminder", () => {
    it("should add a reminder to the existing list", () => {
      const existing: Reminder[] = [
        { id: "1", time: "08:00", days: [1], enabled: true, message: "One" }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

      const newReminder: Reminder = { id: "2", time: "09:00", days: [2], enabled: false, message: "Two" };
      addReminder(newReminder);

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      expect(stored).toHaveLength(2);
      expect(stored[1]).toEqual(newReminder);
    });
  });

  describe("updateReminder", () => {
    it("should update an existing reminder", () => {
      const reminders: Reminder[] = [
        { id: "1", time: "08:00", days: [1], enabled: true, message: "Original" }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));

      updateReminder("1", { message: "Updated", enabled: false });

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      expect(stored[0].message).toBe("Updated");
      expect(stored[0].enabled).toBe(false);
      expect(stored[0].time).toBe("08:00"); // preserved
    });

    it("should do nothing if reminder ID is not found", () => {
      const reminders: Reminder[] = [
        { id: "1", time: "08:00", days: [1], enabled: true, message: "Original" }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));

      updateReminder("non-existent", { message: "Updated" });

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      expect(stored).toEqual(reminders);
    });
  });

  describe("deleteReminder", () => {
    it("should remove a reminder by ID", () => {
      const reminders: Reminder[] = [
        { id: "1", time: "08:00", days: [1], enabled: true, message: "One" },
        { id: "2", time: "09:00", days: [2], enabled: true, message: "Two" }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));

      deleteReminder("1");

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe("2");
    });
  });
});
