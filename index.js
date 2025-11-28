const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db'); // твой promise pool

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registration');

const app = express();

// Список разрешенных origin
const allowedOrigins = [
  'http://localhost:5173',
  'https://eventra-narxoz.vercel.app',
  'https://eventra-backend-production.up.railway.app'
];

// CORS конфигурация
const corsOptions = {
  origin: function (origin, callback) {
    console.log('Incoming origin:', origin);
    // Разрешаем запросы без origin (например, Postman, сервер-сервер)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // если будешь использовать куки
  optionsSuccessStatus: 200 // для старых браузеров
};

// Для preflight запросов
app.options('*', cors(corsOptions));

// Подключаем CORS
app.use(cors(corsOptions));

// Для парсинга JSON
app.use(express.json());

// Для статики (картинок)
app.use('/uploads', express.static('uploads'));

// Роуты
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/registration', registrationRoutes);

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    console.log('⏳ Проверка соединения с базой...');

    // Проверка соединения с promise pool
    const [rows] = await db.query('SELECT 1');
    console.log('✅ База данных доступна!');

    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ Ошибка подключения к базе:', err.message);
    console.error(err);
    process.exit(1); // завершаем контейнер/процесс, если база недоступна
  }
})();
