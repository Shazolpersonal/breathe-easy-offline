import { useState, useMemo } from "react";
import { Plus, Search, Filter, Trash2 } from "lucide-react";
import TechniqueCard from "@/components/TechniqueCard";
import { PRESET_TECHNIQUES, BreathingTechnique, PyramidConfig } from "@/lib/techniques";
import { getCustomTechniques, getFavorites, toggleFavorite, saveCustomTechnique, deleteCustomTechnique } from "@/lib/storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAllProgressionsPublic, isUnlocked, getProgression } from "@/lib/progression";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type DifficultyFilter = "all" | "beginner" | "intermediate" | "advanced" | "favorites";

export default function Techniques() {
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState(getFavorites);
  const [customTechniques, setCustomTechniques] = useState(getCustomTechniques);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", inhale: 4, hold1: 0, exhale: 4, hold2: 0, description: "", benefit: "" });
  const [pyramidEnabled, setPyramidEnabled] = useState(false);
  const [pyramidConfig, setPyramidConfig] = useState<PyramidConfig>({ startMultiplier: 1, peakMultiplier: 1.5, steps: 5 });
  const [filter, setFilter] = useState<DifficultyFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Bug 5: Memoize progressions to avoid per-card localStorage parsing

  const progressions = useMemo(() => getAllProgressionsPublic(), [favorites, customTechniques]);

  const progressionMap = useMemo(() => {
    const map: Record<string, ReturnType<typeof getProgression>> = {};
    for (const tech of [...PRESET_TECHNIQUES, ...customTechniques]) {
      const found = progressions.find(p => p.techniqueId === tech.id);
      map[tech.id] = found || { techniqueId: tech.id, level: 1, sessionsCompleted: 0, totalCycles: 0 };
    }
    return map;
  }, [progressions, customTechniques]);

  const handleToggleFav = (id: string) => {
    toggleFavorite(id);
    setFavorites(getFavorites());
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (form.name.length > 50) errors.push(t("techniques.validation.nameTooLong"));
    if (form.inhale < 1 || form.inhale > 30) errors.push(t("techniques.validation.inhaleRange"));
    if (form.exhale < 1 || form.exhale > 30) errors.push(t("techniques.validation.exhaleRange"));
    if (form.hold1 < 0 || form.hold1 > 30) errors.push(t("techniques.validation.holdRange"));
    if (form.hold2 < 0 || form.hold2 > 30) errors.push(t("techniques.validation.holdRange"));
    if (pyramidEnabled) {
      if (pyramidConfig.startMultiplier < 0.5 || pyramidConfig.startMultiplier > 3) errors.push(t("techniques.validation.multiplierRange"));
      if (pyramidConfig.peakMultiplier < 0.5 || pyramidConfig.peakMultiplier > 3) errors.push(t("techniques.validation.multiplierRange"));
      if (pyramidConfig.steps < 2 || pyramidConfig.steps > 10) errors.push(t("techniques.validation.stepsRange"));
    }
    if (form.description.length > 200) errors.push(t("techniques.validation.descTooLong"));
    return errors;
  };

  const handleCreateCustom = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);

    // Bug 2: Store phase type as label key, resolve at render time
    // Bug 3: Use localized fallback name
    const technique: BreathingTechnique = {
      id: `custom-${Date.now()}`,
      name: form.name || t("techniques.customDefault"),
      description: form.description || t("techniques.customDescription"),
      benefits: form.benefit ? [form.benefit] : [t("techniques.personalizedBenefit")],
      difficulty: "beginner",
      isCustom: true,
      phases: [
        { type: "inhale", duration: Math.max(1, Math.min(30, form.inhale)), label: "inhale" },
        ...(form.hold1 > 0 ? [{ type: "hold" as const, duration: Math.max(0, Math.min(30, form.hold1)), label: "hold" }] : []),
        { type: "exhale", duration: Math.max(1, Math.min(30, form.exhale)), label: "exhale" },
        ...(form.hold2 > 0 ? [{ type: "hold-after-exhale" as const, duration: Math.max(0, Math.min(30, form.hold2)), label: "hold-after-exhale" }] : []),
      ],
      ...(pyramidEnabled ? { pyramid: { ...pyramidConfig, steps: Math.max(2, Math.min(10, pyramidConfig.steps)) } } : {}),
    };
    saveCustomTechnique(technique);
    setCustomTechniques(getCustomTechniques());
    setDialogOpen(false);
    setForm({ name: "", inhale: 4, hold1: 0, exhale: 4, hold2: 0, description: "", benefit: "" });
    setPyramidEnabled(false);
    setPyramidConfig({ startMultiplier: 1, peakMultiplier: 1.5, steps: 5 });
  };

  const handleDelete = (id: string) => {
    deleteCustomTechnique(id);
    setCustomTechniques(getCustomTechniques());
    setDeleteTarget(null);
  };

  // Bug 8: Show full cycle duration per pyramid step
  const pyramidPreview = pyramidEnabled
    ? Array.from({ length: pyramidConfig.steps * 2 - 1 }, (_, i) => {
        const pos = i < pyramidConfig.steps ? i : (pyramidConfig.steps * 2 - 2) - i;
        const mult = pyramidConfig.steps > 1
          ? pyramidConfig.startMultiplier + (pos / (pyramidConfig.steps - 1)) * (pyramidConfig.peakMultiplier - pyramidConfig.startMultiplier)
          : pyramidConfig.startMultiplier;
        const cycleDur = [form.inhale, form.hold1, form.exhale, form.hold2]
          .filter(v => v > 0)
          .reduce((sum, v) => sum + Math.round(v * mult), 0);
        return cycleDur;
      })
    : [];

  // Bug 6: Filtering & search
  const allTechniques = [...PRESET_TECHNIQUES, ...customTechniques];

  const filteredTechniques = useMemo(() => {
    let result = allTechniques;
    if (filter === "favorites") {
      result = result.filter(t => favorites.includes(t.id));
    } else if (filter !== "all") {
      result = result.filter(t => t.difficulty === filter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => {
        const name = t.name.toLowerCase();
        return name.includes(q);
      });
    }
    return result;
  }, [filter, searchQuery, favorites, customTechniques]);

  return (
    <div className="min-h-screen px-4 pb-24 pt-12">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">{t("techniques.title")}</h1>
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
              {t("techniques.count", { count: String(allTechniques.length) })}
            </span>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary" className="gap-1">
                <Plus className="h-4 w-4" /> {t("techniques.custom")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("techniques.createCustom")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>{t("techniques.name")}</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value.slice(0, 50) })} placeholder={t("techniques.namePlaceholder")} maxLength={50} />
                </div>

                {/* Bug 9: Editable description */}
                <div>
                  <Label>{t("techniques.description")}</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value.slice(0, 200) })} placeholder={t("techniques.descriptionPlaceholder")} maxLength={200} className="h-16 resize-none" />
                </div>
                <div>
                  <Label>{t("techniques.benefitLabel")}</Label>
                  <Input value={form.benefit} onChange={(e) => setForm({ ...form, benefit: e.target.value.slice(0, 50) })} placeholder={t("techniques.benefitPlaceholder")} maxLength={50} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>{t("techniques.inhale")}</Label>
                    <Input type="number" min={1} max={30} value={form.inhale} onChange={(e) => setForm({ ...form, inhale: Math.max(1, Math.min(30, +e.target.value || 1)) })} />
                  </div>
                  <div>
                    <Label>{t("techniques.hold")}</Label>
                    <Input type="number" min={0} max={30} value={form.hold1} onChange={(e) => setForm({ ...form, hold1: Math.max(0, Math.min(30, +e.target.value || 0)) })} />
                  </div>
                  <div>
                    <Label>{t("techniques.exhale")}</Label>
                    <Input type="number" min={1} max={30} value={form.exhale} onChange={(e) => setForm({ ...form, exhale: Math.max(1, Math.min(30, +e.target.value || 1)) })} />
                  </div>
                  <div>
                    <Label>{t("techniques.hold2")}</Label>
                    <Input type="number" min={0} max={30} value={form.hold2} onChange={(e) => setForm({ ...form, hold2: Math.max(0, Math.min(30, +e.target.value || 0)) })} />
                  </div>
                </div>

                {/* Pyramid Mode */}
                <div className="rounded-xl border border-border bg-secondary/30 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{t("techniques.pyramidMode")}</Label>
                    <Switch checked={pyramidEnabled} onCheckedChange={setPyramidEnabled} />
                  </div>
                  {pyramidEnabled && (
                    <>
                      <p className="text-xs text-muted-foreground">{t("techniques.pyramidDesc")}</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">{t("techniques.pyramidStart")}</Label>
                          <Input type="number" min={0.5} max={3} step={0.1} value={pyramidConfig.startMultiplier}
                            onChange={e => setPyramidConfig({ ...pyramidConfig, startMultiplier: Math.max(0.5, Math.min(3, +e.target.value || 0.5)) })} className="h-8 text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs">{t("techniques.pyramidPeak")}</Label>
                          <Input type="number" min={0.5} max={3} step={0.1} value={pyramidConfig.peakMultiplier}
                            onChange={e => setPyramidConfig({ ...pyramidConfig, peakMultiplier: Math.max(0.5, Math.min(3, +e.target.value || 0.5)) })} className="h-8 text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs">{t("techniques.pyramidSteps")}</Label>
                          <Input type="number" min={2} max={10} value={pyramidConfig.steps}
                            onChange={e => setPyramidConfig({ ...pyramidConfig, steps: Math.max(2, Math.min(10, +e.target.value || 2)) })} className="h-8 text-xs" />
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("techniques.pyramidCyclePreview")} {pyramidPreview.join("s → ")}s
                      </div>
                    </>
                  )}
                </div>

                {/* Validation errors */}
                {validationErrors.length > 0 && (
                  <div className="rounded-lg bg-destructive/10 p-2 text-xs text-destructive space-y-1">
                    {validationErrors.map((err, i) => <p key={i}>• {err}</p>)}
                  </div>
                )}

                <Button className="w-full" onClick={handleCreateCustom}>{t("techniques.createButton")}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Bug 6: Search & Filter */}
        <div className="mb-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("techniques.searchPlaceholder")}
              className="h-9 pl-8 text-sm"
            />
          </div>
        </div>
        <div className="mb-4 overflow-x-auto">
          <ToggleGroup type="single" value={filter} onValueChange={(v) => v && setFilter(v as DifficultyFilter)} className="justify-start gap-1">
            <ToggleGroupItem value="all" size="sm" className="h-7 text-xs px-2.5">{t("techniques.filterAll")}</ToggleGroupItem>
            <ToggleGroupItem value="beginner" size="sm" className="h-7 text-xs px-2.5">{t("difficulty.beginner")}</ToggleGroupItem>
            <ToggleGroupItem value="intermediate" size="sm" className="h-7 text-xs px-2.5">{t("difficulty.intermediate")}</ToggleGroupItem>
            <ToggleGroupItem value="advanced" size="sm" className="h-7 text-xs px-2.5">{t("difficulty.advanced")}</ToggleGroupItem>
            <ToggleGroupItem value="favorites" size="sm" className="h-7 text-xs px-2.5">★ {t("techniques.filterFavorites")}</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-3">
          {filteredTechniques.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <Filter className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">{t("techniques.noResults")}</p>
            </div>
          )}
          {filteredTechniques.map((tech) => (
            <div key={tech.id} className="relative">
              <TechniqueCard
                technique={tech}
                isFavorite={favorites.includes(tech.id)}
                onToggleFavorite={() => handleToggleFav(tech.id)}
                progression={progressionMap[tech.id]}
              />
              {/* Bug 1: Delete button for custom techniques */}
              {tech.isCustom && (
                <button
                  onClick={() => setDeleteTarget(tech.id)}
                  className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label={t("techniques.delete")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("techniques.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("techniques.deleteConfirmDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && handleDelete(deleteTarget)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("techniques.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
