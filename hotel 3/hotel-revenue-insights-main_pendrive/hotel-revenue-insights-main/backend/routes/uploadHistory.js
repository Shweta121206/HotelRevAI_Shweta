const express = require('express');
const router = express.Router();
const {
  addUploadHistory,
  getUserUploadHistory,
  getAllUploadHistory,
  getUploadStatistics,
  deleteUploadHistory
} = require('../services/uploadHistoryService');

// Add new upload history
router.post('/add', async (req, res) => {
  try {
    const { userId, hotelName, fileName, fileSize, fileType, recordsCount } = req.body;
    
    if (!userId || !fileName) {
      return res.status(400).json({ error: 'userId and fileName are required' });
    }
    
    const result = await addUploadHistory(userId, hotelName, fileName, fileSize, fileType, recordsCount);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user upload history
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await getUserUploadHistory(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all upload history
router.get('/all', async (req, res) => {
  try {
    const result = await getAllUploadHistory();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get upload statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.query.userId || null;
    const result = await getUploadStatistics(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete upload history record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const result = await deleteUploadHistory(id, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
