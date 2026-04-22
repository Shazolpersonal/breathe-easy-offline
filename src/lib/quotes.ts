export interface BreathingQuote {
  text: string;
  author: string;
}

const QUOTES_EN: BreathingQuote[] = [
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

const QUOTES_BN: BreathingQuote[] = [
  { text: "অনুভূতি আসে আর যায়, ঝড়ো আকাশের মেঘের মতো। সচেতন শ্বাস আমার নোঙর।", author: "থিক নাট হান" },
  { text: "শ্বাস হলো সেতু যা জীবনকে চেতনার সাথে যুক্ত করে।", author: "থিক নাট হান" },
  { text: "যখন তুমি তোমার শ্বাসের মালিক, কেউ তোমার শান্তি কেড়ে নিতে পারে না।", author: "অজানা" },
  { text: "নিশ্চয়ই কষ্টের সাথে স্বস্তি আছে।", author: "আল-কুরআন (৯৪:৬)" },
  { text: "ভবিষ্যৎ শ্বাসে নাও, অতীত ছেড়ে দাও।", author: "অজানা" },
  { text: "শ্বাস নিচ্ছি, শরীর ও মনকে শান্ত করছি। শ্বাস ছাড়ছি, হাসছি।", author: "থিক নাট হান" },
  { text: "জীবন কতবার শ্বাস নিলে তা দিয়ে মাপা হয় না, বরং কত মুহূর্ত শ্বাস কেড়ে নেয় তা দিয়ে।", author: "মায়া অ্যাঞ্জেলু" },
  { text: "আল্লাহর স্মরণেই হৃদয় প্রশান্তি লাভ করে।", author: "আল-কুরআন (১৩:২৮)" },
  { text: "শ্বাস নাও। ছেড়ে দাও। মনে করো এই মুহূর্তটিই একমাত্র যা তোমার আছে নিশ্চিতভাবে।", author: "ওপরাহ উইনফ্রি" },
  { text: "ধৈর্য ধরো, তুমি যথেষ্ট শক্তিশালী তোমার চ্যালেঞ্জ সামলাতে।", author: "অজানা" },
  { text: "চলাচল আর বিশৃঙ্খলার মাঝেও, নিজের ভেতরে স্থিরতা রাখো।", author: "দীপক চোপড়া" },
  { text: "তোমার শান্ত মন তোমার চ্যালেঞ্জের বিরুদ্ধে সবচেয়ে বড় অস্ত্র।", author: "ব্রায়ান্ট ম্যাকগিল" },
  { text: "কয়েক মিনিট বিশ্রাম নিলে প্রায় সবকিছুই আবার কাজ করে — তুমিও।", author: "অ্যান ল্যামট" },
  { text: "প্রতিটি শ্বাস আল্লাহর একটি নেয়ামত। কৃতজ্ঞতার সাথে গ্রহণ করো।", author: "ইসলামী প্রজ্ঞা" },
  { text: "বর্তমান মুহূর্তই একমাত্র মুহূর্ত যা আমাদের কাছে আছে, এবং এটিই সব মুহূর্তের দরজা।", author: "থিক নাট হান" },
  { text: "প্রশান্তি একটি মহাশক্তি।", author: "অজানা" },
  { text: "একটি সচেতন শ্বাস-প্রশ্বাসই একটি ধ্যান।", author: "একহার্ট টোলে" },
  { text: "মনকে শান্ত করো, আত্মা কথা বলবে।", author: "মা জয়া সতী ভগবতী" },
  { text: "তাকওয়া হলো হৃদয়ের বিষয়। শ্বাসে শ্বাসে আল্লাহকে স্মরণ করো।", author: "ইসলামী প্রজ্ঞা" },
  { text: "অন্যের আচরণ যেন তোমার অন্তরের শান্তি নষ্ট না করে।", author: "দালাই লামা" },
  { text: "হাসো, শ্বাস নাও, আর ধীরে চলো।", author: "থিক নাট হান" },
  { text: "যখন শ্বাস অস্থির, মনও অস্থির। শ্বাস শান্ত হলে মনও স্থির হয়।", author: "হঠযোগ প্রদীপিকা" },
  { text: "প্রকৃতি কখনো তাড়াহুড়ো করে না, তবু সবকিছু সম্পন্ন হয়।", author: "লাও জু" },
  { text: "তোমার ভেতরে একটি নীরবতা আছে, একটি আশ্রয় — যেখানে তুমি যেকোনো সময় ফিরে যেতে পারো।", author: "হেরমান হেসে" },
  { text: "বিশ্রামের সময় হলো যখন তোমার বিশ্রামের সময় নেই।", author: "সিডনি জে. হ্যারিস" },
  { text: "তোমার নিজের ছাড়া কেউই তোমাকে শান্তি দিতে পারে না।", author: "রালফ ওয়াল্ডো এমারসন" },
  { text: "যা আছে তা মেনে নাও। যা ছিল তা ছেড়ে দাও। যা আসবে তার উপর ভরসা রাখো।", author: "সোনিয়া রিকোত্তি" },
  { text: "তুমি যেখানে আছো সেখানেই থাকো, যেখানে থাকা উচিত মনে করো সেখানে নয়।", author: "অজানা" },
  { text: "সবর করো। নিশ্চয়ই আল্লাহ সবরকারীদের সাথে আছেন।", author: "আল-কুরআন (২:১৫৩)" },
  { text: "প্রতিটি শ্বাস একটি নতুন শুরু।", author: "অজানা" },
];

function hashDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getDailyQuote(language: "en" | "bn" = "en"): BreathingQuote {
  const today = new Date().toISOString().substring(0, 10);
  const quotes = language === "bn" ? QUOTES_BN : QUOTES_EN;
  const idx = hashDate(today) % quotes.length;
  return quotes[idx];
}
