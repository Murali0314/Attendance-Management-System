const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { addStudent, getStudents, updateStudent, deleteStudent } = require('../controllers/student.controller');

router.post('/add', auth(['Teacher']), addStudent);
router.get('/', auth(['Teacher']), getStudents);
router.put('/:id', auth(['Teacher']), updateStudent);
router.delete('/:id', auth(['Teacher']), deleteStudent);

module.exports = router;



