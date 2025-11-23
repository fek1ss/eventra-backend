const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const auth = require('../middleware/auth');

// Регистрация на мероприятие
router.post('/', auth(), registrationController.registerForEvent);

// История мероприятий пользователя
router.get('/:user_id', auth(), registrationController.getUserEvents);

module.exports = router;
