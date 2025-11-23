const db = require('../config/db');

// Регистрация на мероприятие
exports.registerForEvent = (req, res) => {
  const { event_id, user_id, first_name, last_name, phone, isPaid } = req.body;

  const query = 'INSERT INTO registrations (event_id, user_id, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [event_id, user_id, first_name, last_name, phone], (err) => {
    if (err) return res.status(500).json({ message: err.message });

    if (isPaid) {
      const whatsappLink = `https://wa.me/1234567890?text=Я хочу купить билет на мероприятие ${event_id}`;
      return res.json({ message: 'Регистрация успешна', whatsappLink });
    }

    res.json({ message: 'Регистрация успешна' });
  });
};

// История мероприятий пользователя
exports.getUserEvents = (req, res) => {
  const { user_id } = req.params;
  const query = `
    SELECT e.*, r.id as registration_id 
    FROM events e 
    JOIN registrations r ON e.id = r.event_id 
    WHERE r.user_id = ?
  `;
  db.query(query, [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
};
