import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export default function StatsCard({ title, value, subtitle, icon }: StatsCardProps) {
  return (
    <Card className="p-6 sophisticated-border glass-morphism">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-display font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 rounded-xl premium-gradient flex items-center justify-center text-primary-foreground">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}