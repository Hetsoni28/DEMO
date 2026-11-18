import { AirVent, Bug, Droplets, Hammer, PaintRoller, Sparkles, Zap, type LucideIcon } from "lucide-react";
import type { CategoryIcon } from "@/lib/mock-data";

export const categoryIcons: Record<CategoryIcon, LucideIcon> = {
  droplets: Droplets,
  zap: Zap,
  sparkles: Sparkles,
  "air-vent": AirVent,
  hammer: Hammer,
  "paint-roller": PaintRoller,
  bug: Bug,
};
