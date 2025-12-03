const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db'); // твой pool.js, promise pool

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registration');
const userStatsRoutes = require('./routes/userRoutes');

const app = express();

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://eventra-narxoz.vercel.app',
  'https://eventra-backend-production.up.railway.app'
];

app.use(cors({
  origin: function(origin, callback){
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // если будешь использовать куки
}));

// Для парсинга JSON
app.use(express.json());

// Для статики (картинок)
app.use('/uploads', express.static('uploads'));

// Роуты
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/registration', registrationRoutes);
app.use("/users", userStatsRoutes);


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
