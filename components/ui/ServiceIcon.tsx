import { Handshake, Landmark, Layers, Shield, TrendingUp, Zap } from "lucide-react";
import type { Service } from "@/lib/data/site";

const icons = {
  landmark: Landmark,
  "trending-up": TrendingUp,
  layers: Layers,
  shield: Shield,
  handshake: Handshake,
  zap: Zap,
};

export function ServiceIcon({ name, className }: { name: Service["icon"]; className?: string }) {
  const Icon = icons[name];
  return <Icon className={className} strokeWidth={1.5} />;
}
