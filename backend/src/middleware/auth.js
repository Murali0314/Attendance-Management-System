const jwt = require('jsonwebtoken');

function auth(requiredRoles) {
    return (req, res, next) => {
        try {
            const token = req.cookies?.token;
            if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
            const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
            const payload = jwt.verify(token, JWT_SECRET);
            req.user = payload;
            if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(payload.role)) {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }
            next();
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
    };
}

module.exports = { auth };


