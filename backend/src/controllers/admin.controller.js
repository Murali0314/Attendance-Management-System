const User = require('../models/User');
const Student = require('../models/Student');

exports.getStudents = async (req, res) => {
    try {
        const { subject, section } = req.query;
        const students = await Student.find({ subject, section }).sort({ rollNo: 1 });
        return res.json({ success: true, message: 'OK', data: students });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.getTeachers = async (req, res) => {
    try {
        const teachers = await User.find({ role: 'Teacher' }).sort({ createdAt: -1 });
        return res.json({ success: true, message: 'OK', data: teachers });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, subject } = req.body;
        const updated = await User.findByIdAndUpdate(id, { name, email, subject }, { new: true });
        return res.json({ success: true, message: 'Teacher updated', data: updated });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        return res.json({ success: true, message: 'Teacher deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};



