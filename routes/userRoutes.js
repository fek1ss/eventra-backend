const express = require('express');
const router = express.Router();

const { getUserEvents, getUserStats } = require('../controllers/userStatsControlle');

// История мероприятий пользователя
router.get('/:user_id/events', getUserEvents);

// Статистика пользователя
router.get('/:id/stats', getUserStats);

module.exports = router;
