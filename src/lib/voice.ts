// ─── World-Class Voice Engine (Web Speech API — Zero Cost, Offline Forever) ───
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Capacitor } from '@capacitor/core';

let synth: SpeechSynthesis | null = null;
let voicesLoaded = false;
let cachedVoices: SpeechSynthesisVoice[] = [];

function getSynth(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  if (!synth) synth = window.speechSynthesis;
  return synth;
}

// ─── Robust Voice Loading ───
function loadVoices(): SpeechSynthesisVoice[] {
  const s = getSynth();
  if (!s) return [];
  const voices = s.getVoices();
  if (voices.length > 0) {
    cachedVoices = voices;
    voicesLoaded = true;
  }
  return cachedVoices;
}

// Initialize voices — handles async loading on Chrome/Edge
if (typeof window !== "undefined") {
  loadVoices();
  if (window.speechSynthesis) {
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
  }
}

export interface VoiceInfo {
  name: string;
  lang: string;
  label: string; // "Voice Name (en-US)"
}

/** Get all available voices grouped for display */
export function getAvailableVoices(): { en: VoiceInfo[]; bn: VoiceInfo[]; other: VoiceInfo[] } {
  const voices = loadVoices();
  const en: VoiceInfo[] = [];
  const bn: VoiceInfo[] = [];
  const other: VoiceInfo[] = [];

  for (const v of voices) {
    const info: VoiceInfo = { name: v.name, lang: v.lang, label: `${v.name} (${v.lang})` };
    if (v.lang.startsWith("en")) en.push(info);
    else if (v.lang.startsWith("bn")) bn.push(info);
    else other.push(info);
  }
  return { en, bn, other };
}

/** Check if any Bengali voice is available on the device */
export function hasBengaliVoice(): boolean {
  const voices = loadVoices();
  return voices.some(v => v.lang.startsWith("bn"));
}

/** Resolve a voice by saved name, with smart fallback */
function resolveVoice(voiceName: string | null, lang: string): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (voices.length === 0) return null;

  const langPrefix = lang === "bn" ? "bn" : "en";

  // 1. Try exact name match
  if (voiceName) {
    const exact = voices.find(v => v.name === voiceName);
    if (exact) return exact;
  }

  // 2. Try language match with "female" preference (calming voice)
  const femaleMatch = voices.find(
    v => v.lang.startsWith(langPrefix) && v.name.toLowerCase().includes("female")
  );
  if (femaleMatch) return femaleMatch;

  // 3. Any voice in the target language
  const langMatch = voices.find(v => v.lang.startsWith(langPrefix));
  if (langMatch) return langMatch;

  // 4. Fallback to any English voice
  const enFallback = voices.find(v => v.lang.startsWith("en"));
  if (enFallback) return enFallback;

  // 5. Last resort
  return voices[0] || null;
}

// ─── Core Speak Function with Full Settings ───

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceName?: string | null;
  lang?: string;
}

export async function speak(text: string, options: SpeakOptions = {}): Promise<void> {
  const lang = options.lang ?? "en";
  const locale = lang === "bn" ? "bn-BD" : "en-US";

  if (Capacitor.isNativePlatform()) {
    try {
      await TextToSpeech.speak({
        text: text,
        lang: locale,
        rate: options.rate ?? 0.9,
        pitch: options.pitch ?? 0.95,
        volume: options.volume ?? 0.8,
      });
    } catch (e) {
      console.error("TTS Error:", e);
    }
  } else {
    const s = getSynth();
    if (!s) return;
    s.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? 0.9;
    utterance.pitch = options.pitch ?? 0.95;
    utterance.volume = options.volume ?? 0.8;

    const voice = resolveVoice(options.voiceName ?? null, lang);
    if (voice) utterance.voice = voice;
    utterance.lang = locale;

    s.speak(utterance);
  }
}

/** Legacy speak function for backward compatibility */
export function speakLegacy(text: string, rate = 0.9, lang: string = "en"): void {
  speak(text, { rate, lang });
}

export async function stopSpeaking(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await TextToSpeech.stop();
    } catch (e) {
      console.error("TTS Stop Error:", e);
    }
  } else {
    getSynth()?.cancel();
  }
}

/** Preview a voice with a sample phrase */
export function previewVoice(voiceName: string, lang: string, pitch: number, rate: number, volume: number): void {
  const sampleEn = "Take a deep breath and relax.";
  const sampleBn = "গভীর শ্বাস নিন এবং শিথিল হন।";
  speak(lang.startsWith("bn") ? sampleBn : sampleEn, {
    voiceName,
    lang: lang.startsWith("bn") ? "bn" : "en",
    pitch,
    rate,
    volume,
  });
}

// ─── Session Voice Cues ───

export function speakSessionStart(lang: string, options: SpeakOptions): void {
  const text = lang === "bn"
    ? "শুরু করা যাক। আরামদায়ক অবস্থানে বসুন।"
    : "Let's begin. Find a comfortable position.";
  speak(text, { ...options, lang });
}

export function speakSessionEnd(durationMin: number, lang: string, options: SpeakOptions): void {
  const text = lang === "bn"
    ? `সাবাশ! আপনি ${durationMin} মিনিটের শ্বাস-প্রশ্বাস সম্পন্ন করেছেন।`
    : `Well done. You completed ${durationMin} minutes of breathing.`;
  speak(text, { ...options, lang });
}

export function speakCycleMilestone(cycle: number, lang: string, options: SpeakOptions): void {
  const text = lang === "bn"
    ? `${cycle} চক্র সম্পন্ন।`
    : `Cycle ${cycle} complete.`;
  speak(text, { ...options, lang });
}

export function speakCountdown(count: number, lang: string, options: SpeakOptions): void {
  // Use Bengali digits for bn
  const numText = lang === "bn" ? toBengaliDigits(count) : String(count);
  speak(numText, { ...options, lang, rate: (options.rate ?? 0.9) * 1.1 });
}

function toBengaliDigits(n: number): string {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).split("").map(d => bnDigits[parseInt(d)] ?? d).join("");
}

// ─── Encouragement Phrases ───

const encouragementsEn = [
  "You're doing great.",
  "Stay with the rhythm.",
  "Let go of tension.",
  "You're finding your calm.",
  "Beautiful breathing.",
  "Keep this flow going.",
  "Your body is thanking you.",
  "Focus on the present moment.",
];

const encouragementsBn = [
  "দারুণ করছেন।",
  "ছন্দে থাকুন।",
  "উত্তেজনা ত্যাগ করুন।",
  "আপনি শান্তি খুঁজে পাচ্ছেন।",
  "সুন্দর শ্বাস-প্রশ্বাস।",
  "এই প্রবাহ চালিয়ে যান।",
  "আপনার শরীর আপনাকে ধন্যবাদ দিচ্ছে।",
  "বর্তমান মুহূর্তে মনোযোগ দিন।",
];

let lastEncouragementIdx = -1;

export function speakEncouragement(lang: string, options: SpeakOptions): void {
  const list = lang === "bn" ? encouragementsBn : encouragementsEn;
  let idx: number;
  do {
    idx = Math.floor(Math.random() * list.length);
  } while (idx === lastEncouragementIdx && list.length > 1);
  lastEncouragementIdx = idx;
  speak(list[idx], { ...options, lang });
}
