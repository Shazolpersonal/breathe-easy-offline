import { toast } from "sonner";

const APP_URL = "https://muhurto.lovable.app";

async function nativeShareOrCopy(data: { title: string; text: string; url?: string }) {
  try {
    if (navigator.share) {
      await navigator.share(data);
      return;
    }
  } catch (e: unknown) {
    if (e?.name === "AbortError") return; // user cancelled
  }
  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(data.url ? `${data.text}\n${data.url}` : data.text);
    toast.success(data.url ? "Link copied!" : "Copied to clipboard!");
  } catch {
    toast.error("Could not share");
  }
}

export function shareApp(lang: "en" | "bn") {
  const text = lang === "bn"
    ? "আমি মুহূর্ত ব্রেথ দিয়ে শ্বাস-প্রশ্বাসের অনুশীলন করি — বিনামূল্যে ব্যবহার করুন!"
    : "I use Muhurto Breath for breathing exercises — try it free!";
  nativeShareOrCopy({ title: "Muhurto Breath", text, url: APP_URL });
}

export function shareQuote(quoteText: string, author: string, lang: "en" | "bn") {
  const via = lang === "bn" ? "মুহূর্ত ব্রেথ এ পাওয়া" : "Found on Muhurto Breath";
  const text = `"${quoteText}" — ${author}\n\n${via}`;
  nativeShareOrCopy({ title: "Daily Quote", text, url: APP_URL });
}

export function shareStreak(days: number, lang: "en" | "bn") {
  const text = lang === "bn"
    ? `আমি টানা ${days} দিন মুহূর্ত ব্রেথ এ শ্বাস-প্রশ্বাসের অনুশীলন করেছি 🔥`
    : `I've practiced breathing ${days} days in a row on Muhurto Breath 🔥`;
  nativeShareOrCopy({ title: "Streak", text, url: APP_URL });
}

export function shareBadge(badgeName: string, emoji: string, lang: "en" | "bn") {
  const text = lang === "bn"
    ? `আমি মুহূর্ত ব্রেথ এ "${badgeName}" ${emoji} ব্যাজ অর্জন করেছি!`
    : `I just earned the "${badgeName}" ${emoji} badge on Muhurto Breath!`;
  nativeShareOrCopy({ title: "Badge Unlock", text, url: APP_URL });
}

export function shareTechnique(name: string, description: string, lang: "en" | "bn") {
  const cta = lang === "bn"
    ? "মুহূর্ত ব্রেথ এ চেষ্টা করুন"
    : "Try it on Muhurto Breath";
  const text = `${name} — ${description}\n\n${cta}`;
  nativeShareOrCopy({ title: name, text, url: APP_URL });
}
