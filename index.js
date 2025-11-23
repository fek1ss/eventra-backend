const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registration');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // для картинок

// Роуты
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/registration', registrationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
