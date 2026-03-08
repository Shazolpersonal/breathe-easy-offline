import BreathingCircle from "./BreathingCircle";
import WaveVisualization from "./visualizations/WaveVisualization";
import BarsVisualization from "./visualizations/BarsVisualization";
import MandalaVisualization from "./visualizations/MandalaVisualization";
import { useSettings } from "@/contexts/SettingsContext";

export type VisualizationType = "circle" | "wave" | "bars" | "mandala";

interface Props {
  phase: "inhale" | "hold" | "exhale" | "hold-after-exhale" | "idle";
  phaseDuration: number;
  label: string;
  secondsLeft: number;
}

export default function BreathingVisualizer(props: Props) {
  const { settings } = useSettings();
  const type = (settings.visualizationType || "circle") as VisualizationType;

  switch (type) {
    case "wave":
      return <WaveVisualization {...props} />;
    case "bars":
      return <BarsVisualization {...props} />;
    case "mandala":
      return <MandalaVisualization {...props} />;
    default:
      return <BreathingCircle {...props} />;
  }
}
