let synth: SpeechSynthesis | null = null;

function getSynth(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  if (!synth) synth = window.speechSynthesis;
  return synth;
}

export function speak(text: string, rate = 0.9, lang: string = "en") {
  const s = getSynth();
  if (!s) return;
  s.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = 0.95;
  utterance.volume = 0.8;
  const voices = s.getVoices();
  const langPrefix = lang === "bn" ? "bn" : "en";
  const preferred = voices.find(
    (v) => v.lang.startsWith(langPrefix) && v.name.toLowerCase().includes("female")
  ) || voices.find((v) => v.lang.startsWith(langPrefix)) || voices.find((v) => v.lang.startsWith("en")) || voices[0];
  if (preferred) utterance.voice = preferred;
  utterance.lang = lang === "bn" ? "bn-BD" : "en-US";
  s.speak(utterance);
}

export function stopSpeaking() {
  getSynth()?.cancel();
}
