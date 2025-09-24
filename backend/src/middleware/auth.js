// Corrected auth middleware
const jwt = require('jsonwebtoken');

function auth(requiredRoles) {
    return (req, res, next) => {
        try {
            // Get the token from the Authorization header
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
            }
            const token = authHeader.split(' ')[1]; // Extract the token from "Bearer <token>"
            
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
