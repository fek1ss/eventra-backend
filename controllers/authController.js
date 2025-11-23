const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Регистрация
exports.register = (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  // Проверка корпоративной почты
  const corporateDomain = '@narxoz.kz'; // <- замените на ваш домен
  if (!email.endsWith(corporateDomain)) {
    return res.status(400).json({ message: 'Регистрация только через корпоративную почту' });
  }

  // Проверка на существующего пользователя
  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkQuery, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length > 0) return res.status(400).json({ message: 'Пользователь уже существует' });

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Добавляем пользователя в БД с ролью user по умолчанию
    const insertQuery = 'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)';
    db.query(insertQuery, [first_name, last_name, email, hashedPassword, 'user'], (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
    });
  });
};

// Вход
exports.login = (req, res) => {
  console.log('Request body:', req.body);
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0) return res.status(400).json({ message: 'Пользователь не найден' });

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Неверный пароль' });

    // Генерация JWT
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, first_name: user.first_name, last_name: user.last_name, role: user.role } });
  });
};
