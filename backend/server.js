// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./src/routes/auth.routes');
const studentRoutes = require('./src/routes/student.routes');
const attendanceRoutes = require('./src/routes/attendance.routes');
const adminRoutes = require('./src/routes/admin.routes');
const { startWeeklyCron } = require('./src/cron/weekly.cron');

const app = express();

// ------------------ Middleware ------------------ //
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// ------------------ CORS ------------------ //
const allowedOrigins = [
  process.env.CLIENT_ORIGIN_LOCAL || 'http://localhost:5173',
  process.env.CLIENT_ORIGIN_PROD || 'https://attendance-management-system-4-386e.onrender.com',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Optional CORS error handler
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: err.message });
  }
  next(err);
});

// ------------------ API Routes ------------------ //
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy' });
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);

// ------------------ Serve React Frontend ------------------ //
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../frontend/build'); // correct relative path
  app.use(express.static(buildPath));

  // Catch-all route for React Router (v4+)
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// ------------------ MongoDB Connection ------------------ //
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://gorlamuralidhar:murali@cluster0.acymuxe.mongodb.net/ams?retryWrites=true&w=majority';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    startWeeklyCron();
  })
  .catch((err) => {
    console.error('❌ Mongo connection error', err);
    process.exit(1);
  });

// ------------------ Unknown API Routes Logger ------------------ //
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) {
    console.warn(`⚠️ Unhandled API route: ${req.method} ${req.originalUrl}`);
  }
  next();
});
