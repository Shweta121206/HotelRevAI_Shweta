const express = require('express');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All analytics routes require authentication
router.use(verifyToken);

// In-memory data store for uploaded booking data (simulates Firestore)
let uploadedBookings = [];

// Mock AI/ML functions (simulates Vertex AI / AutoML)
const mockDemandPrediction = (bookings) => {
  // Simple algorithm: analyze booking patterns by day of week and season
  const predictions = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Mock demand based on day of week (weekends higher)
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseDemand = isWeekend ? 'high' : 'medium';

    // Analyze historical data for this day
    const historicalBookings = bookings.filter(b => {
      const bookingDate = new Date(b.date);
      return bookingDate.getDay() === dayOfWeek;
    });

    const avgOccupancy = historicalBookings.length > 0
      ? historicalBookings.reduce((sum, b) => sum + b.roomsBooked, 0) / historicalBookings.length
      : 5;

    const demand = avgOccupancy > 7 ? 'high' : avgOccupancy > 4 ? 'medium' : 'low';
    const confidence = Math.min(95, 60 + (historicalBookings.length * 5));

    predictions.push({
      date: date.toISOString().split('T')[0],
      demand,
      confidence: Math.round(confidence),
      predictedOccupancy: Math.round(avgOccupancy)
    });
  }

  return predictions;
};

const mockPricingRecommendation = (bookings) => {
  // Simple pricing algorithm based on demand and competition
  const recommendations = [];
  const roomTypes = [...new Set(bookings.map(b => b.roomType))];

  roomTypes.forEach(roomType => {
    const typeBookings = bookings.filter(b => b.roomType === roomType);
    const avgPrice = typeBookings.reduce((sum, b) => sum + b.roomPrice, 0) / typeBookings.length;
    const avgOccupancy = typeBookings.reduce((sum, b) => sum + b.roomsBooked, 0) / typeBookings.length;

    // Mock AI logic: higher price for high demand, lower for low demand
    let recommendedPrice = avgPrice;
    let confidence = 75;

    if (avgOccupancy > 7) {
      recommendedPrice = avgPrice * 1.15; // 15% increase for high demand
      confidence = 90;
    } else if (avgOccupancy < 4) {
      recommendedPrice = avgPrice * 0.9; // 10% decrease for low demand
      confidence = 80;
    }

    recommendations.push({
      roomType,
      currentPrice: Math.round(avgPrice),
      recommendedPrice: Math.round(recommendedPrice),
      confidence,
      demand: avgOccupancy > 7 ? 'high' : avgOccupancy > 4 ? 'medium' : 'low',
      potentialRevenueIncrease: Math.round((recommendedPrice - avgPrice) * avgOccupancy * 30) // Monthly estimate
    });
  });

  return recommendations;
};

const mockRevenueAnalysis = (bookings) => {
  // Group bookings by date for daily analysis
  const dailyData = {};
  const monthlyData = {};

  bookings.forEach(booking => {
    const date = new Date(booking.date);
    const dayKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const monthKey = date.toLocaleDateString('en-US', { month: 'short' });

    // Daily data
    if (!dailyData[dayKey]) {
      dailyData[dayKey] = { revenue: 0, occupancy: 0, bookings: 0 };
    }
    dailyData[dayKey].revenue += booking.roomPrice * booking.roomsBooked;
    dailyData[dayKey].occupancy += booking.roomsBooked;
    dailyData[dayKey].bookings += 1;

    // Monthly data
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { revenue: 0, occupancy: 0, bookings: 0 };
    }
    monthlyData[monthKey].revenue += booking.roomPrice * booking.roomsBooked;
    monthlyData[monthKey].occupancy += booking.roomsBooked;
    monthlyData[monthKey].bookings += 1;
  });

  return {
    daily: Object.entries(dailyData).map(([date, data]) => ({
      date,
      revenue: Math.round(data.revenue),
      occupancy: Math.round((data.occupancy / data.bookings) * 10) / 10,
      avgPrice: Math.round(data.revenue / data.occupancy)
    })),
    monthly: Object.entries(monthlyData).map(([month, data]) => ({
      month,
      revenue: Math.round(data.revenue),
      occupancy: Math.round((data.occupancy / data.bookings) * 10) / 10
    }))
  };
};

/**
 * GET /api/analytics/demand
 * Get demand prediction data (simulates Vertex AI)
 */
router.get('/demand', async (req, res) => {
  try {
    if (uploadedBookings.length === 0) {
      return res.json({
        predictions: [],
        message: "No booking data available. Please upload data first."
      });
    }

    const predictions = mockDemandPrediction(uploadedBookings);
    res.json({ predictions });
  } catch (error) {
    console.error('Demand analytics error:', error);
    res.status(500).json({ error: 'Failed to predict demand' });
  }
});

/**
 * GET /api/analytics/pricing
 * Get pricing recommendations (simulates AutoML)
 */
router.get('/pricing', async (req, res) => {
  try {
    if (uploadedBookings.length === 0) {
      return res.json({
        recommendations: [],
        occupancyPricing: [],
        message: "No booking data available. Please upload data first."
      });
    }

    const recommendations = mockPricingRecommendation(uploadedBookings);
    
    // Filter out Presidential Room entries
    const filteredRecommendations = recommendations.filter(
      rec => !rec.roomType.toLowerCase().includes('presidential')
    );

    // Mock occupancy-based pricing (hourly simulation)
    const occupancyPricing = [
      { hour: "6AM", occupancy: 45, price: 150 },
      { hour: "9AM", occupancy: 62, price: 175 },
      { hour: "12PM", occupancy: 78, price: 195 },
      { hour: "3PM", occupancy: 88, price: 220 },
      { hour: "6PM", occupancy: 95, price: 245 },
      { hour: "9PM", occupancy: 82, price: 210 },
      { hour: "12AM", occupancy: 70, price: 185 },
    ];

    res.json({ recommendations: filteredRecommendations, occupancyPricing });
  } catch (error) {
    console.error('Pricing analytics error:', error);
    res.status(500).json({ error: 'Failed to get pricing recommendations' });
  }
});

/**
 * GET /api/analytics/revenue
 * Get revenue analytics data (simulates BigQuery analysis)
 */
router.get('/revenue', async (req, res) => {
  try {
    if (uploadedBookings.length === 0) {
      return res.json({
        daily: [],
        monthly: [],
        message: "No booking data available. Please upload data first."
      });
    }

    const revenueData = mockRevenueAnalysis(uploadedBookings);
    res.json(revenueData);
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ error: 'Failed to analyze revenue' });
  }
});

// Export function to update uploaded bookings data
router.updateBookingsData = (bookings) => {
  uploadedBookings = bookings;
};

module.exports = router;
