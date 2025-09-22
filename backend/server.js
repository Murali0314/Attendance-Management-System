const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path'); // Only once
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

// CORS: allow local dev and Render frontend
const allowedOrigins = [
    'http://localhost:5173',
    process.env.CLIENT_ORIGIN || 'https://attendance-management-system-4-386e.onrender.com' // Replace with your Render URL
];

app.use(cors({
    origin: function(origin, callback) {
        // allow requests with no origin (e.g., curl, Postman)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

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
    const buildPath = path.join(__dirname, 'frontend', 'build');
    app.use(express.static(buildPath));

    // Catch-all route for React routing
    app.get('*', (req, res) => {
        res.sendFile(path.join(buildPath, 'index.html'));
    });
}

// ------------------ MongoDB Connection ------------------ //
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ams';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
        startWeeklyCron();
    })
    .catch(err => {
        console.error('Mongo connection error', err);
        process.exit(1);
    });
