const db = require('../config/db');

// Регистрация на мероприятие
exports.registerForEvent = async (req, res) => {
  try {
    const { event_id, user_id, first_name, last_name, phone, isPaid } = req.body;

    await db.query(
      'INSERT INTO registrations (event_id, user_id, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)',
      [event_id, user_id, first_name, last_name, phone]
    );

    if (isPaid) {
      const whatsappLink = `https://wa.me/1234567890?text=Я хочу купить билет на мероприятие ${event_id}`;
      return res.json({ message: 'Регистрация успешна', whatsappLink });
    }

    res.json({ message: 'Регистрация успешна' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// История мероприятий пользователя
exports.getUserEvents = async (req, res) => {
  try {
    const { user_id } = req.params;
    const query = `
      SELECT e.*, r.id as registration_id 
      FROM events e 
      JOIN registrations r ON e.id = r.event_id 
      WHERE r.user_id = ?
    `;
    const [results] = await db.query(query, [user_id]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
