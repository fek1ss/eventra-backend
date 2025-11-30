const db = require('../config/db');

// Регистрация на мероприятие
exports.registerForEvent = async (req, res) => {
  try {
    const { event_id, user_id, first_name, last_name, phone } = req.body;

    // --- Проверка на заполненность полей ---
    if (!event_id || !user_id || !first_name || !last_name || !phone) {
      return res.status(400).json({ message: "Заполните все поля" });
    }

    // --- 1. Проверяем, существует ли событие ---
    const [eventRows] = await db.query(
      "SELECT title FROM events WHERE id = ?",
      [event_id]
    );

    if (!eventRows || eventRows.length === 0) {
      return res.status(404).json({ message: "Мероприятие не найдено" });
    }

    const eventTitle = eventRows[0].title || "Мероприятие";

    // --- 2. Проверка на повторную регистрацию ---
    const [existing] = await db.query(
      "SELECT id FROM registrations WHERE event_id = ? AND user_id = ?",
      [event_id, user_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Вы уже зарегистрированы на это мероприятие",
      });
    }

    // --- 3. Записываем регистрацию ---
    await db.query(
      "INSERT INTO registrations (event_id, user_id, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)",
      [event_id, user_id, first_name, last_name, phone]
    );

    // --- 4. Формируем WhatsApp ссылку ---

    // WhatsApp на iOS не работает со знаком "+"
    const phoneNumber = "77056689441"; // без +

    // Формируем текст сообщения полностью
    const message = `Здравствуйте! Пишу вам с платформы Eventra. Хочу зарегистрироваться на мероприятие: ${eventTitle}`;

    // Кодируем весь текст
    const encodedMessage = encodeURIComponent(message);

    // Итоговая ссылка
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    return res.status(200).json({
      message: "Регистрация успешна",
      whatsappLink,
    });

  } catch (err) {
    console.error("Ошибка при регистрации:", err);
    return res.status(500).json({
      message: "Ошибка сервера: " + err.message,
    });
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
