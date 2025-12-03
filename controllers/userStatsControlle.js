const db = require('../config/db');

exports.getUserStats = async (req, res) => {
  const userId = req.params.id;

  try {
    // Upcoming events
    const [upcoming] = await db.query(`
      SELECT e.*
      FROM events e
      JOIN registrations r ON r.event_id = e.id
      WHERE r.user_id = ?
        AND e.date >= NOW()
      ORDER BY e.date
    `, [userId]);

    // Attended
    const [attended] = await db.query(`
      SELECT COUNT(*) AS attendedCount
      FROM events e
      JOIN registrations r ON r.event_id = e.id
      WHERE r.user_id = ?
        AND e.date < NOW()
    `, [userId]);

    // Total spent
    const [spent] = await db.query(`
      SELECT SUM(e.price) AS totalSpent
      FROM events e
      JOIN registrations r ON r.event_id = e.id
      WHERE r.user_id = ?
    `, [userId]);

    res.json({
      upcomingEvents: upcoming.length,
      attendedEvents: attended[0].attendedCount,
      totalSpent: spent[0].totalSpent || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
};

// История мероприятий пользователя
exports.getUserEvents = async (req, res) => {
  const userId = req.params.user_id;

  try {
    const [events] = await db.query(`
      SELECT e.*, r.id AS registration_id
      FROM events e
      JOIN registrations r ON r.event_id = e.id
      WHERE r.user_id = ?
      ORDER BY e.date DESC
    `, [userId]);

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
};