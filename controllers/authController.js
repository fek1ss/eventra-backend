const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Регистрация
exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    // Проверка корпоративной почты
    const corporateDomain = '@narxoz.kz';
    if (!email.endsWith(corporateDomain)) {
      return res.status(400).json({ message: 'Регистрация только через корпоративную почту' });
    }

    // Проверка на существующего пользователя
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) return res.status(400).json({ message: 'Пользователь уже существует' });

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Добавляем пользователя
    await db.query(
      'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [first_name, last_name, email, hashedPassword, 'admin']
    );

    res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Вход
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(400).json({ message: 'Пользователь не найден' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Неверный пароль' });

    // Генерация JWT
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, first_name: user.first_name, last_name: user.last_name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
