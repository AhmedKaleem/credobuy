import {
  BatteryCharging,
  Cable,
  Camera,
  Car,
  Headphones,
  House,
  Laptop,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tablet,
  TabletSmartphone,
  Tv,
  Wallet,
  Watch,
  Zap,
  Package,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  Smartphone,
  ShieldCheck,
  Zap,
  Cable,
  BatteryCharging,
  Headphones,
  TabletSmartphone,
  Camera,
  Laptop,
  Tv,
  Watch,
  Car,
  House,
  Wallet,
  Tablet,
  Sparkles,
  Package,
};

/** Render a lucide icon by its string name (used for DB-driven categories). */
export function Icon({
  name,
  size = 22,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Cmp = map[name] ?? Package;
  return <Cmp size={size} className={className} />;
}
