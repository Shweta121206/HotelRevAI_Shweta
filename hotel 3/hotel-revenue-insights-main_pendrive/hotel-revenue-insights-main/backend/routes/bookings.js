const express = require('express');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All booking routes require authentication
router.use(verifyToken);

// In-memory bookings store for demo (simulates Firestore)
let bookings = [
  {
    id: '1',
    date: '2024-01-15',
    roomsBooked: 5,
    roomPrice: 189,
    roomType: 'Standard Room',
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '2',
    date: '2024-01-16',
    roomsBooked: 8,
    roomPrice: 210,
    roomType: 'Deluxe Room',
    createdAt: '2024-01-11T14:30:00Z'
  }
];

// Function to update analytics data
let updateAnalyticsData = null;
try {
  const analyticsRouter = require('./analytics');
  if (analyticsRouter && analyticsRouter.updateBookingsData) {
    updateAnalyticsData = analyticsRouter.updateBookingsData;
  }
} catch (err) {
  console.warn('Could not load analytics router:', err.message);
}

/**
 * POST /api/bookings/add
 * Add a new booking
 */
router.post('/add', async (req, res) => {
  try {
    const { date, roomsBooked, roomPrice, roomType } = req.body;

    // Validate input
    if (!date || !roomsBooked || !roomPrice || !roomType) {
      return res.status(400).json({
        error: 'Missing required fields: date, roomsBooked, roomPrice, roomType'
      });
    }

    // Create booking
    const booking = {
      id: Date.now().toString(),
      date,
      roomsBooked: parseInt(roomsBooked),
      roomPrice: parseFloat(roomPrice),
      roomType,
      createdAt: new Date().toISOString()
    };

    bookings.push(booking);

    // Update analytics data
    if (analyticsRouter && analyticsRouter.updateBookingsData) {
      analyticsRouter.updateBookingsData(bookings);
    }

    res.status(201).json({
      message: 'Booking added successfully',
      booking
    });
  } catch (error) {
    console.error('Add booking error:', error);
    res.status(500).json({ error: 'Failed to add booking' });
  }
});

/**
 * POST /api/bookings/upload
 * Upload booking data from CSV/file (simulates data ingestion to BigQuery)
 */
router.post('/upload', async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        error: 'Data must be an array of booking objects'
      });
    }

    // Process and validate uploaded data
    const processedBookings = [];
    const errors = [];

    data.forEach((item, index) => {
      try {
        let { date, roomsBooked, roomPrice, roomType } = item;

        // Validate and normalize date
        if (!date) {
          errors.push(`Row ${index + 1}: Missing date field`);
          return;
        }

        // Try to parse date in various formats
        let dateObj = null;
        if (typeof date === 'string') {
          // Try ISO format first
          dateObj = new Date(date);
          if (isNaN(dateObj.getTime())) {
            // Try MM/DD/YYYY format
            const parts = date.split('/');
            if (parts.length === 3) {
              dateObj = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
            }
            if (isNaN(dateObj.getTime())) {
              // Try DD-MM-YYYY format
              const parts2 = date.split('-');
              if (parts2.length === 3 && parts2[0].length === 2) {
                dateObj = new Date(`${parts2[2]}-${parts2[1]}-${parts2[0]}`);
              }
            }
          }
        } else if (date instanceof Date) {
          dateObj = date;
        }

        if (!dateObj || isNaN(dateObj.getTime())) {
          errors.push(`Row ${index + 1}: Invalid date format: ${date}`);
          return;
        }

        const normalizedDate = dateObj.toISOString().split('T')[0];

        // Validate and normalize roomsBooked
        roomsBooked = parseInt(roomsBooked);
        if (isNaN(roomsBooked) || roomsBooked <= 0) {
          errors.push(`Row ${index + 1}: Invalid roomsBooked: ${item.roomsBooked}`);
          return;
        }

        // Validate and normalize roomPrice
        roomPrice = parseFloat(roomPrice);
        if (isNaN(roomPrice) || roomPrice <= 0) {
          errors.push(`Row ${index + 1}: Invalid roomPrice: ${item.roomPrice}`);
          return;
        }

        // Validate and normalize roomType
        roomType = String(roomType || '').trim();
        if (!roomType) {
          errors.push(`Row ${index + 1}: Missing roomType`);
          return;
        }

        const booking = {
          id: `upload_${Date.now()}_${index}`,
          date: normalizedDate,
          roomsBooked: roomsBooked,
          roomPrice: Math.round(roomPrice * 100) / 100,
          roomType: roomType,
          createdAt: new Date().toISOString(),
          source: 'upload'
        };

        processedBookings.push(booking);
      } catch (err) {
        errors.push(`Row ${index + 1}: ${err.message || 'Unknown error'}`);
      }
    });

    // Add processed bookings to main dataset
    bookings.push(...processedBookings);

    // Update analytics data for real-time analysis
    if (updateAnalyticsData) {
      try {
        updateAnalyticsData(bookings);
      } catch (err) {
        console.warn('Failed to update analytics data:', err.message);
      }
    }

    res.status(201).json({
      message: `Successfully processed ${processedBookings.length} bookings`,
      processed: processedBookings.length,
      errors: errors.length,
      errorDetails: errors.slice(0, 10), // Show first 10 errors
      totalBookings: bookings.length
    });
  } catch (error) {
    console.error('Upload booking error:', error);
    res.status(500).json({ error: 'Failed to upload bookings' });
  }
});

/**
 * GET /api/bookings/list
 * Get booking history
 */
router.get('/list', async (req, res) => {
  try {
    res.json({
      bookings,
      total: bookings.length
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

/**
 * GET /api/bookings/stats
 * Get booking statistics (simulates BigQuery aggregation)
 */
router.get('/stats', async (req, res) => {
  try {
    if (bookings.length === 0) {
      return res.json({
        totalBookings: 0,
        totalRevenue: 0,
        avgOccupancy: 0,
        roomTypes: [],
        message: "No booking data available"
      });
    }

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.roomPrice * b.roomsBooked), 0);
    const totalRooms = bookings.reduce((sum, b) => sum + b.roomsBooked, 0);
    const avgOccupancy = totalRooms / bookings.length;

    const roomTypeStats = {};
    bookings.forEach(booking => {
      if (!roomTypeStats[booking.roomType]) {
        roomTypeStats[booking.roomType] = {
          count: 0,
          revenue: 0,
          avgPrice: 0
        };
      }
      roomTypeStats[booking.roomType].count += 1;
      roomTypeStats[booking.roomType].revenue += booking.roomPrice * booking.roomsBooked;
    });

    Object.keys(roomTypeStats).forEach(type => {
      roomTypeStats[type].avgPrice = roomTypeStats[type].revenue / roomTypeStats[type].count;
    });

    res.json({
      totalBookings: bookings.length,
      totalRevenue: Math.round(totalRevenue),
      avgOccupancy: Math.round(avgOccupancy * 10) / 10,
      roomTypes: Object.entries(roomTypeStats).map(([type, stats]) => ({
        type,
        bookings: stats.count,
        revenue: Math.round(stats.revenue),
        avgPrice: Math.round(stats.avgPrice)
      }))
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ error: 'Failed to fetch booking stats' });
  }
});

module.exports = { router, bookings };