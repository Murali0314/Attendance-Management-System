// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const cookieParser = require('cookie-parser');
// const morgan = require('morgan');
// require('dotenv').config();

// const authRoutes = require('./src/routes/auth.routes');
// const studentRoutes = require('./src/routes/student.routes');
// const attendanceRoutes = require('./src/routes/attendance.routes');
// const adminRoutes = require('./src/routes/admin.routes');
// const { startWeeklyCron } = require('./src/cron/weekly.cron');

// const app = express();

// app.use(morgan('dev'));
// app.use(express.json());
// app.use(cookieParser());
// app.use(cors({
//     origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
//     credentials: true,
// }));

// app.get('/api/health', (req, res) => {
//     res.json({ success: true, message: 'API is healthy' });
// });

// app.use('/api/auth', authRoutes);
// app.use('/api/students', studentRoutes);
// app.use('/api/attendance', attendanceRoutes);
// app.use('/api/admin', adminRoutes);

// const PORT = process.env.PORT || 5000;
// const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ams';

// mongoose
//     .connect(MONGO_URI)
//     .then(() => {
//         console.log('MongoDB connected');
//         app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
//         startWeeklyCron();
//     })
//     .catch((err) => {
//         console.error('Mongo connection error', err);
//         process.exit(1);
//     });



const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path'); // Add this
require('dotenv').config();

const authRoutes = require('./src/routes/auth.routes');
const studentRoutes = require('./src/routes/student.routes');
const attendanceRoutes = require('./src/routes/attendance.routes');
const adminRoutes = require('./src/routes/admin.routes');
const { startWeeklyCron } = require('./src/cron/weekly.cron');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));

// API health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'API is healthy' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);

// Serve React frontend (for production)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'frontend', 'build')));

    // Catch-all route
    app.get('/*', (req, res) => {
        res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
    });
}


const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ams';

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
        startWeeklyCron();
    })
    .catch((err) => {
        console.error('Mongo connection error', err);
        process.exit(1);
    });
