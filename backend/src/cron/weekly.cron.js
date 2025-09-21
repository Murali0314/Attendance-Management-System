// const cron = require('node-cron');
// const dayjs = require('dayjs');
// const Attendance = require('../models/Attendance');
// const Student = require('../models/Student');
// const EmailLog = require('../models/EmailLog');
// const { sendEmail } = require('../utils/mailer');

// function getWeekRangeForLastWeek() {
//     // Previous Monday to Saturday, and send Sunday 09:00
//     const now = dayjs();
//     const lastWeekStart = now.startOf('week').add(1, 'day').subtract(7, 'day');
//     const start = lastWeekStart.format('YYYY-MM-DD');
//     const end = lastWeekStart.add(5, 'day').format('YYYY-MM-DD');
//     return { start, end };
// }

// async function processWeeklyEmails() {
//     const { start, end } = getWeekRangeForLastWeek();
//     const students = await Student.find({});
//     for (const s of students) {
//         const recs = await Attendance.find({ studentId: s._id, subject: s.subject, section: s.section, date: { $gte: start, $lte: end } });
//         if (recs.length === 0) continue;
//         const present = recs.filter((r) => r.status === 'Present').length;
//         const pct = Math.round((present / recs.length) * 100);
//         if (pct < 75) {
//             const subject = `Attendance Alert (${s.subject} - ${s.section})`;
//             const text = `Dear ${s.name}, your attendance for ${s.subject} (${s.section}) from ${start} to ${end} is ${pct}%. Please improve.`;
//             try {
//                 await sendEmail(s.email, subject, text);
//                 await EmailLog.create({ studentId: s._id, subject: s.subject, weekStart: start, weekEnd: end, status: 'Success' });
//             } catch (err) {
//                 await EmailLog.create({ studentId: s._id, subject: s.subject, weekStart: start, weekEnd: end, status: 'Failed', message: err.message });
//             }
//         }
//     }
// }

// function startWeeklyCron() {
//     // Every Sunday at 09:00
//     cron.schedule('50 11 * * 0', () => {
//         processWeeklyEmails().catch((e) => console.error('Weekly cron error', e));
//     });
// }

// module.exports = { startWeeklyCron, processWeeklyEmails };



const cron = require('node-cron');
const dayjs = require('dayjs');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const EmailLog = require('../models/EmailLog');
const { sendEmail } = require('../utils/mailer');

// Get last week's Monday to Saturday
function getWeekRangeForLastWeek() {
    const now = dayjs();
    const lastWeekStart = now.startOf('week').add(1, 'day').subtract(7, 'day'); // last Monday
    const start = lastWeekStart.format('YYYY-MM-DD');
    const end = lastWeekStart.add(5, 'day').format('YYYY-MM-DD'); // Saturday
    return { start, end };
}

// Format date nicely
function formatDate(dateStr) {
    return dayjs(dateStr).format('D MMMM YYYY');
}

async function processWeeklyEmails() {
    const { start, end } = getWeekRangeForLastWeek();
    const students = await Student.find({});

    for (const student of students) {
        // Weekly attendance
        const weeklyRecs = await Attendance.find({
            studentId: student._id,
            subject: student.subject,
            section: student.section,
            date: { $gte: start, $lte: end }
        });
        if (weeklyRecs.length === 0) continue;

        const weeklyPresent = weeklyRecs.filter(r => r.status === 'Present').length;
        const weeklyPct = Math.round((weeklyPresent / weeklyRecs.length) * 100);

        // Total attendance
        const allRecs = await Attendance.find({
            studentId: student._id,
            subject: student.subject,
            section: student.section
        });
        const totalPresent = allRecs.filter(r => r.status === 'Present').length;
        const totalPct = allRecs.length > 0 ? Math.round((totalPresent / allRecs.length) * 100) : 0;

        // Only send email if weekly attendance < 75%
        if (weeklyPct < 75) {
            const subject = `Attendance Alert – ${student.subject} (${student.section})`;

            const message = `
Dear ${student.name},

We noticed that your attendance for the subject ${student.subject} (${student.section}) from ${formatDate(start)} to ${formatDate(end)} is ${weeklyPct}%, which is below the required 75%.

Your total attendance percentage for this subject/section is ${totalPct}%.

Regular attendance is important to keep up with course material and succeed academically. Please make sure to attend upcoming classes and catch up on any missed sessions.

If you have any concerns or need assistance, feel free to contact your instructor.

Best regards,
RGMCET
            `;

            try {
                await sendEmail(student.email, subject, message);
                await EmailLog.create({
                    studentId: student._id,
                    subject: student.subject,
                    weekStart: start,
                    weekEnd: end,
                    status: 'Success'
                });
            } catch (err) {
                await EmailLog.create({
                    studentId: student._id,
                    subject: student.subject,
                    weekStart: start,
                    weekEnd: end,
                    status: 'Failed',
                    message: err.message
                });
            }
        }
    }
}

function startWeeklyCron() {
    // Every Sunday at 11:50 AM (server time)
    cron.schedule('50 11 * * 0', () => {
        processWeeklyEmails().catch(err => console.error('Weekly cron error', err));
    });
}

module.exports = { startWeeklyCron, processWeeklyEmails };
