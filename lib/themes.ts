import type { ThemeName, ThemeColors } from "@/types/planner"

export const THEMES: Record<ThemeName, ThemeColors> = {
  "dark-knight": {
    name: "Dark Knight",
    primary: "rgb(0, 212, 255)",
    secondary: "rgb(26, 26, 46)",
    accent: "rgb(0, 212, 255)",
    background: "rgb(10, 10, 10)",
    surface: "rgb(15, 20, 25)",
    text: "rgb(224, 224, 224)",
    border: "rgb(0, 212, 255)",
  },
  "crimson-red": {
    name: "Crimson Red",
    primary: "rgb(220, 38, 38)",
    secondary: "rgb(30, 10, 10)",
    accent: "rgb(239, 68, 68)",
    background: "rgb(10, 5, 5)",
    surface: "rgb(25, 10, 10)",
    text: "rgb(254, 226, 226)",
    border: "rgb(220, 38, 38)",
  },
  "special-ops": {
    name: "Special Ops",
    primary: "rgb(34, 197, 94)",
    secondary: "rgb(10, 20, 15)",
    accent: "rgb(74, 222, 128)",
    background: "rgb(5, 10, 7)",
    surface: "rgb(15, 25, 20)",
    text: "rgb(220, 252, 231)",
    border: "rgb(34, 197, 94)",
  },
  "arctic-blue": {
    name: "Arctic Blue",
    primary: "rgb(59, 130, 246)",
    secondary: "rgb(15, 23, 42)",
    accent: "rgb(96, 165, 250)",
    background: "rgb(8, 15, 30)",
    surface: "rgb(15, 23, 42)",
    text: "rgb(226, 232, 240)",
    border: "rgb(59, 130, 246)",
  },
}

export const getThemeColors = (theme: ThemeName): ThemeColors => {
  return THEMES[theme] || THEMES["dark-knight"]
}
