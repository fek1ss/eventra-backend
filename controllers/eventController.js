const db = require('../config/db');

// Создание мероприятия (админ)
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, time, organization, category, location, price, responsible_phone } = req.body;

    let image = null;
    if (req.file) {
      const host = req.get('host');
      image = `https://${host}/uploads/${req.file.filename}`;
    }

    const query = `
      INSERT INTO events (title, description, date, time, organization, category, image, location, price, responsible_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

    const [result] = await db.query(query, [title, description, date, time, organization, category, image, location, price, responsible_phone]);

    res.status(201).json({ message: 'Мероприятие создано', eventId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Получить все мероприятия / фильтрация
exports.getEvents = async (req, res) => {
  try {
    let query = 'SELECT * FROM events';
    const { category, organization } = req.query;

    const conditions = [];
    if (category) conditions.push(`category = ${db.escape(category)}`);
    if (organization) conditions.push(`organization = ${db.escape(organization)}`);

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY date, time ASC';

    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Получить ближайшее мероприятие
exports.getLatestEvent = async (req, res) => {
  try {
    const query = `
      SELECT * FROM events
      WHERE TIMESTAMP(date, time) >= NOW()
      ORDER BY TIMESTAMP(date, time) ASC
      LIMIT 1
    `;
    const [results] = await db.query(query);
    if (results.length === 0) return res.status(404).json({ message: 'Мероприятия не найдены' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Получить одно мероприятие
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await db.query('SELECT * FROM events WHERE id = ?', [id]);
    if (results.length === 0) return res.status(404).json({ message: 'Мероприятие не найдено' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Обновление мероприятия (админ)
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = ['title', 'description', 'date', 'time', 'organization', 'category', 'location', 'price', 'responsible_phone'];
    const fields = [];
    const values = [];

    // Формируем массив полей и значений только для тех, что есть в req.body
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    });

    // Если есть картинка
    if (req.file) {
      const host = req.get('host');
      const image = `${req.protocol}://${host}/uploads/${req.file.filename}`;
      fields.push('image = ?');
      values.push(image);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'Нет данных для обновления' });
    }

    const query = `UPDATE events SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    await db.query(query, values);
    res.json({ message: 'Мероприятие обновлено' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Удаление мероприятия
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM events WHERE id = ?', [id]);
    res.json({ message: 'Мероприятие удалено' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};