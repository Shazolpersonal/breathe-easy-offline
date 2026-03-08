export interface BreathingQuote {
  text: string;
  author: string;
}

const QUOTES: BreathingQuote[] = [
  { text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.", author: "Thich Nhat Hanh" },
  { text: "Breath is the bridge which connects life to consciousness.", author: "Thich Nhat Hanh" },
  { text: "When you own your breath, nobody can steal your peace.", author: "Unknown" },
  { text: "The breath is the king of the mind.", author: "B.K.S. Iyengar" },
  { text: "Inhale the future, exhale the past.", author: "Unknown" },
  { text: "Breathing in, I calm body and mind. Breathing out, I smile.", author: "Thich Nhat Hanh" },
  { text: "Life is not measured by the number of breaths we take, but by the moments that take our breath away.", author: "Maya Angelou" },
  { text: "The only way to live is to accept each minute as an unrepeatable miracle.", author: "Storm Jameson" },
  { text: "Breathe. Let go. And remind yourself that this very moment is the only one you know you have for sure.", author: "Oprah Winfrey" },
  { text: "Just breathe. You are strong enough to handle your challenges, wise enough to find solutions.", author: "Unknown" },
  { text: "In the midst of movement and chaos, keep stillness inside of you.", author: "Deepak Chopra" },
  { text: "Your calm mind is the ultimate weapon against your challenges.", author: "Bryant McGill" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { text: "Peace is the result of retraining your mind to process life as it is, rather than as you think it should be.", author: "Wayne Dyer" },
  { text: "The present moment is the only moment available to us, and it is the door to all moments.", author: "Thich Nhat Hanh" },
  { text: "Calm is a superpower.", author: "Unknown" },
  { text: "One conscious breath in and out is a meditation.", author: "Eckhart Tolle" },
  { text: "Quiet the mind, and the soul will speak.", author: "Ma Jaya Sati Bhagavati" },
  { text: "The greatest weapon against stress is our ability to choose one thought over another.", author: "William James" },
  { text: "Do not let the behavior of others destroy your inner peace.", author: "Dalai Lama" },
  { text: "Smile, breathe, and go slowly.", author: "Thich Nhat Hanh" },
  { text: "When the breath wanders the mind also is unsteady. But when the breath is calmed the mind too will be still.", author: "Hatha Yoga Pradipika" },
  { text: "Nature does not hurry, yet everything is accomplished.", author: "Lao Tzu" },
  { text: "Within you, there is a stillness and a sanctuary to which you can retreat at any time.", author: "Hermann Hesse" },
  { text: "The time to relax is when you don't have time for it.", author: "Sydney J. Harris" },
  { text: "Nothing can bring you peace but yourself.", author: "Ralph Waldo Emerson" },
  { text: "Surrender to what is. Let go of what was. Have faith in what will be.", author: "Sonia Ricotti" },
  { text: "Be where you are, not where you think you should be.", author: "Unknown" },
  { text: "Breathing is the greatest pleasure in life.", author: "Giovanni Papini" },
  { text: "Each breath is a new beginning.", author: "Unknown" },
];

function hashDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getDailyQuote(): BreathingQuote {
  const today = new Date().toISOString().split("T")[0];
  const idx = hashDate(today) % QUOTES.length;
  return QUOTES[idx];
}
