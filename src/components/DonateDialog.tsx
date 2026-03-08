import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { openDonationAsync, preloadDonateScript } from "@/lib/donate";
import { toast } from "sonner";

interface DonateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DonateDialog({ open, onOpenChange }: DonateDialogProps) {
  const { t, language } = useLanguage();
  const isBn = language === "bn";
  const currency = isBn ? "BDT" as const : "USD" as const;
  const symbol = isBn ? "৳" : "$";

  const presets = isBn ? [200, 500, 1000, 2500] : [2, 5, 10, 25];
  const [selected, setSelected] = useState<number | null>(presets[1]);
  const [custom, setCustom] = useState("");
  const [thanks, setThanks] = useState(false);

  const amount = selected ?? (parseFloat(custom) || 0);

  const handleDonate = () => {
    if (amount <= 0) {
      toast.error(t("donate.invalidAmount"));
      return;
    }

    if (!isDonateAvailable()) {
      toast.error(t("donate.unavailable"));
      return;
    }

    const success = openDonation({
      amount,
      currency,
      language,
      onSuccess: () => {
        setThanks(true);
        toast.success(t("donate.thanks"));
      },
      onClose: () => {},
    });

    if (!success) {
      toast.error(t("donate.unavailable"));
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setThanks(false);
      setSelected(presets[1]);
      setCustom("");
    }
    onOpenChange(val);
  };

  if (thanks) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-sm">
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
              <Heart className="h-8 w-8 text-primary fill-primary" />
            </div>
            <DialogHeader className="items-center">
              <DialogTitle>{t("donate.thanksTitle")}</DialogTitle>
              <DialogDescription>{t("donate.thanks")}</DialogDescription>
            </DialogHeader>
            <Button onClick={() => handleClose(false)}>{t("session.done.button")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            {t("donate.title")}
          </DialogTitle>
          <DialogDescription>{t("donate.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preset amounts */}
          <div className="grid grid-cols-4 gap-2">
            {presets.map((p) => (
              <Button
                key={p}
                variant={selected === p ? "default" : "outline"}
                size="sm"
                onClick={() => { setSelected(p); setCustom(""); }}
                className="text-sm font-medium"
              >
                {symbol}{p}
              </Button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">{symbol}</span>
            <Input
              type="number"
              min="1"
              placeholder={t("donate.custom")}
              value={custom}
              onChange={(e) => {
                setCustom(e.target.value);
                setSelected(null);
              }}
              className="flex-1"
            />
          </div>

          {/* Donate button */}
          <Button
            className="w-full gap-2"
            disabled={amount <= 0}
            onClick={handleDonate}
          >
            <Heart className="h-4 w-4" />
            {t("donate.button")} {amount > 0 ? `${symbol}${amount}` : ""}
          </Button>

          <p className="text-center text-[11px] text-muted-foreground">
            {t("donate.secure")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
