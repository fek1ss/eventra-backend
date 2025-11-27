const db = require('../config/db');

// Регистрация на мероприятие
exports.registerForEvent = async (req, res) => {
  try {
    const { event_id, user_id, first_name, last_name, phone } = req.body;

    // Получаем название мероприятия
    const [rows] = await db.query("SELECT title FROM events WHERE id = ?", [event_id]);
    const eventTitle = rows[0]?.title || "Мероприятие";

    // Записываем регистрацию
    await db.query(
      'INSERT INTO registrations (event_id, user_id, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)',
      [event_id, user_id, first_name, last_name, phone]
    );


    const phoneNumber = "+77056689441";

    const encodedTitle = encodeURIComponent(eventTitle);
    const whatsappLink = `https://wa.me/${phoneNumber}?text=Здравствуйте, пишу вам с платформы Eventra. Мероприятие: ${encodedTitle}`;

    return res.json({ message: "Регистрация успешна", whatsappLink });
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
