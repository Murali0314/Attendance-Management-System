const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { getStudents, getTeachers, updateTeacher, deleteTeacher } = require('../controllers/admin.controller');

router.get('/students', auth(['Admin']), getStudents);
router.get('/teachers', auth(['Admin']), getTeachers);
router.put('/teachers/:id', auth(['Admin']), updateTeacher);
router.delete('/teachers/:id', auth(['Admin']), deleteTeacher);

module.exports = router;



