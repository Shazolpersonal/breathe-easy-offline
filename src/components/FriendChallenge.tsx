import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRESET_TECHNIQUES } from "@/lib/techniques";
import { getCustomTechniques } from "@/lib/storage";
import {
  generateChallengeLink,
  saveFriendChallenge,
  FriendChallengeParams,
  clearChallengeHash,
} from "@/lib/friendChallenge";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { Copy, Share2, Swords, Check, UserPlus } from "lucide-react";

interface CreateChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateChallengeDialog({ open, onOpenChange }: CreateChallengeDialogProps) {
  const { t } = useLanguage();
  const allTechniques = [...PRESET_TECHNIQUES, ...getCustomTechniques()];
  const [techniqueId, setTechniqueId] = useState(allTechniques[0]?.id || "");
  const [targetMinutes, setTargetMinutes] = useState(5);
  const [targetCycles, setTargetCycles] = useState(0);
  const [challengerName, setChallengerName] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  const handleGenerate = () => {
    const technique = allTechniques.find((t) => t.id === techniqueId);
    if (!technique || !challengerName.trim()) return;

    const params: FriendChallengeParams = {
      techniqueId,
      techniqueName: technique.name,
      targetMinutes,
      targetCycles,
      challengerName: challengerName.trim(),
      date: new Date().toISOString().substring(0, 10),
    };

    const link = generateChallengeLink(params);
    setGeneratedLink(link);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast({ title: t("challenge.friend.copied") });
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = generatedLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      toast({ title: t("challenge.friend.copied") });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("challenge.friend.shareTitle"),
          text: t("challenge.friend.shareText", { name: challengerName }),
          url: generatedLink,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            {t("challenge.friend.createTitle")}
          </DialogTitle>
          <DialogDescription>{t("challenge.friend.createDesc")}</DialogDescription>
        </DialogHeader>

        {!generatedLink ? (
          <div className="space-y-4">
            <div>
              <Label>{t("challenge.friend.yourName")}</Label>
              <Input
                value={challengerName}
                onChange={(e) => setChallengerName(e.target.value)}
                placeholder={t("challenge.friend.namePlaceholder")}
                className="mt-1"
              />
            </div>

            <div>
              <Label>{t("challenge.friend.technique")}</Label>
              <Select value={techniqueId} onValueChange={setTechniqueId}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allTechniques.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t("challenge.friend.targetMin")}</Label>
                <Input
                  type="number"
                  min={0}
                  max={60}
                  value={targetMinutes}
                  onChange={(e) => setTargetMinutes(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t("challenge.friend.targetCycles")}</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={targetCycles}
                  onChange={(e) => setTargetCycles(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!challengerName.trim() || !techniqueId}
              className="w-full"
            >
              {t("challenge.friend.generate")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-secondary/30 p-3">
              <p className="break-all text-xs text-muted-foreground">{generatedLink}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1 gap-1" onClick={handleCopy}>
                <Copy className="h-4 w-4" /> {t("challenge.friend.copy")}
              </Button>
              <Button className="flex-1 gap-1" onClick={handleShare}>
                <Share2 className="h-4 w-4" /> {t("challenge.friend.share")}
              </Button>
            </div>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setGeneratedLink("");
                onOpenChange(false);
              }}
            >
              {t("common.close")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface AcceptChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challenge: FriendChallengeParams | null;
}

export function AcceptChallengeDialog({ open, onOpenChange, challenge }: AcceptChallengeDialogProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);

  if (!challenge) return null;

  const handleAccept = () => {
    saveFriendChallenge(challenge);
    clearChallengeHash();
    setAccepted(true);
    toast({ title: t("challenge.friend.accepted") });
  };

  const handleStart = () => {
    onOpenChange(false);
    navigate(`/session?technique=${challenge.techniqueId}`);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) clearChallengeHash(); onOpenChange(v); }}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            {t("challenge.friend.incomingTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("challenge.friend.incomingDesc", { name: challenge.challengerName })}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("challenge.friend.technique")}</span>
            <span className="font-medium text-foreground">{challenge.techniqueName}</span>
          </div>
          {challenge.targetMinutes > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("challenge.friend.targetMin")}</span>
              <span className="font-medium text-foreground">{challenge.targetMinutes} min</span>
            </div>
          )}
          {challenge.targetCycles > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("challenge.friend.targetCycles")}</span>
              <span className="font-medium text-foreground">{challenge.targetCycles} {challenge.targetCycles === 1 ? t("common.cycle") : t("common.cycles")}</span>
            </div>
          )}
        </div>

        {!accepted ? (
          <Button onClick={handleAccept} className="w-full gap-1">
            <Check className="h-4 w-4" /> {t("challenge.friend.acceptButton")}
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-center text-sm text-primary font-medium">{t("challenge.friend.acceptedMessage")}</p>
            <Button onClick={handleStart} className="w-full">
              {t("session.startSession")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
