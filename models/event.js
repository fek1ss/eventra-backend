const db = require('../config/db');

// Создать мероприятие
exports.createEvent = (data, callback) => {
  const { title, description, date, organization, category, image, location, price } = data;

  const query =
    'INSERT INTO events (title, description, date, organization, category, image, location, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

  db.query(query, [title, description, date, organization, category, image, location, price], callback);
};

// Получить все мероприятия
exports.getEvents = (category, callback) => {
  let query = 'SELECT * FROM events';
  if (category) query += ' WHERE category = ' + db.escape(category);
  db.query(query, callback);
};

// Получить одно мероприятие
exports.getEventById = (id, callback) => {
  const query = 'SELECT * FROM events WHERE id = ?';
  db.query(query, [id], callback);
};

// Обновить мероприятие
exports.updateEvent = (id, data, callback) => {
  const { title, description, date, organization, category, image, location, price } = data;

  let query =
    'UPDATE events SET title = ?, description = ?, date = ?, organization = ?, category = ?, location = ?, price = ?';

  const params = [title, description, date, organization, category, location, price];

  if (image) {
    query += ', image = ?';
    params.push(image);
  }

  query += ' WHERE id = ?';
  params.push(id);

  db.query(query, params, callback);
};

// Удалить мероприятие
exports.deleteEvent = (id, callback) => {
  const query = 'DELETE FROM events WHERE id = ?';
  db.query(query, [id], callback);
};
