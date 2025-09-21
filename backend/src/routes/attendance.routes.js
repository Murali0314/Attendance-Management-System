const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { saveToday, getAttendance } = require('../controllers/attendance.controller');

router.post('/save', auth(['Teacher']), saveToday);
router.get('/', auth(['Teacher','Admin']), getAttendance);

module.exports = router;



