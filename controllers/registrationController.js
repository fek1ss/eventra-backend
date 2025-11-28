const db = require('../config/db');

// Регистрация на мероприятие
exports.registerForEvent = async (req, res) => {
  try {
    const { event_id, user_id, first_name, last_name, phone } = req.body;

    // --- 1. Получаем название мероприятия ---
    
    const [results] = await db.query("SELECT title FROM events WHERE id = ?", [event_id]); 
    
    // Проверяем, что массив результатов не пуст, и безопасно извлекаем title.
    let eventTitle = "Мероприятие"; // Дефолтное значение
    
    if (results && results.length > 0 && results[0].title) {
        eventTitle = results[0].title;
    }
    
    // --- 2. Записываем регистрацию ---
    await db.query(
      'INSERT INTO registrations (event_id, user_id, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)',
      [event_id, user_id, first_name, last_name, phone]
    );

    // --- 3. Формируем ссылку WhatsApp ---
    const phoneNumber = "+77056689441";
    // Всегда кодируем, чтобы в ссылке не было проблем с пробелами и спецсимволами
    const encodedTitle = encodeURIComponent(eventTitle); 
    
    const whatsappLink = `https://wa.me/${phoneNumber}?text=Здравствуйте, пишу вам с платформы Eventra. Мероприятие: ${encodedTitle}`;

    return res.json({ message: "Регистрация успешна", whatsappLink });
  } catch (err) {
    console.error("Ошибка при регистрации:", err);
    res.status(500).json({ message: "Ошибка сервера: " + err.message });
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
