import { loadFont as outfit } from "@remotion/google-fonts/Outfit";
import { loadFont as mono } from "@remotion/google-fonts/JetBrainsMono";
export const display = outfit("normal", { weights: ["300", "500", "700", "800"], subsets: ["latin"] }).fontFamily;
export const code = mono("normal", { weights: ["400", "500"], subsets: ["latin"] }).fontFamily;
// ReRoom's own palette (src/app/globals.css)
export const C = { ink: "#050712", navy: "#050d21", deep: "#0c1020", blue: "#1b68fc", ultra: "#1f2bff", soft: "#aeb4ff", paper: "#f1f2f6", mist: "#9aa0b4", line: "#2a3050", danger: "#e5484d" };
export const FPS = 30;
