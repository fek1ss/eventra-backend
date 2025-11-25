const db = require('../config/db');

// Создание мероприятия (админ)
exports.createEvent = (req, res) => {
  const { title, description, date, time, organization, category, location, price } = req.body;

  let image = null;
  if (req.file) {
    const host = req.get('host'); 
    image = `${req.protocol}://${host}/uploads/${req.file.filename}`;
  }

  const query = `
    INSERT INTO events (title, description, date, time, organization, category, image, location, price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [title, description, date, time, organization, category, image, location, price],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      res.status(201).json({ message: 'Мероприятие создано', eventId: results.insertId });
    }
  );
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

// Получить ближайшее мероприятие
exports.getLatestEvent = (req, res) => {
  const query = `
    SELECT * FROM events
    WHERE TIMESTAMP(date, time) >= NOW()
    ORDER BY TIMESTAMP(date, time) ASC
    LIMIT 1
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Мероприятия не найдены' });
    res.json(results[0]);
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
  const { title, description, date, time, organization, category, location, price } = req.body;

  let query = `
    UPDATE events 
    SET title = ?, description = ?, date = ?, time = ?, organization = ?, category = ?, location = ?, price = ?
  `;
  
  const params = [title, description, date, time, organization, category, location, price];

  if (req.file) {
    const host = req.get('host');
    const image = `${req.protocol}://${host}/uploads/${req.file.filename}`;
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

// Удаление мероприятия
exports.deleteEvent = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM events WHERE id = ?';

  db.query(query, [id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: 'Мероприятие удалено' });
  });
};
