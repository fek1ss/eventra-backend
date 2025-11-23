const db = require('../config/db');

exports.registerUser = (data, callback) => {
  const { event_id, user_id, first_name, last_name, phone } = data;
  const query = 'INSERT INTO registrations (event_id, user_id, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [event_id, user_id, first_name, last_name, phone], callback);
};

exports.getUserRegistrations = (user_id, callback) => {
  const query = `
    SELECT e.*, r.id as registration_id
    FROM events e
    JOIN registrations r ON e.id = r.event_id
    WHERE r.user_id = ?
  `;
  db.query(query, [user_id], callback);
};
