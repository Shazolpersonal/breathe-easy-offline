import { useState, useRef, useEffect, useCallback } from "react";
import { HeartRateMonitor as HRMonitor } from "@/lib/heartRate";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { X, Heart, Activity } from "lucide-react";

interface HeartRateMonitorProps {
  open: boolean;
  onClose: () => void;
  onData?: (bpm: number | null, coherence: number) => void;
  currentPhase?: string;
}

export default function HeartRateMonitorOverlay({ open, onClose, onData, currentPhase }: HeartRateMonitorProps) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const monitorRef = useRef<HRMonitor | null>(null);

  const [bpm, setBpm] = useState<number | null>(null);
  const [signalQuality, setSignalQuality] = useState(0);
  const [coherence, setCoherence] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(false);

  const startMonitor = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const monitor = new HRMonitor();
    monitorRef.current = monitor;

    monitor.onUpdate((data) => {
      setBpm(data.bpm);
      setSignalQuality(data.signalQuality);
      setCoherence(data.coherence);
      setIsReady(data.isReady);
      if (data.bpm !== null) {
        onData?.(data.bpm, data.coherence);
      }
    });

    const success = await monitor.start(videoRef.current, canvasRef.current);
    if (!success) setError(true);
  }, [onData]);

  useEffect(() => {
    if (open) {
      setError(false);
      setBpm(null);
      setIsReady(false);
      // Small delay to let DOM render
      const timer = setTimeout(startMonitor, 100);
      return () => clearTimeout(timer);
    } else {
      monitorRef.current?.stop();
      monitorRef.current = null;
    }
  }, [open, startMonitor]);

  useEffect(() => {
    if (currentPhase && monitorRef.current) {
      monitorRef.current.setBreathingPhase(currentPhase);
    }
  }, [currentPhase]);

  useEffect(() => {
    return () => {
      monitorRef.current?.stop();
      monitorRef.current = null;
    };
  }, []);

  if (!open) return null;

  const getCoherenceLabel = () => {
    if (coherence >= 70) return t("heart.highCoherence");
    if (coherence >= 40) return t("heart.moderateCoherence");
    return t("heart.lowCoherence");
  };

  const getQualityColor = () => {
    if (signalQuality >= 60) return "bg-green-500";
    if (signalQuality >= 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        {/* Close button */}
        <div className="flex justify-end">
          <Button size="icon" variant="ghost" onClick={onClose} aria-label={t("common.close")}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Hidden video + canvas */}
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas ref={canvasRef} className="hidden" />

        {error ? (
          <div className="space-y-3">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("heart.cameraError")}</p>
            <Button variant="secondary" onClick={() => { setError(false); startMonitor(); }}>
              {t("heart.retry")}
            </Button>
          </div>
        ) : (
          <>
            {/* BPM display */}
            <div className="space-y-2">
              <Heart
                className={`mx-auto h-16 w-16 text-destructive ${isReady ? "animate-pulse" : ""}`}
              />
              {isReady && bpm !== null ? (
                <div>
                  <span className="text-5xl font-bold tabular-nums text-foreground">{bpm}</span>
                  <span className="ml-1 text-lg text-muted-foreground">BPM</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-lg font-medium text-foreground">{t("heart.warmingUp")}</p>
                  <p className="text-sm text-muted-foreground">{t("heart.placeFingerTip")}</p>
                </div>
              )}
            </div>

            {/* Signal quality bar */}
            <div className="mx-auto max-w-xs space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("heart.signalQuality")}</span>
                <span>{signalQuality}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${getQualityColor()}`}
                  style={{ width: `${signalQuality}%` }}
                />
              </div>
            </div>

            {/* Coherence */}
            {isReady && (
              <div className="mx-auto max-w-xs rounded-xl border border-border bg-card p-3 space-y-1.5">
                <div className="flex items-center justify-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{t("heart.coherence")}</span>
                </div>
                <div className="text-2xl font-bold text-primary">{coherence}%</div>
                <p className="text-xs text-muted-foreground">{getCoherenceLabel()}</p>
              </div>
            )}

            {/* Instructions */}
            {!isReady && (
              <p className="text-xs text-muted-foreground">{t("heart.instructions")}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
