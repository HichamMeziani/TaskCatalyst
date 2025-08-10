import { Card } from "@/components/ui/card";
import { PlayCircle, CheckCircle, Target, Flame } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: "play-circle" | "check-circle" | "target" | "flame";
  trend: string;
  color: "success" | "primary" | "warning" | "orange";
}

const iconMap = {
  "play-circle": PlayCircle,
  "check-circle": CheckCircle,
  "target": Target,
  "flame": Flame,
};

const colorMap = {
  success: "text-success",
  primary: "text-primary",
  warning: "text-warning",
  orange: "text-orange-400",
};

export default function StatsCard({ title, value, icon, trend, color }: StatsCardProps) {
  const IconComponent = iconMap[icon];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{title}</p>
          <p className={`text-2xl font-bold ${colorMap[color]}`}>{value}</p>
        </div>
        <IconComponent className={`w-8 h-8 ${colorMap[color]}`} />
      </div>
      <p className="text-xs text-muted-foreground mt-2">{trend}</p>
    </Card>
  );
}
