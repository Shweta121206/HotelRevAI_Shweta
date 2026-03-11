import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  prefix?: string;
  suffix?: string;
  delay?: number;
}

export const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  prefix = "",
  suffix = "",
  delay = 0,
}: StatCardProps) => {
  const isPositive = change >= 0;

  return (
    <Card
      className="group relative overflow-hidden p-6 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-300 group-hover:scale-150" />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">
            {prefix}
            {value}
            {suffix}
          </p>
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-medium",
              isPositive ? "text-success" : "text-destructive"
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>
              {isPositive ? "+" : ""}
              {change}%
            </span>
            <span className="text-muted-foreground font-normal">vs last month</span>
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </Card>
  );
};
