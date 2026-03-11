import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { DemandForecastCard } from "@/components/dashboard/DemandForecastCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Percent, TrendingUp, Hotel } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { dashboardAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const { currency, formatAmount, convertAmount } = useCurrency();

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await dashboardAPI.summary();
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard data...</div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">Error loading dashboard data</div>
        </div>
      </MainLayout>
    );
  }

  const stats = dashboardData?.stats || {};
  const dailyRevenueData = dashboardData?.dailyRevenue || [];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Overview of your hotel's revenue performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <StatCard
              title="Total Revenue"
              value={formatAmount(stats.totalRevenue || 0)}
              change={stats.revenueChange || 0}
              icon={DollarSign}
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
            <StatCard
              title="Occupancy Rate"
              value={(stats.occupancyRate || 0).toString()}
              change={stats.occupancyChange || 0}
              icon={Percent}
              suffix="%"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
            <StatCard
              title="Avg Daily Rate"
              value={formatAmount(stats.avgDailyRate || 0)}
              change={stats.rateChange || 0}
              icon={Hotel}
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "400ms" }}>
            <StatCard
              title="RevPAR"
              value={formatAmount(stats.revPAR || 0)}
              change={stats.revPARChange || 0}
              icon={TrendingUp}
            />
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue Chart */}
          <Card
            className="col-span-full animate-slide-up lg:col-span-2"
            style={{ animationDelay: "500ms" }}
          >
            <CardHeader>
              <CardTitle className="text-lg">Daily Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyRevenueData.map((item: any) => ({ ...item, revenue: convertAmount(item.revenue) }))}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${currency.symbol}${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.75rem",
                        boxShadow: "0 4px 24px hsl(222 47% 4% / 0.4)",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      formatter={(value: number) => [
                        `${currency.symbol}${value.toLocaleString()}`,
                        "Revenue",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }}
                      activeDot={{
                        r: 6,
                        fill: "hsl(var(--primary))",
                        stroke: "hsl(var(--background))",
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Demand Forecast */}
          <div className="animate-slide-up" style={{ animationDelay: "600ms" }}>
            <DemandForecastCard />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
