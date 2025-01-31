const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
require('dotenv').config();

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Define Routes
app.use('/api/events', require('./src/routes/eventRoutes'));
app.use('/api/bookings', require('./src/routes/bookingRoutes'));
app.use('/api/auth', require('./src/routes/authRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});