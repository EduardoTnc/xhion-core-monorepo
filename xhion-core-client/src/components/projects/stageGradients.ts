import { type Etapa } from "@/services/projectService";

export const STAGE_GRADIENT_PRESETS = {
  aurora: {
    label: "Aurora",
    stops: ["#4f46e5", "#06b6d4"],
  },
  sunset: {
    label: "Atardecer",
    stops: ["#f97316", "#ec4899"],
  },
  jungle: {
    label: "Selva",
    stops: ["#22c55e", "#15803d"],
  },
} as const;

export type StageGradientPresetKey = keyof typeof STAGE_GRADIENT_PRESETS;

const hexToRgb = (hex: string) => {
  let sanitized = hex.replace("#", "");
  if (sanitized.length === 3) {
    sanitized = sanitized
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const parsed = parseInt(sanitized, 16);
  if (Number.isNaN(parsed)) {
    return { r: 0, g: 0, b: 0 };
  }

  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;
  return { r, g, b };
};

const interpolateHex = (from: string, to: string, t: number) => {
  const start = hexToRgb(from);
  const end = hexToRgb(to);
  const clampT = Math.max(0, Math.min(1, t));
  const r = Math.round(start.r + (end.r - start.r) * clampT);
  const g = Math.round(start.g + (end.g - start.g) * clampT);
  const b = Math.round(start.b + (end.b - start.b) * clampT);
  return `#${[r, g, b]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
};

export const buildStageColorMap = (
  etapas: Etapa[],
  presetKey: StageGradientPresetKey
): Record<string, string> => {
  const preset = STAGE_GRADIENT_PRESETS[presetKey];
  if (!preset || etapas.length === 0) {
    return {};
  }

  const stops = preset.stops;
  if (stops.length === 0) {
    return {};
  }

  const ordered = [...etapas].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  if (ordered.length === 0) {
    return {};
  }

  const segmentLength = stops.length > 1 ? 1 / (stops.length - 1) : 1;

  return ordered.reduce<Record<string, string>>((acc, etapa, index) => {
    if (stops.length === 1) {
      acc[etapa.id] = stops[0];
      return acc;
    }

    const ratio = ordered.length === 1 ? 0.5 : index / (ordered.length - 1);
    const segmentIndex = Math.min(Math.floor(ratio / segmentLength), stops.length - 2);
    const localRatio = (ratio - segmentIndex * segmentLength) / segmentLength;
    const start = stops[segmentIndex];
    const end = stops[segmentIndex + 1];

    acc[etapa.id] = interpolateHex(start, end, Number.isFinite(localRatio) ? localRatio : 0);
    return acc;
  }, {});
};
