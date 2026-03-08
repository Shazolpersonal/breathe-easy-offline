import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutItem {
  key: string;
  labelKey: string;
}

const GLOBAL_SHORTCUTS: ShortcutItem[] = [
  { key: "1", labelKey: "shortcut.goHome" },
  { key: "2", labelKey: "shortcut.goSession" },
  { key: "3", labelKey: "shortcut.goLibrary" },
  { key: "4", labelKey: "shortcut.goStats" },
  { key: "?", labelKey: "shortcut.showHelp" },
];

const SESSION_SHORTCUTS: ShortcutItem[] = [
  { key: "Space", labelKey: "shortcut.playPause" },
  { key: "Esc", labelKey: "shortcut.stop" },
  { key: "F", labelKey: "shortcut.zenMode" },
  { key: "M", labelKey: "shortcut.toggleVoice" },
  { key: "S", labelKey: "shortcut.toggleSound" },
];

function ShortcutRow({ shortcut }: { shortcut: ShortcutItem }) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-foreground">{t(shortcut.labelKey)}</span>
      <kbd className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
        {shortcut.key}
      </kbd>
    </div>
  );
}

export default function KeyboardShortcutsHelp({ open, onOpenChange }: Props) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("shortcut.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("shortcut.global")}
            </h3>
            <div className="divide-y divide-border">
              {GLOBAL_SHORTCUTS.map((s) => (
                <ShortcutRow key={s.key} shortcut={s} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("shortcut.session")}
            </h3>
            <div className="divide-y divide-border">
              {SESSION_SHORTCUTS.map((s) => (
                <ShortcutRow key={s.key} shortcut={s} />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
