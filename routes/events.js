const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Получить все мероприятия
router.get('/', eventController.getEvents);

// Получить мероприятия по последней дате
router.get('/latest', eventController.getLatestEvent);


// Получить одно мероприятие
router.get('/:id', eventController.getEventById);

// Создать мероприятие (только админ)
router.post('/', auth('admin'), upload.single('image'), eventController.createEvent);

// Обновить мероприятие (только админ)
router.put('/:id', auth('admin'), upload.single('image'), eventController.updateEvent);

// Удалить мероприятие (только админ)
router.delete('/:id', auth('admin'), eventController.deleteEvent);

module.exports = router;
