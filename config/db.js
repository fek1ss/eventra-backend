const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');

  // Создаем базу данных, если ее нет
  db.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`, (err) => {
    if (err) throw err;
    console.log(`Database ${process.env.DB_NAME} ready`);

    // Подключаемся к базе данных
    db.changeUser({ database: process.env.DB_NAME }, (err) => {
      if (err) throw err;

      // Создаем таблицы, если их нет
      const usersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          first_name VARCHAR(50),
          last_name VARCHAR(50),
          email VARCHAR(100) UNIQUE,
          password VARCHAR(255),
          role ENUM('user','admin') DEFAULT 'user'
        )
      `;
      const eventsTable = `
        CREATE TABLE IF NOT EXISTS events (
          id INT PRIMARY KEY AUTO_INCREMENT,
          title VARCHAR(100),
          description TEXT,
          date DATETIME,
          organization VARCHAR(100),
          category VARCHAR(50),
          image VARCHAR(255)
        )
      `;
      const registrationsTable = `
        CREATE TABLE IF NOT EXISTS registrations (
          id INT PRIMARY KEY AUTO_INCREMENT,
          event_id INT,
          user_id INT,
          first_name VARCHAR(50),
          last_name VARCHAR(50),
          phone VARCHAR(20),
          FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `;

      db.query(usersTable, (err) => { if (err) throw err; });
      db.query(eventsTable, (err) => { if (err) throw err; });
      db.query(registrationsTable, (err) => { if (err) throw err; });

      console.log('Tables ready');
    });
  });
});

module.exports = db;
