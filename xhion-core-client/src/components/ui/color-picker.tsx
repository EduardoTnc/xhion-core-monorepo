import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

const PRESET_COLORS = [
  "#EF4444", // Red
  "#F97316", // Orange
  "#F59E0B", // Amber
  "#EAB308", // Yellow
  "#84CC16", // Lime
  "#22C55E", // Green
  "#10B981", // Emerald
  "#14B8A6", // Teal
  "#06B6D4", // Cyan
  "#0EA5E9", // Sky
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#A855F7", // Purple
  "#D946EF", // Fuchsia
  "#EC4899", // Pink
  "#F43F5E", // Rose
  "#64748B", // Slate
];

export function ColorPicker({ value = "#3B82F6", onChange, label, className }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(value);

  const handleColorChange = (color: string) => {
    setCustomColor(color);
    onChange(color);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <div className="flex items-center gap-2 w-full">
              <div
                className="h-5 w-5 rounded border border-border shrink-0"
                style={{ backgroundColor: value }}
              />
              <span className="flex-1">{value || "Seleccionar color"}</span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Colores predefinidos</Label>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "h-8 w-8 rounded border-2 transition-all hover:scale-110",
                      value === color ? "border-primary ring-2 ring-primary ring-offset-2" : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-color" className="text-xs text-muted-foreground">
                Color personalizado
              </Label>
              <div className="flex gap-2">
                <Input
                  id="custom-color"
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="#3B82F6"
                  maxLength={7}
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleColorChange(customColor)}
                  disabled={!/^#[0-9A-Fa-f]{6}$/.test(customColor)}
                >
                  Aplicar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Formato: #RRGGBB (ej: #3B82F6)
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Vista previa</Label>
              <div className="flex items-center gap-2">
                <div
                  className="h-12 w-full rounded border border-border"
                  style={{ backgroundColor: value }}
                />
                <div className="text-sm font-mono">{value}</div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
