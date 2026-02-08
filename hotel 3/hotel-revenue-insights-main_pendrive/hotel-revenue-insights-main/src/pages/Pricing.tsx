import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { roomTypes as mockRoomTypes } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { analyticsAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Check,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

const demandBadge = {
  high: {
    label: "High",
    className: "bg-success/10 text-success border-success/30",
  },
  medium: {
    label: "Medium",
    className: "bg-warning/10 text-warning border-warning/30",
  },
  low: {
    label: "Low",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
};

const Pricing = () => {
  const { currency, convertAmount } = useCurrency();

  // Fetch pricing recommendations from API
  const { data: pricingData, isLoading, error } = useQuery({
    queryKey: ['pricing'],
    queryFn: async () => {
      const response = await analyticsAPI.pricing();
      return response.data;
    },
  });

  // Only allowed room types
  const allowedRoomNames = ["Standard Room", "Deluxe Room", "Suite", "Junior Suite"];

  // Use API data if available, otherwise fall back to mock data
  const recommendations = pricingData?.recommendations || [];
  const roomTypes = recommendations.length > 0
    ? recommendations
        .filter((rec: any) => allowedRoomNames.includes(rec.roomType))
        .map((rec: any, index: number) => ({
          id: index + 1,
          name: rec.roomType || `Room Type ${index + 1}`,
          currentPrice: rec.currentPrice || 189,
          recommendedPrice: rec.recommendedPrice || rec.currentPrice || 189,
          confidence: rec.confidence || 75,
          demand: rec.demand || 'medium',
          occupancy: rec.predictedOccupancy || 75,
        }))
    : mockRoomTypes;

  const handleApplyPrice = (roomName: string, newPrice: number) => {
    toast.success(`Price updated for ${roomName}`, {
      description: `New price: ${currency.symbol}${newPrice} applied successfully`,
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading pricing recommendations...</div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">Error loading pricing data</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                AI Pricing Recommendations
              </h1>
              <p className="mt-1 text-muted-foreground">
                Optimized room prices based on demand forecasting and market
                analysis
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {roomTypes.map((room, index) => {
            const priceDiff = room.recommendedPrice - room.currentPrice;
            const isIncrease = priceDiff > 0;
            const isDecrease = priceDiff < 0;
            const demand = demandBadge[room.demand];

            return (
              <Card
                key={room.id}
                className="group animate-slide-up transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{room.name}</CardTitle>
                    <span
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium",
                        demand.className
                      )}
                    >
                      {demand.label} Demand
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Price Comparison */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-secondary/50 p-4">
                      <p className="text-sm text-muted-foreground">
                        Current Price
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {currency.symbol}{convertAmount(room.currentPrice)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-primary/10 p-4 ring-1 ring-primary/30">
                      <p className="text-sm text-primary">AI Recommended</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-primary">
                          {currency.symbol}{convertAmount(room.recommendedPrice)}
                        </p>
                        <span
                          className={cn(
                            "flex items-center gap-1 text-sm font-medium",
                            isIncrease && "text-success",
                            isDecrease && "text-destructive",
                            !isIncrease && !isDecrease && "text-muted-foreground"
                          )}
                        >
                          {isIncrease ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : isDecrease ? (
                            <TrendingDown className="h-3 w-3" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                          {isIncrease && "+"}{currency.symbol}{Math.abs(convertAmount(priceDiff))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Confidence & Occupancy */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        AI Confidence
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-[hsl(200,95%,52%)] transition-all duration-500"
                            style={{ width: `${room.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {room.confidence}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        Current Occupancy
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {room.occupancy}%
                      </p>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <Button
                    variant="gradient"
                    className="w-full"
                    onClick={() =>
                      handleApplyPrice(room.name, convertAmount(room.recommendedPrice))
                    }
                  >
                    <Check className="h-4 w-4" />
                    Apply Recommended Price
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* AI Insights */}
        <Card className="animate-slide-up" style={{ animationDelay: "500ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Pricing Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-secondary/50 p-4">
                <h4 className="font-medium text-foreground">
                  Revenue Optimization
                </h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Applying all recommendations could increase daily revenue by
                  approximately <span className="text-success font-medium">15-18%</span>
                </p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4">
                <h4 className="font-medium text-foreground">Market Position</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Current prices are{" "}
                  <span className="text-warning font-medium">8% below</span> market
                  average for comparable properties
                </p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4">
                <h4 className="font-medium text-foreground">Demand Trend</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upcoming events suggest{" "}
                  <span className="text-primary font-medium">high demand</span> period
                  starting next week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Pricing;
