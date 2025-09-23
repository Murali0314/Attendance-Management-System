const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import your routes
const authRoutes = require('./src/routes/auth.routes');
const studentRoutes = require('./src/routes/student.routes');
const attendanceRoutes = require('./src/routes/attendance.routes');
const adminRoutes = require('./src/routes/admin.routes');
const { startWeeklyCron } = require('./src/cron/weekly.cron');

// NEW: Import the authentication middleware you created
const { auth } = require('./src/middleware/auth');

const app = express();

// ------------------ Middleware ------------------ //
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// ------------------ CORS ------------------ //
// This is the correct CORS configuration
const allowedOrigins = [
  process.env.CLIENT_ORIGIN_LOCAL || 'http://localhost:5173',
  'https://attendance-management-system-27.onrender.com'
];
app.use(cors({ origin: allowedOrigins, credentials: true }));

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

// The auth route is public, so it has no middleware
app.use('/api/auth', authRoutes);

// CORRECTED: Apply the authentication middleware to all protected routes
// This is the critical step that was missing.
app.use('/api/students', auth(['admin', 'teacher']), studentRoutes);
app.use('/api/attendance', auth(['admin', 'teacher']), attendanceRoutes);
app.use('/api/admin', auth(['admin']), adminRoutes);

// ------------------ Serve React Frontend ------------------ //
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, 'frontend','build'); // correct relative path
  app.use(express.static(buildPath));

  // Catch-all route for React Router (v4+)
  app.use('/assets', express.static(path.join(buildPath, 'assets')));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// ------------------ MongoDB Connection ------------------ //
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://gorlamuralidhar:murali@cluster0.acymuxe.mongodb.net/ams?retryWrites=true&w=majority";

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
