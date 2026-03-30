require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./modules/auth/auth.routes');
const hospitalRoutes = require('./modules/hospitals/hospital.routes');
const departmentRoutes = require('./modules/departments/department.routes');
const queueRoutes = require('./modules/queues/queue.routes');
const bookingRoutes = require('./modules/bookings/booking.routes');
const errorHandler = require('./middleware/error');

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      process.env.CLIENT_URL,
      'http://localhost:5173',
      'http://localhost:3000',
    ].filter(Boolean);
    if (!origin || allowed.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'mediqueue-backend', timestamp: new Date() }));

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use(errorHandler);

module.exports = app;
