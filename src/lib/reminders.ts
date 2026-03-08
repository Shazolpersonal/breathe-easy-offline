export interface Reminder {
  id: string;
  time: string; // HH:MM
  days: number[]; // 0=Sun..6=Sat
  enabled: boolean;
  message: string;
}

const STORAGE_KEY = "breathe_reminders";

export function getReminders(): Reminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveReminders(reminders: Reminder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

export function addReminder(reminder: Reminder) {
  const all = getReminders();
  all.push(reminder);
  saveReminders(all);
}

export function updateReminder(id: string, partial: Partial<Reminder>) {
  const all = getReminders();
  const idx = all.findIndex(r => r.id === id);
  if (idx >= 0) all[idx] = { ...all[idx], ...partial };
  saveReminders(all);
}

export function deleteReminder(id: string) {
  saveReminders(getReminders().filter(r => r.id !== id));
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export function sendNotification(title: string, body: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  new Notification(title, {
    body,
    icon: "/logo.png",
    badge: "/logo.png",
  });
}

let reminderInterval: ReturnType<typeof setInterval> | null = null;
const firedToday = new Set<string>();

export function startReminderChecker() {
  if (reminderInterval) return;

  // Reset fired set at midnight
  const resetAtMidnight = () => {
    const now = new Date();
    const msToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    setTimeout(() => {
      firedToday.clear();
      resetAtMidnight();
    }, msToMidnight);
  };
  resetAtMidnight();

  reminderInterval = setInterval(() => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const currentDay = now.getDay();

    const reminders = getReminders();
    reminders.forEach(r => {
      if (!r.enabled) return;
      if (!r.days.includes(currentDay)) return;
      if (r.time !== currentTime) return;
      const key = `${r.id}-${now.toDateString()}`;
      if (firedToday.has(key)) return;
      firedToday.add(key);
      sendNotification("Muhurto Breath 🌬️", r.message);
    });
  }, 30000); // check every 30s
}

export function stopReminderChecker() {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
  }
}
