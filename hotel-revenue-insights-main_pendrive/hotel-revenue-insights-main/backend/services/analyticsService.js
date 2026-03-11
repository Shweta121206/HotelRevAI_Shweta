const { db } = require('../config/firebase');

/**
 * Analytics Service
 * Contains AI simulation logic for demand prediction, pricing, and revenue calculation
 */

class AnalyticsService {
  /**
   * Predict demand for a date range
   * MVP AI Logic: Based on historical booking averages
   */
  async predictDemand(userId, startDate, endDate) {
    try {
      // Get historical bookings for the last 3 months to calculate averages
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const historicalStart = threeMonthsAgo.toISOString().split('T')[0];

      const historicalBookings = await db.collection('bookings')
        .where('userId', '==', userId)
        .where('date', '>=', historicalStart)
        .get();

      // Calculate average bookings per day
      const bookingCounts = {};
      let totalBookings = 0;
      let totalDays = 0;

      historicalBookings.forEach(doc => {
        const data = doc.data();
        const date = data.date;
        bookingCounts[date] = (bookingCounts[date] || 0) + data.roomsBooked;
        totalBookings += data.roomsBooked;
        totalDays++;
      });

      const avgBookingsPerDay = totalDays > 0 ? totalBookings / totalDays : 0;

      // Generate predictions for the date range
      const predictions = [];
      const start = new Date(startDate);
      const end = new Date(endDate);

      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];

        // MVP AI Logic: Simple threshold-based prediction
        let demandLevel = 'low';
        let predictedRooms = Math.floor(avgBookingsPerDay * 0.7); // Conservative estimate

        if (avgBookingsPerDay > 15) {
          demandLevel = 'high';
          predictedRooms = Math.floor(avgBookingsPerDay * 1.2);
        } else if (avgBookingsPerDay > 8) {
          demandLevel = 'medium';
          predictedRooms = Math.floor(avgBookingsPerDay * 0.9);
        }

        predictions.push({
          date: dateStr,
          predictedDemand: demandLevel,
          predictedRooms: Math.max(0, predictedRooms)
        });
      }

      return predictions;
    } catch (error) {
      console.error('Demand prediction error:', error);
      throw error;
    }
  }

  /**
   * Get pricing recommendations based on demand
   */
  async getPricingRecommendations(userId, startDate, endDate, roomType = null) {
    try {
      // Get historical pricing data
      const historicalBookings = await db.collection('bookings')
        .where('userId', '==', userId)
        .orderBy('date', 'desc')
        .limit(100)
        .get();

      // Calculate base price (average historical price)
      let totalPrice = 0;
      let priceCount = 0;

      historicalBookings.forEach(doc => {
        const data = doc.data();
        if (!roomType || data.roomType === roomType) {
          totalPrice += data.roomPrice;
          priceCount++;
        }
      });

      const basePrice = priceCount > 0 ? totalPrice / priceCount : 100; // Default $100

      // Get demand predictions
      const demandPredictions = await this.predictDemand(userId, startDate, endDate);

      // Generate pricing recommendations
      const recommendations = demandPredictions.map(prediction => {
        let recommendedPrice = basePrice;

        // Pricing rules based on demand
        if (prediction.predictedDemand === 'high') {
          recommendedPrice = basePrice * 1.20; // +20%
        } else if (prediction.predictedDemand === 'medium') {
          recommendedPrice = basePrice; // No change
        } else {
          recommendedPrice = basePrice * 0.85; // -15%
        }

        return {
          date: prediction.date,
          roomType: roomType || 'all',
          basePrice: Math.round(basePrice * 100) / 100,
          recommendedPrice: Math.round(recommendedPrice * 100) / 100,
          demandLevel: prediction.predictedDemand
        };
      });

      return recommendations;
    } catch (error) {
      console.error('Pricing recommendation error:', error);
      throw error;
    }
  }

  /**
   * Calculate revenue for a date range
   */
  async calculateRevenue(userId, startDate, endDate, type = 'daily') {
    try {
      const bookings = await db.collection('bookings')
        .where('userId', '==', userId)
        .where('date', '>=', startDate)
        .where('date', '<=', endDate)
        .get();

      if (type === 'monthly') {
        // Calculate total revenue for the period
        let totalRevenue = 0;
        bookings.forEach(doc => {
          const data = doc.data();
          totalRevenue += data.roomsBooked * data.roomPrice;
        });

        return { total: Math.round(totalRevenue * 100) / 100 };
      } else {
        // Daily breakdown
        const dailyRevenue = {};
        bookings.forEach(doc => {
          const data = doc.data();
          const revenue = data.roomsBooked * data.roomPrice;
          dailyRevenue[data.date] = (dailyRevenue[data.date] || 0) + revenue;
        });

        const data = Object.keys(dailyRevenue)
          .sort()
          .map(date => ({
            date,
            revenue: Math.round(dailyRevenue[date] * 100) / 100
          }));

        const total = data.reduce((sum, day) => sum + day.revenue, 0);

        return {
          total: Math.round(total * 100) / 100,
          data
        };
      }
    } catch (error) {
      console.error('Revenue calculation error:', error);
      throw error;
    }
  }

  /**
   * Calculate occupancy rate
   */
  async calculateOccupancyRate(userId, startDate, endDate) {
    try {
      const bookings = await db.collection('bookings')
        .where('userId', '==', userId)
        .where('date', '>=', startDate)
        .where('date', '<=', endDate)
        .get();

      let totalRoomsBooked = 0;
      let totalDays = 0;
      const uniqueDates = new Set();

      bookings.forEach(doc => {
        const data = doc.data();
        totalRoomsBooked += data.roomsBooked;
        uniqueDates.add(data.date);
      });

      totalDays = uniqueDates.size;

      // Assuming hotel has 50 rooms total (this could be configurable)
      const totalRooms = 50;
      const rate = totalDays > 0 ? (totalRoomsBooked / (totalRooms * totalDays)) * 100 : 0;

      return {
        rate: Math.round(rate * 100) / 100,
        totalRoomsBooked,
        totalDays,
        totalCapacity: totalRooms * totalDays
      };
    } catch (error) {
      console.error('Occupancy calculation error:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();