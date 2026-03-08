import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Play, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRESET_TECHNIQUES } from "@/lib/techniques";
import { getCustomTechniques } from "@/lib/storage";
import { getPlaylists, savePlaylist, deletePlaylist, Playlist, PlaylistStep } from "@/lib/playlists";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Playlists() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [playlists, setPlaylists] = useState(getPlaylists);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [steps, setSteps] = useState<PlaylistStep[]>([]);

  const allTechniques = [...PRESET_TECHNIQUES, ...getCustomTechniques()];

  const getTechniqueName = (id: string) => {
    const key = `technique.${id}.name`;
    const translated = t(key);
    if (translated !== key) return translated;
    return allTechniques.find(tech => tech.id === id)?.name || id;
  };

  const openCreate = () => {
    setEditId(null);
    setName("");
    setSteps([{ techniqueId: "box-breathing", durationMinutes: 3 }]);
    setDialogOpen(true);
  };

  const openEdit = (p: Playlist) => {
    setEditId(p.id);
    setName(p.name);
    setSteps([...p.steps]);
    setDialogOpen(true);
  };

  const addStep = () => {
    setSteps([...steps, { techniqueId: "box-breathing", durationMinutes: 3 }]);
  };

  const removeStep = (i: number) => {
    if (steps.length <= 1) return;
    setSteps(steps.filter((_, idx) => idx !== i));
  };

  const updateStep = (i: number, partial: Partial<PlaylistStep>) => {
    setSteps(steps.map((s, idx) => idx === i ? { ...s, ...partial } : s));
  };

  const handleSave = () => {
    const playlist: Playlist = {
      id: editId || `playlist-${Date.now()}`,
      name: name || t("playlists.namePlaceholder"),
      steps,
    };
    savePlaylist(playlist);
    setPlaylists(getPlaylists());
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deletePlaylist(id);
    setPlaylists(getPlaylists());
  };

  const startPlaylist = (id: string) => {
    navigate(`/session?playlist=${id}`);
  };

  const totalMin = (p: Playlist) => p.steps.reduce((s, st) => s + st.durationMinutes, 0);

  return (
    <div className="min-h-screen px-4 pb-24 pt-12">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">{t("playlists.title")}</h1>
          <Button size="sm" variant="secondary" className="gap-1" onClick={openCreate}>
            <Plus className="h-4 w-4" /> {t("playlists.new")}
          </Button>
        </div>

        {playlists.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="text-4xl">🎵</span>
            <p className="text-sm text-muted-foreground">{t("playlists.empty")}</p>
            <Button size="sm" onClick={openCreate}>{t("playlists.createFirst")}</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {playlists.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{p.name}</h3>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startPlaylist(p.id)}>
                      <Play className="h-4 w-4 text-primary" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  {p.steps.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">{i + 1}</span>
                      <span>{getTechniqueName(s.techniqueId)}</span>
                      <span>·</span>
                      <span>{s.durationMinutes} {t("common.min")}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{t("playlists.totalMin", { min: totalMin(p), steps: p.steps.length })}</p>
                <button onClick={() => openEdit(p)} className="mt-1 text-xs text-primary hover:underline">{t("playlists.edit")}</button>
              </div>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId ? t("playlists.editTitle") : t("playlists.newTitle")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>{t("playlists.name")}</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder={t("playlists.namePlaceholder")} />
              </div>

              <div className="space-y-3">
                <Label>{t("playlists.steps")}</Label>
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl border border-border bg-secondary/30 p-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Select value={step.techniqueId} onValueChange={v => updateStep(i, { techniqueId: v })}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allTechniques.map(tech => (
                            <SelectItem key={tech.id} value={tech.id}>{getTechniqueName(tech.id)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={30}
                          value={step.durationMinutes}
                          onChange={e => updateStep(i, { durationMinutes: +e.target.value })}
                          className="h-8 w-20 text-xs"
                        />
                        <span className="text-xs text-muted-foreground">{t("common.min")}</span>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => removeStep(i)} disabled={steps.length <= 1}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button size="sm" variant="secondary" className="w-full gap-1" onClick={addStep}>
                  <Plus className="h-4 w-4" /> {t("playlists.addStep")}
                </Button>
              </div>

              <Button className="w-full" onClick={handleSave}>
                {editId ? t("playlists.saveChanges") : t("playlists.createPlaylist")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
