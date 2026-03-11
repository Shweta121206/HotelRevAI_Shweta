import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, AlertTriangle, TrendingDown } from "lucide-react";
import { demandForecast as mockDemandForecast } from "@/lib/mockData";
import { dashboardAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const demandLevels = {
  high: {
    label: "High Demand",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
    icon: TrendingUp,
  },
  medium: {
    label: "Medium Demand",
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
    icon: AlertTriangle,
  },
  low: {
    label: "Low Demand",
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    icon: TrendingDown,
  },
};

export const DemandForecastCard = () => {
  // Fetch demand forecast from API
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await dashboardAPI.summary();
      return response.data;
    },
  });

  // Use API data if available, otherwise fall back to mock data
  const demandForecast = dashboardData?.demandForecast || mockDemandForecast;
  
  const currentDemand = demandLevels[demandForecast.level || 'medium'];
  const CurrentIcon = currentDemand.icon;

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-lg">Demand Forecast</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Demand */}
        <div
          className={cn(
            "flex items-center gap-4 rounded-xl border p-4",
            currentDemand.bg,
            currentDemand.border
          )}
        >
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-lg",
              currentDemand.bg
            )}
          >
            <CurrentIcon className={cn("h-6 w-6", currentDemand.color)} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Demand</p>
            <p className={cn("text-xl font-bold", currentDemand.color)}>
              {currentDemand.label}
            </p>
          </div>
        </div>

        {/* Forecast Timeline */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Upcoming Forecast
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-secondary/50 p-3">
              <p className="text-xs text-muted-foreground">Next Week</p>
              <p
                className={cn(
                  "text-sm font-semibold capitalize",
                  demandLevels[demandForecast.nextWeek || 'medium'].color
                )}
              >
                {demandForecast.nextWeek || 'medium'}
              </p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-3">
              <p className="text-xs text-muted-foreground">Next Month</p>
              <p
                className={cn(
                  "text-sm font-semibold capitalize",
                  demandLevels[demandForecast.nextMonth || 'medium'].color
                )}
              >
                {demandForecast.nextMonth || 'medium'}
              </p>
            </div>
          </div>
        </div>

        {/* Contributing Factors */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Contributing Factors
          </h4>
          <ul className="space-y-2">
            {(demandForecast.factors || []).map((factor, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                {factor}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
