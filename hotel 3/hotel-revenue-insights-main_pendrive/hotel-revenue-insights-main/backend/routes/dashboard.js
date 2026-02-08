const express = require('express');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All dashboard routes require authentication
router.use(verifyToken);

// Import bookings data
const { bookings: bookingsData } = require('./bookings');

/**
 * GET /api/dashboard/summary
 * Get dashboard summary with stats and charts
 */
router.get('/summary', async (req, res) => {
  try {
    // Get bookings data (in production, this would come from Firestore/BigQuery)
    const bookings = bookingsData.length > 0 ? bookingsData : [
      { date: '2024-01-15', roomsBooked: 5, roomPrice: 189, roomType: 'Standard Room' },
      { date: '2024-01-16', roomsBooked: 8, roomPrice: 210, roomType: 'Deluxe Room' }
    ];

    // Calculate real-time stats from booking data
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.roomPrice * b.roomsBooked), 0);
    const totalRooms = bookings.reduce((sum, b) => sum + b.roomsBooked, 0);
    const avgOccupancy = bookings.length > 0 ? (totalRooms / bookings.length) * 10 : 75; // Mock calculation
    const avgDailyRate = bookings.length > 0 ? totalRevenue / totalRooms : 189;

    // Calculate trends (mock for demo)
    const revenueChange = 12.5;
    const occupancyChange = 5.2;
    const rateChange = 8.3;
    const revPARChange = 15.1;

    // Generate daily revenue data from actual bookings
    const dailyData = {};
    bookings.forEach(booking => {
      const date = new Date(booking.date);
      const dayKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (!dailyData[dayKey]) {
        dailyData[dayKey] = { revenue: 0, occupancy: 0, bookings: 0 };
      }
      dailyData[dayKey].revenue += booking.roomPrice * booking.roomsBooked;
      dailyData[dayKey].occupancy += booking.roomsBooked;
      dailyData[dayKey].bookings += 1;
    });

    const dailyRevenueData = Object.entries(dailyData).map(([date, data]) => ({
      date,
      revenue: Math.round(data.revenue),
      occupancy: Math.round((data.occupancy / data.bookings) * 100) / 100,
      avgPrice: Math.round(data.revenue / data.occupancy)
    }));

    // If no real data, use mock data
    if (dailyRevenueData.length === 0) {
      dailyRevenueData.push(
        { date: "Jan 1", revenue: 12500, occupancy: 78, avgPrice: 189 },
        { date: "Jan 2", revenue: 14200, occupancy: 85, avgPrice: 195 }
      );
    }

    // Get demand forecast (simulate AI prediction)
    let demandForecast = {
      level: 'medium',
      nextWeek: 'medium',
      nextMonth: 'medium',
      factors: [
        'Based on historical booking patterns',
        'Seasonal trends analysis',
        'No upcoming major events detected',
      ]
    };

    // Calculate demand based on recent bookings
    if (bookings.length > 0) {
      const recentBookings = bookings.slice(-7);
      const avgRecentOccupancy = recentBookings.reduce((sum, b) => sum + b.roomsBooked, 0) / recentBookings.length;
      
      if (avgRecentOccupancy > 7) {
        demandForecast.level = 'high';
        demandForecast.nextWeek = 'high';
        demandForecast.factors = [
          'High booking volume detected in recent data',
          'Occupancy rates above average',
          'Strong demand pattern identified',
        ];
      } else if (avgRecentOccupancy < 4) {
        demandForecast.level = 'low';
        demandForecast.nextWeek = 'low';
        demandForecast.factors = [
          'Lower than average booking volume',
          'Opportunity for promotional pricing',
          'Consider market adjustments',
        ];
      }
    }

    const dashboardData = {
      stats: {
        totalRevenue: Math.round(totalRevenue) || 445000,
        revenueChange,
        occupancyRate: Math.round(avgOccupancy),
        occupancyChange,
        avgDailyRate: Math.round(avgDailyRate) || 189,
        rateChange,
        revPAR: Math.round((avgDailyRate * avgOccupancy / 100)) || 161,
        revPARChange
      },
      dailyRevenue: dailyRevenueData,
      demandForecast,
      dataSource: bookings.length > 0 ? 'uploaded' : 'mock'
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

module.exports = router;