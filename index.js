const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registration');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://eventra-narxoz.vercel.app',
  'https://eventra-backend-production.up.railway.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log('Incoming origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Правильный способ для preflight: вместо '*' используем '/*'
app.options('/*', cors(corsOptions));

// Подключаем CORS для всех маршрутов
app.use(cors(corsOptions));

// JSON парсер
app.use(express.json());

// Статика
app.use('/uploads', express.static('uploads'));

// Роуты
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/registration', registrationRoutes);

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    console.log('⏳ Проверка соединения с базой...');
    const [rows] = await db.query('SELECT 1');
    console.log('✅ База данных доступна!');

    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ Ошибка подключения к базе:', err.message);
    process.exit(1);
  }
})();
