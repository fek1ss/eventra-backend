const db = require('../config/db');

// Создание мероприятия (админ)
exports.createEvent = (req, res) => {
  const { title, description, date, organization, category } = req.body;
  const image = req.file ? req.file.filename : null;

  const query = 'INSERT INTO events (title, description, date, organization, category, image) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [title, description, date, organization, category, image], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(201).json({ message: 'Мероприятие создано', eventId: results.insertId });
  });
};

// Получить все мероприятия / фильтрация
exports.getEvents = (req, res) => {
  let query = 'SELECT * FROM events';
  const { category } = req.query;
  if (category) query += ' WHERE category = ' + db.escape(category);

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
};

// Получить одно мероприятие
exports.getEventById = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM events WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Мероприятие не найдено' });
    res.json(results[0]);
  });
};

// Обновление мероприятия (админ)
exports.updateEvent = (req, res) => {
  const { id } = req.params;
  const { title, description, date, organization, category } = req.body;
  const image = req.file ? req.file.filename : null;

  let query = 'UPDATE events SET title = ?, description = ?, date = ?, organization = ?, category = ?';
  const params = [title, description, date, organization, category];
  if (image) {
    query += ', image = ?';
    params.push(image);
  }
  query += ' WHERE id = ?';
  params.push(id);

  db.query(query, params, (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: 'Мероприятие обновлено' });
  });
};

// Удаление мероприятия (админ)
exports.deleteEvent = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM events WHERE id = ?';
  db.query(query, [id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: 'Мероприятие удалено' });
  });
};
