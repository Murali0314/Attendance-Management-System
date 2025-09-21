const Student = require('../models/Student');

exports.addStudent = async (req, res) => {
    try {
        const { rollNo, name, email, subject, section } = req.body;
        if (!rollNo || !name || !email || !subject || !section)
            return res.status(400).json({ success: false, message: 'Missing fields' });
        const joinDate = req.body.joinDate;
        const s = await Student.create({ rollNo, name, email, subject, section, joinDate });
        return res.json({ success: true, message: 'Student added', data: s });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.getStudents = async (req, res) => {
    try {
        const { subject, section } = req.query;
        const students = await Student.find({ subject, section }).sort({ rollNo: 1 });
        return res.json({ success: true, message: 'OK', data: students });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { rollNo, name, email } = req.body;
        const updated = await Student.findByIdAndUpdate(
            id,
            { rollNo, name, email },
            { new: true }
        );
        return res.json({ success: true, message: 'Student updated', data: updated });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        await Student.findByIdAndDelete(id);
        return res.json({ success: true, message: 'Student deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};



