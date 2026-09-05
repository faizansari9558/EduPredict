const db = require('../config/db');

async function getDatabaseStatus() {
  try {
    const [rows] = await db.query('SELECT 1 AS ok');

    return {
      connected: rows.length > 0,
      status: 'connected',
      message: 'MySQL connection is active.'
    };
  } catch (error) {
    return {
      connected: false,
      status: 'disconnected',
      message: 'MySQL connection failed.',
      error: error.message
    };
  }
}

module.exports = {
  getDatabaseStatus
};
