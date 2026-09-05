const express = require('express');
const { getDatabaseStatus } = require('../services/dbService');

const router = express.Router();

router.get('/', async (req, res) => {
  const dbStatus = await getDatabaseStatus();

  res.json({
    app: 'EduPredict API',
    status: 'online',
    database: dbStatus
  });
});

module.exports = router;
