"use client"

import { useEffect, useMemo } from "react"
import { useSystemSettingsStore } from "@/store/systemSettingsStore"

// Preset themes - each with primary and secondary colors
export const PRESET_THEMES = {
    default: {
        name: "Xhion Gold",
        primary: "#FFBF00",
        secondary: "#1a1a2e",
        accent: "#3b82f6",
        description: "El tema dorado original de Xhion",
    },
    ocean: {
        name: "Ocean Blue",
        primary: "#0ea5e9",
        secondary: "#0c4a6e",
        accent: "#06b6d4",
        description: "Profesional y tranquilo",
    },
    forest: {
        name: "Forest Green",
        primary: "#22c55e",
        secondary: "#14532d",
        accent: "#84cc16",
        description: "Natural y equilibrado",
    },
    sunset: {
        name: "Sunset Orange",
        primary: "#f97316",
        secondary: "#431407",
        accent: "#eab308",
        description: "Cálido y enérgico",
    },
    purple: {
        name: "Purple Night",
        primary: "#a855f7",
        secondary: "#3b0764",
        accent: "#ec4899",
        description: "Moderno y creativo",
    },
    crimson: {
        name: "Crimson Red",
        primary: "#ef4444",
        secondary: "#450a0a",
        accent: "#f43f5e",
        description: "Audaz y dinámico",
    },
} as const

export type PresetThemeKey = keyof typeof PRESET_THEMES

// Convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null
}

// Convert RGB to relative luminance
function luminance(r: number, g: number, b: number): number {
    const a = [r, g, b].map((v) => {
        v /= 255
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

// Determine if text should be white or black based on background
function getContrastColor(hexColor: string): string {
    const rgb = hexToRgb(hexColor)
    if (!rgb) return "#ffffff"
    const lum = luminance(rgb.r, rgb.g, rgb.b)
    return lum > 0.179 ? "#000000" : "#ffffff"
}

// Convert hex to oklch approximate (simplified conversion)
function hexToOklch(hex: string): string {
    const rgb = hexToRgb(hex)
    if (!rgb) return "oklch(0.5 0.15 200)"

    // Simplified conversion - normalize RGB to 0-1
    const r = rgb.r / 255
    const g = rgb.g / 255
    const b = rgb.b / 255

    // Calculate approximate lightness (0-1)
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)

    // Calculate approximate chroma (saturation)
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const c = (max - min) * 0.4 // Scaled chroma

    // Calculate hue
    let h = 0
    if (max !== min) {
        const d = max - min
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60
        else if (max === g) h = ((b - r) / d + 2) * 60
        else h = ((r - g) / d + 4) * 60
    }

    return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`
}

// Generate a lighter/darker shade of a color
function adjustLightness(hex: string, factor: number): string {
    const rgb = hexToRgb(hex)
    if (!rgb) return hex

    const adjust = (value: number) => {
        const adjusted = Math.round(value + (255 - value) * factor)
        return Math.min(255, Math.max(0, adjusted))
    }

    if (factor > 0) {
        // Lighten
        return `#${adjust(rgb.r).toString(16).padStart(2, '0')}${adjust(rgb.g).toString(16).padStart(2, '0')}${adjust(rgb.b).toString(16).padStart(2, '0')}`
    } else {
        // Darken
        const f = 1 + factor
        return `#${Math.round(rgb.r * f).toString(16).padStart(2, '0')}${Math.round(rgb.g * f).toString(16).padStart(2, '0')}${Math.round(rgb.b * f).toString(16).padStart(2, '0')}`
    }
}

export function useThemeCustomization() {
    const { settings } = useSystemSettingsStore()

    // Calculate derived theme values
    const themeValues = useMemo(() => {
        const primary = settings?.colorPrimario || PRESET_THEMES.default.primary
        const secondary = settings?.colorSecundario || PRESET_THEMES.default.secondary

        return {
            primary,
            secondary,
            primaryForeground: getContrastColor(primary),
            secondaryForeground: getContrastColor(secondary),
            primaryOklch: hexToOklch(primary),
            secondaryOklch: hexToOklch(secondary),
            primaryLight: adjustLightness(primary, 0.3),
            primaryDark: adjustLightness(primary, -0.3),
        }
    }, [settings?.colorPrimario, settings?.colorSecundario])

    // Apply theme colors to CSS variables
    useEffect(() => {
        if (!settings) return

        const root = document.documentElement

        // Apply primary color
        if (settings.colorPrimario) {
            root.style.setProperty('--color-primary-custom', settings.colorPrimario)
            root.style.setProperty('--color-primary-foreground-custom', themeValues.primaryForeground)

            // Apply primary to sidebar as well
            root.style.setProperty('--sidebar-primary-custom', settings.colorPrimario)
        }

        // Apply secondary color
        if (settings.colorSecundario) {
            root.style.setProperty('--color-secondary-custom', settings.colorSecundario)
            root.style.setProperty('--color-secondary-foreground-custom', themeValues.secondaryForeground)
        }

        // Cleanup function to remove custom properties
        return () => {
            root.style.removeProperty('--color-primary-custom')
            root.style.removeProperty('--color-primary-foreground-custom')
            root.style.removeProperty('--color-secondary-custom')
            root.style.removeProperty('--color-secondary-foreground-custom')
            root.style.removeProperty('--sidebar-primary-custom')
        }
    }, [settings, themeValues])

    return {
        themeValues,
        presetThemes: PRESET_THEMES,
        hexToRgb,
        hexToOklch,
        getContrastColor,
        adjustLightness,
    }
}

// Export utility functions for use in components
export { hexToRgb, hexToOklch, getContrastColor, adjustLightness }
