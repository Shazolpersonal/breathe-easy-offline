import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, Play, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROGRAMS, Program, getEnrollments, enrollInProgram, unenrollFromProgram, ProgramEnrollment } from "@/lib/programs";
import { getTechniqueById, PRESET_TECHNIQUES } from "@/lib/techniques";
import { getCustomTechniques } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Programs() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [enrollments, setEnrollments] = useState(getEnrollments);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

  const refresh = () => setEnrollments(getEnrollments());

  const handleEnroll = (programId: string) => {
    enrollInProgram(programId);
    refresh();
  };

  const handleUnenroll = (programId: string) => {
    unenrollFromProgram(programId);
    refresh();
  };

  const startDay = (programId: string, day: number, techniqueId: string, duration: number) => {
    navigate(`/session?technique=${techniqueId}&duration=${duration}&program=${programId}&day=${day}`);
  };

  const getProgramName = (id: string, fallback: string) => {
    const key = `program.${id}.name`;
    const translated = t(key);
    return translated !== key ? translated : fallback;
  };

  const getProgramDesc = (id: string, fallback: string) => {
    const key = `program.${id}.description`;
    const translated = t(key);
    return translated !== key ? translated : fallback;
  };

  const getDayTip = (programId: string, day: number, fallback: string) => {
    const key = `program.${programId}.day${day}.tip`;
    const translated = t(key);
    return translated !== key ? translated : fallback;
  };

  const getTechniqueName = (id: string) => {
    const key = `technique.${id}.name`;
    const translated = t(key);
    if (translated !== key) return translated;
    const tech = getTechniqueById(id, getCustomTechniques());
    return tech?.name || id;
  };

  const program = selectedProgram ? PROGRAMS.find(p => p.id === selectedProgram) : null;
  const enrollment = selectedProgram ? enrollments.find(e => e.programId === selectedProgram) : null;

  if (program) {
    const completedDays = enrollment?.completedDays || [];
    const nextDay = program.days.find(d => !completedDays.includes(d.day))?.day || null;

    return (
      <div className="min-h-screen px-4 pb-24 pt-12">
        <div className="mx-auto max-w-md">
          <button onClick={() => setSelectedProgram(null)} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {t("programs.back")}
          </button>

          <div className="mb-6">
            <span className="text-4xl">{program.emoji}</span>
            <h1 className="mt-2 text-2xl font-bold text-foreground">{getProgramName(program.id, program.name)}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{getProgramDesc(program.id, program.description)}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("programs.daysCompleted", { completed: completedDays.length, total: program.days.length })}
            </p>
          </div>

          {!enrollment ? (
            <Button className="w-full mb-6" onClick={() => handleEnroll(program.id)}>
              {t("programs.startProgram")}
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="mb-6 text-xs text-muted-foreground" onClick={() => handleUnenroll(program.id)}>
              {t("programs.leaveProgram")}
            </Button>
          )}

          <div className="space-y-2">
            {program.days.map((day) => {
              const completed = completedDays.includes(day.day);
              const isNext = day.day === nextDay && enrollment;

              return (
                <div
                  key={day.day}
                  className={cn(
                    "rounded-2xl border p-4 transition-colors",
                    completed ? "border-primary/30 bg-primary/5" : isNext ? "border-primary bg-card" : "border-border bg-card opacity-70"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {completed ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{t("programs.dayLabel", { day: day.day })}</span>
                        {isNext && <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">{t("programs.next")}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{getTechniqueName(day.techniqueId)} · {day.durationMinutes} {t("common.min")}</p>
                      <p className="mt-1 text-xs text-muted-foreground/80 italic">{getDayTip(program.id, day.day, day.tip)}</p>
                    </div>
                    {enrollment && !completed && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 shrink-0"
                        onClick={() => startDay(program.id, day.day, day.techniqueId, day.durationMinutes)}
                        aria-label={t("session.start")}
                      >
                        <Play className="h-4 w-4 text-primary" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pb-24 pt-12">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-bold text-foreground">{t("programs.title")}</h1>

        <div className="space-y-3">
          {PROGRAMS.map((p) => {
            const e = enrollments.find(en => en.programId === p.id);
            const progress = e
              ? `${e.completedDays.length}/${p.days.length} ${t("common.days")}`
              : t("programs.daysCount", { count: p.days.length });

            return (
              <button
                key={p.id}
                onClick={() => setSelectedProgram(p.id)}
                className="w-full rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{getProgramName(p.id, p.name)}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{getProgramDesc(p.id, p.description)}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{progress}</span>
                      {e && (
                        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">{t("programs.enrolled")}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
