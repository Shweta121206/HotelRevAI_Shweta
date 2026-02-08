const { dbRun, dbAll } = require('../config/database');

// Add upload history record
const addUploadHistory = async (userId, hotelName, fileName, fileSize, fileType, recordsCount) => {
  try {
    const result = await dbRun(
      `INSERT INTO upload_history (userId, hotelName, fileName, fileSize, fileType, recordsCount, status)
       VALUES (?, ?, ?, ?, ?, ?, 'success')`,
      [userId, hotelName, fileName, fileSize, fileType, recordsCount]
    );
    return {
      success: true,
      id: result.lastID,
      message: 'Upload history recorded'
    };
  } catch (error) {
    console.error('Error adding upload history:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get upload history for a user
const getUserUploadHistory = async (userId) => {
  try {
    const history = await dbAll(
      `SELECT * FROM upload_history WHERE userId = ? ORDER BY uploadDate DESC`,
      [userId]
    );
    return {
      success: true,
      data: history
    };
  } catch (error) {
    console.error('Error fetching upload history:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get all upload history (admin)
const getAllUploadHistory = async () => {
  try {
    const history = await dbAll(
      `SELECT * FROM upload_history ORDER BY uploadDate DESC`
    );
    return {
      success: true,
      data: history
    };
  } catch (error) {
    console.error('Error fetching all upload history:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get upload statistics
const getUploadStatistics = async (userId = null) => {
  try {
    let query = `
      SELECT 
        COUNT(*) as totalUploads,
        SUM(recordsCount) as totalRecords,
        SUM(fileSize) as totalFileSize,
        AVG(recordsCount) as avgRecords
      FROM upload_history
    `;
    let params = [];
    
    if (userId) {
      query += ` WHERE userId = ?`;
      params.push(userId);
    }
    
    const stats = await dbAll(query, params);
    return {
      success: true,
      data: stats[0]
    };
  } catch (error) {
    console.error('Error fetching upload statistics:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete upload history record
const deleteUploadHistory = async (id, userId) => {
  try {
    const result = await dbRun(
      `DELETE FROM upload_history WHERE id = ? AND userId = ?`,
      [id, userId]
    );
    return {
      success: true,
      message: 'Upload history deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting upload history:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  addUploadHistory,
  getUserUploadHistory,
  getAllUploadHistory,
  getUploadStatistics,
  deleteUploadHistory
};
