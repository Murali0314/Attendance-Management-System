const dayjs = require('dayjs');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

function getToday() {
    return dayjs().format('YYYY-MM-DD');
}

exports.saveToday = async (req, res) => {
    try {
        const { subject, section, records } = req.body; // [{studentId, status}]
        const date = getToday();
        // lock check: if already locked for date, block
        const anyLocked = await Attendance.findOne({ subject, section, date, locked: true });
        if (anyLocked) return res.status(400).json({ success: false, message: 'Attendance locked for today for this subject & section' });

        // Upsert for each student
        const ops = records.map((r) => ({
            updateOne: {
                filter: { studentId: r.studentId, subject, section, date },
                update: { $set: { status: r.status, locked: true } },
                upsert: true,
            },
        }));
        await Attendance.bulkWrite(ops);
        return res.json({ success: true, message: 'Attendance saved and locked' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

function getWeekRange(d = dayjs()) {
    const monday = d.startOf('week').add(1, 'day');
    // Ensure Monday-Saturday; depending on locale Sunday is startOf('week')
    const start = monday.format('YYYY-MM-DD');
    const end = monday.add(5, 'day').format('YYYY-MM-DD');
    return { start, end };
}

async function calcPercentagesFor(subject, section) {
    const students = await Student.find({ subject, section }).sort({ rollNo: 1 });
    const { start, end } = getWeekRange();
    const datesInWeek = [];
    for (let i = 0; i < 6; i++) datesInWeek.push(dayjs(start).add(i, 'day').format('YYYY-MM-DD'));

    // Determine which dates are locked for this subject-section
    const lockedDocs = await Attendance.find({ subject, section, date: { $in: datesInWeek }, locked: true }).select('date locked');
    const lockedByDate = Object.fromEntries(datesInWeek.map((d) => [d, false]));
    for (const doc of lockedDocs) lockedByDate[doc.date] = true;

    const studentRows = [];
    for (const s of students) {
        const weekly = await Attendance.find({ studentId: s._id, subject, section, date: { $gte: start, $lte: end } });
        const total = await Attendance.find({ studentId: s._id, subject, section });
        const weeklyPresent = weekly.filter((a) => a.status === 'Present').length;
        const weeklyPct = weekly.length ? Math.round((weeklyPresent / weekly.length) * 100) : 0;
        const totalPresent = total.filter((a) => a.status === 'Present').length;
        const totalPct = total.length ? Math.round((totalPresent / total.length) * 100) : 0;
        const dayMap = Object.fromEntries(weekly.map((a) => [a.date, a.status]));
        const days = datesInWeek.map((d) => dayMap[d] || null);
        studentRows.push({ student: s, days, weeklyPct, totalPct });
    }
    return { students: studentRows, datesInWeek, lockedByDate };
}

exports.getAttendance = async (req, res) => {
    try {
        const { subject, section } = req.query;
        const data = await calcPercentagesFor(subject, section);
        return res.json({ success: true, message: 'OK', data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports._internal = { getWeekRange, calcPercentagesFor };


