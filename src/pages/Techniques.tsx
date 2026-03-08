import { useState } from "react";
import { Plus } from "lucide-react";
import TechniqueCard from "@/components/TechniqueCard";
import { PRESET_TECHNIQUES, BreathingTechnique } from "@/lib/techniques";
import { getCustomTechniques, getFavorites, toggleFavorite, saveCustomTechnique } from "@/lib/storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Techniques() {
  const [favorites, setFavorites] = useState(getFavorites);
  const [customTechniques, setCustomTechniques] = useState(getCustomTechniques);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", inhale: 4, hold1: 0, exhale: 4, hold2: 0 });

  const handleToggleFav = (id: string) => {
    toggleFavorite(id);
    setFavorites(getFavorites());
  };

  const handleCreateCustom = () => {
    const technique: BreathingTechnique = {
      id: `custom-${Date.now()}`,
      name: form.name || "Custom Technique",
      description: "Your custom breathing pattern.",
      benefits: ["Personalized"],
      difficulty: "beginner",
      isCustom: true,
      phases: [
        { type: "inhale", duration: form.inhale, label: "Breathe In" },
        ...(form.hold1 > 0 ? [{ type: "hold" as const, duration: form.hold1, label: "Hold" }] : []),
        { type: "exhale", duration: form.exhale, label: "Breathe Out" },
        ...(form.hold2 > 0 ? [{ type: "hold-after-exhale" as const, duration: form.hold2, label: "Hold" }] : []),
      ],
    };
    saveCustomTechnique(technique);
    setCustomTechniques(getCustomTechniques());
    setDialogOpen(false);
    setForm({ name: "", inhale: 4, hold1: 0, exhale: 4, hold2: 0 });
  };

  return (
    <div className="min-h-screen px-4 pb-24 pt-12">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Techniques</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary" className="gap-1">
                <Plus className="h-4 w-4" /> Custom
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Custom Technique</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="My technique" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Inhale (s)</Label>
                    <Input type="number" min={1} max={30} value={form.inhale} onChange={(e) => setForm({ ...form, inhale: +e.target.value })} />
                  </div>
                  <div>
                    <Label>Hold (s)</Label>
                    <Input type="number" min={0} max={30} value={form.hold1} onChange={(e) => setForm({ ...form, hold1: +e.target.value })} />
                  </div>
                  <div>
                    <Label>Exhale (s)</Label>
                    <Input type="number" min={1} max={30} value={form.exhale} onChange={(e) => setForm({ ...form, exhale: +e.target.value })} />
                  </div>
                  <div>
                    <Label>Hold 2 (s)</Label>
                    <Input type="number" min={0} max={30} value={form.hold2} onChange={(e) => setForm({ ...form, hold2: +e.target.value })} />
                  </div>
                </div>
                <Button className="w-full" onClick={handleCreateCustom}>Create Technique</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {[...PRESET_TECHNIQUES, ...customTechniques].map((t) => (
            <TechniqueCard
              key={t.id}
              technique={t}
              isFavorite={favorites.includes(t.id)}
              onToggleFavorite={() => handleToggleFav(t.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
