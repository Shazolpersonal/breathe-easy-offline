export interface ProgramDay {
  day: number;
  techniqueId: string;
  durationMinutes: number;
  tip: string;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  emoji: string;
  days: ProgramDay[];
}

export interface ProgramEnrollment {
  programId: string;
  startDate: string; // ISO
  completedDays: number[];
}

const ENROLLMENT_KEY = "breathe_program_enrollments";

export const PROGRAMS: Program[] = [
  {
    id: "stress-relief-7",
    name: "7-Day Stress Relief",
    description: "Progressive relaxation techniques to melt away stress, one day at a time.",
    emoji: "🌿",
    days: [
      { day: 1, techniqueId: "calm-breath", durationMinutes: 3, tip: "Start gentle. Focus only on the exhale being longer than the inhale." },
      { day: 2, techniqueId: "calm-breath", durationMinutes: 5, tip: "Today we extend the duration. Let tension leave with each breath." },
      { day: 3, techniqueId: "box-breathing", durationMinutes: 4, tip: "Box breathing adds holds — these pauses quiet the mind." },
      { day: 4, techniqueId: "box-breathing", durationMinutes: 5, tip: "Notice how your body feels different after just a few cycles." },
      { day: 5, techniqueId: "4-7-8", durationMinutes: 5, tip: "The 4-7-8 pattern is a natural tranquilizer. Let it work." },
      { day: 6, techniqueId: "4-7-8", durationMinutes: 7, tip: "You're building a skill. Each session makes the next one easier." },
      { day: 7, techniqueId: "equal-breathing", durationMinutes: 10, tip: "Final day! You've built a real stress-relief habit. Keep going." },
    ],
  },
  {
    id: "sleep-better-14",
    name: "Sleep Better in 14 Days",
    description: "Evening breathing routines designed to quiet your mind before bed.",
    emoji: "🌙",
    days: [
      { day: 1, techniqueId: "calm-breath", durationMinutes: 3, tip: "Do this in bed with lights off. Breathe through your nose." },
      { day: 2, techniqueId: "calm-breath", durationMinutes: 4, tip: "Let each exhale be like releasing the day's weight." },
      { day: 3, techniqueId: "4-7-8", durationMinutes: 3, tip: "The 4-7-8 was designed specifically for sleep. Trust the pattern." },
      { day: 4, techniqueId: "4-7-8", durationMinutes: 5, tip: "Close your eyes. Let the counting replace your thoughts." },
      { day: 5, techniqueId: "4-7-8", durationMinutes: 5, tip: "Your body is learning this cue means 'time to rest'." },
      { day: 6, techniqueId: "box-breathing", durationMinutes: 5, tip: "Box breathing before bed clears mental clutter." },
      { day: 7, techniqueId: "calm-breath", durationMinutes: 7, tip: "One week done! Notice any changes in how quickly you fall asleep?" },
      { day: 8, techniqueId: "4-7-8", durationMinutes: 5, tip: "Consistency matters more than duration. Show up each night." },
      { day: 9, techniqueId: "equal-breathing", durationMinutes: 5, tip: "Equal breathing balances your nervous system for deep rest." },
      { day: 10, techniqueId: "calm-breath", durationMinutes: 7, tip: "You're rewiring your bedtime routine. Keep at it." },
      { day: 11, techniqueId: "4-7-8", durationMinutes: 7, tip: "The long hold is where the magic happens. Embrace it." },
      { day: 12, techniqueId: "box-breathing", durationMinutes: 7, tip: "Your sleep quality should be noticeably improving by now." },
      { day: 13, techniqueId: "4-7-8", durationMinutes: 10, tip: "Almost there. This is becoming second nature." },
      { day: 14, techniqueId: "calm-breath", durationMinutes: 10, tip: "Congratulations! You've built a powerful sleep ritual. 🎉" },
    ],
  },
  {
    id: "focus-training-10",
    name: "Focus Training",
    description: "10 days of energizing breath patterns to sharpen concentration and mental clarity.",
    emoji: "🎯",
    days: [
      { day: 1, techniqueId: "box-breathing", durationMinutes: 3, tip: "Box breathing trains your attention. Count precisely." },
      { day: 2, techniqueId: "box-breathing", durationMinutes: 5, tip: "If your mind wanders, gently bring it back to counting." },
      { day: 3, techniqueId: "equal-breathing", durationMinutes: 5, tip: "Equal breath = equal mind. Find your balance point." },
      { day: 4, techniqueId: "box-breathing", durationMinutes: 5, tip: "Try this before deep work or study for best results." },
      { day: 5, techniqueId: "equal-breathing", durationMinutes: 7, tip: "Halfway! Your focus muscle is getting stronger." },
      { day: 6, techniqueId: "box-breathing", durationMinutes: 7, tip: "The holds are attention anchors. Use them fully." },
      { day: 7, techniqueId: "wim-hof", durationMinutes: 3, tip: "Power breathing floods your brain with oxygen. Stay alert!" },
      { day: 8, techniqueId: "box-breathing", durationMinutes: 7, tip: "Mix precision counting with awareness of body sensations." },
      { day: 9, techniqueId: "equal-breathing", durationMinutes: 10, tip: "Long sessions build sustained attention capacity." },
      { day: 10, techniqueId: "box-breathing", durationMinutes: 10, tip: "Final day! You've trained a laser-sharp focus tool. Use it daily. 🎯" },
    ],
  },
];

export function getEnrollments(): ProgramEnrollment[] {
  try {
    const raw = localStorage.getItem(ENROLLMENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function enrollInProgram(programId: string) {
  const enrollments = getEnrollments();
  const existing = enrollments.find(e => e.programId === programId);
  if (existing) return; // already enrolled
  enrollments.push({ programId, startDate: new Date().toISOString(), completedDays: [] });
  localStorage.setItem(ENROLLMENT_KEY, JSON.stringify(enrollments));
}

export function completeDay(programId: string, day: number) {
  const enrollments = getEnrollments();
  const enrollment = enrollments.find(e => e.programId === programId);
  if (!enrollment) return;
  if (!enrollment.completedDays.includes(day)) {
    enrollment.completedDays.push(day);
    localStorage.setItem(ENROLLMENT_KEY, JSON.stringify(enrollments));
  }
}

export function unenrollFromProgram(programId: string) {
  localStorage.setItem(ENROLLMENT_KEY, JSON.stringify(getEnrollments().filter(e => e.programId !== programId)));
}

export function getProgramById(id: string): Program | undefined {
  return PROGRAMS.find(p => p.id === id);
}
