let synth: SpeechSynthesis | null = null;

function getSynth(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  if (!synth) synth = window.speechSynthesis;
  return synth;
}

export function speak(text: string, rate = 0.9) {
  const s = getSynth();
  if (!s) return;
  s.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = 0.95;
  utterance.volume = 0.8;
  // Try to pick a good voice
  const voices = s.getVoices();
  const preferred = voices.find(
    (v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("female")
  ) || voices.find((v) => v.lang.startsWith("en")) || voices[0];
  if (preferred) utterance.voice = preferred;
  s.speak(utterance);
}

export function stopSpeaking() {
  getSynth()?.cancel();
}
