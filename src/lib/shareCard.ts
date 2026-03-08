import { en } from "@/locales/en";
import { bn } from "@/locales/bn";

export interface ShareCardData {
  techniqueName: string;
  durationMinutes: number;
  cycles: number;
  calmScore?: number;
  date: string;
}

function getComputedHSL(varName: string): string {
  const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return val ? `hsl(${val})` : "#888";
}

function tCard(key: string, lang: string, params?: Record<string, string | number>): string {
  const map = lang === "bn" ? bn : en;
  let str = map[key] ?? en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(v));
    }
  }
  return str;
}

export async function generateSessionCard(data: ShareCardData, lang: string = "en"): Promise<Blob> {
  const W = 1080, H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const bg = getComputedHSL("--background");
  const primary = getComputedHSL("--primary");
  const accent = getComputedHSL("--accent");

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, bg);
  grad.addColorStop(1, primary);
  ctx.fillStyle = grad;
  ctx.roundRect(0, 0, W, H, 0);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(W / 2, H / 2 - 40, 200, 0, Math.PI * 2);
  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.15;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.font = "80px serif";
  ctx.textAlign = "center";
  ctx.fillText("🧘", W / 2, 280);

  ctx.font = "bold 48px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = getComputedHSL("--foreground");
  ctx.fillText(tCard("share.sessionComplete", lang), W / 2, 380);

  ctx.font = "32px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = primary;
  ctx.fillText(data.techniqueName, W / 2, 440);

  ctx.font = "bold 64px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = getComputedHSL("--foreground");
  ctx.fillText(`${data.durationMinutes} ${tCard("common.min", lang)}`, W / 2, 560);

  ctx.font = "28px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = getComputedHSL("--muted-foreground");
  ctx.fillText(tCard("share.cyclesCompleted", lang, { cycles: data.cycles }), W / 2, 610);

  if (data.calmScore != null) {
    ctx.font = "bold 36px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = primary;
    ctx.fillText(tCard("share.calmScore", lang, { score: data.calmScore }), W / 2, 680);
  }

  const locale = lang === "bn" ? "bn" : "en";
  const dateStr = new Date(data.date).toLocaleDateString(locale, {
    month: "long", day: "numeric", year: "numeric",
  });
  ctx.font = "24px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = getComputedHSL("--muted-foreground");
  ctx.fillText(dateStr, W / 2, 760);

  ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = getComputedHSL("--foreground");
  ctx.globalAlpha = 0.6;
  ctx.fillText(tCard("home.appName", lang), W / 2, H - 80);
  ctx.globalAlpha = 1;

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

export async function shareOrDownloadCard(data: ShareCardData, lang: string = "en") {
  const blob = await generateSessionCard(data, lang);
  const file = new File([blob], "muhurto-session.png", { type: "image/png" });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: tCard("share.shareTitle", lang),
        text: tCard("share.shareText", lang, { min: data.durationMinutes, technique: data.techniqueName }),
        files: [file],
      });
      return;
    } catch { /* user cancelled */ }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "muhurto-session.png";
  a.click();
  URL.revokeObjectURL(url);
}
