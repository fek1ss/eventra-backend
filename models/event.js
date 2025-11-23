const db = require('../config/db');

exports.createEvent = (data, callback) => {
  const { title, description, date, organization, category, image } = data;
  const query = 'INSERT INTO events (title, description, date, organization, category, image) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [title, description, date, organization, category, image], callback);
};

exports.getEvents = (category, callback) => {
  let query = 'SELECT * FROM events';
  if (category) query += ' WHERE category = ' + db.escape(category);
  db.query(query, callback);
};

exports.getEventById = (id, callback) => {
  const query = 'SELECT * FROM events WHERE id = ?';
  db.query(query, [id], callback);
};

exports.updateEvent = (id, data, callback) => {
  const { title, description, date, organization, category, image } = data;
  let query = 'UPDATE events SET title = ?, description = ?, date = ?, organization = ?, category = ?';
  const params = [title, description, date, organization, category];
  if (image) {
    query += ', image = ?';
    params.push(image);
  }
  query += ' WHERE id = ?';
  params.push(id);
  db.query(query, params, callback);
};

exports.deleteEvent = (id, callback) => {
  const query = 'DELETE FROM events WHERE id = ?';
  db.query(query, [id], callback);
};
