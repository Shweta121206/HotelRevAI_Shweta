// Mock data for HotelRevAI prototype

export const dailyRevenueData = [
  { date: "Jan 1", revenue: 12500, occupancy: 78, avgPrice: 189 },
  { date: "Jan 2", revenue: 14200, occupancy: 85, avgPrice: 195 },
  { date: "Jan 3", revenue: 11800, occupancy: 72, avgPrice: 182 },
  { date: "Jan 4", revenue: 15600, occupancy: 92, avgPrice: 210 },
  { date: "Jan 5", revenue: 16800, occupancy: 95, avgPrice: 225 },
  { date: "Jan 6", revenue: 15200, occupancy: 88, avgPrice: 205 },
  { date: "Jan 7", revenue: 13900, occupancy: 82, avgPrice: 198 },
  { date: "Jan 8", revenue: 12100, occupancy: 75, avgPrice: 185 },
  { date: "Jan 9", revenue: 14800, occupancy: 87, avgPrice: 202 },
  { date: "Jan 10", revenue: 17200, occupancy: 96, avgPrice: 235 },
  { date: "Jan 11", revenue: 16500, occupancy: 93, avgPrice: 220 },
  { date: "Jan 12", revenue: 15800, occupancy: 90, avgPrice: 215 },
  { date: "Jan 13", revenue: 14100, occupancy: 84, avgPrice: 195 },
  { date: "Jan 14", revenue: 13500, occupancy: 80, avgPrice: 190 },
];

export const monthlyRevenueData = [
  { month: "Jul", revenue: 385000, occupancy: 75 },
  { month: "Aug", revenue: 420000, occupancy: 82 },
  { month: "Sep", revenue: 365000, occupancy: 70 },
  { month: "Oct", revenue: 395000, occupancy: 76 },
  { month: "Nov", revenue: 340000, occupancy: 65 },
  { month: "Dec", revenue: 480000, occupancy: 88 },
  { month: "Jan", revenue: 445000, occupancy: 85 },
];

export const occupancyPricingData = [
  { hour: "6AM", occupancy: 45, price: 150 },
  { hour: "9AM", occupancy: 62, price: 175 },
  { hour: "12PM", occupancy: 78, price: 195 },
  { hour: "3PM", occupancy: 88, price: 220 },
  { hour: "6PM", occupancy: 95, price: 245 },
  { hour: "9PM", occupancy: 82, price: 210 },
  { hour: "12AM", occupancy: 70, price: 185 },
];

export const roomTypes = [
  {
    id: 1,
    name: "Standard Room",
    currentPrice: 189,
    recommendedPrice: 215,
    confidence: 92,
    demand: "high" as const,
    occupancy: 88,
  },
  {
    id: 2,
    name: "Deluxe Room",
    currentPrice: 299,
    recommendedPrice: 325,
    confidence: 87,
    demand: "medium" as const,
    occupancy: 72,
  },
  {
    id: 3,
    name: "Suite",
    currentPrice: 449,
    recommendedPrice: 420,
    confidence: 78,
    demand: "low" as const,
    occupancy: 55,
  },
  {
    id: 4,
    name: "Junior Suite",
    currentPrice: 349,
    recommendedPrice: 375,
    confidence: 85,
    demand: "medium" as const,
    occupancy: 68,
  },
];
export const dashboardStats = {
  totalRevenue: 445000,
  revenueChange: 12.5,
  occupancyRate: 85,
  occupancyChange: 8.2,
  avgDailyRate: 215,
  rateChange: 5.8,
  revPAR: 182.75,
  revPARChange: 15.3,
};

export const demandForecast = {
  level: "high" as const,
  nextWeek: "medium" as const,
  nextMonth: "high" as const,
  factors: [
    "Local convention scheduled for next week",
    "Holiday season approaching",
    "Competitor hotel under renovation",
    "Positive online reviews trending",
  ],
};

export const historicalTrends = [
  { period: "Q1 2024", avgOccupancy: 72, avgRevenue: 365000 },
  { period: "Q2 2024", avgOccupancy: 78, avgRevenue: 395000 },
  { period: "Q3 2024", avgOccupancy: 82, avgRevenue: 420000 },
  { period: "Q4 2024", avgOccupancy: 85, avgRevenue: 445000 },
];
