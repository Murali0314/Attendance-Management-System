const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function validatePassword(pw) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(pw);
}

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, subject } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'Missing fields' });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({ success: false, message: 'Password policy failed' });
        }
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ success: false, message: 'Email already exists' });
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hash, role, subject });
        return res.json({ success: true, message: 'Registered', data: { id: user._id } });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(400).json({ success: false, message: 'Invalid credentials' });
        const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
        const token = jwt.sign({ id: user._id, role: user.role, subject: user.subject, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 });
        return res.json({ success: true, message: 'Logged in', data: { role: user.role, subject: user.subject, name: user.name } });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.logout = async (req, res) => {
    res.clearCookie('token');
    return res.json({ success: true, message: 'Logged out' });
};


