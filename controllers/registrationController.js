const db = require('../config/db');

// Регистрация на мероприятие
exports.registerForEvent = async (req, res) => {
  try {
    const { event_id, user_id, first_name, last_name, phone } = req.body;

    // --- 1. Проверяем, что все поля заполнены ---
    if (!event_id || !user_id || !first_name || !last_name || !phone) {
      return res.status(400).json({ message: "Заполните все поля" });
    }

    // --- 2. Получаем мероприятие и номер ответственного ---
    const [eventRows] = await db.query(
      "SELECT title, responsible_phone FROM events WHERE id = ?",
      [event_id]
    );

    if (!eventRows || eventRows.length === 0) {
      return res.status(404).json({ message: "Мероприятие не найдено" });
    }

    const eventTitle = eventRows[0].title || "Мероприятие";
    const responsiblePhone = eventRows[0].responsible_phone;

    if (!responsiblePhone) {
      return res.status(400).json({ message: "Номер ответственного не указан" });
    }

    // --- 3. Проверка на повторную регистрацию ---
    const [existing] = await db.query(
      "SELECT id FROM registrations WHERE event_id = ? AND user_id = ?",
      [event_id, user_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Вы уже зарегистрированы на это мероприятие",
      });
    }

    // --- 4. Записываем регистрацию ---
    await db.query(
      "INSERT INTO registrations (event_id, user_id, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)",
      [event_id, user_id, first_name, last_name, phone]
    );

    // --- 5. Формируем WhatsApp ссылку на ответственного ---
    // Убираем "+" на iOS
    const phoneNumber = responsiblePhone.replace(/\+/g, '');

    // Полностью кодируем текст сообщения
    const messageText = `Здравствуйте! Пишу с платформы Eventra. Мероприятие: ${eventTitle}`;
    const encodedMessage = encodeURIComponent(messageText);

    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    // --- 6. Возвращаем успешный результат ---
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
