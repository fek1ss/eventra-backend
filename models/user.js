const db = require('../config/db');

exports.createUser = (first_name, last_name, email, password, role, callback) => {
  const query = 'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [first_name, last_name, email, password, role], callback);
};

exports.getUserByEmail = (email, callback) => {
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], callback);
};

exports.getUserById = (id, callback) => {
  const query = 'SELECT * FROM users WHERE id = ?';
  db.query(query, [id], callback);
};
