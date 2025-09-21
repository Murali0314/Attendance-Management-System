const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
	{
		studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
		subject: { type: String, required: true },
		section: { type: String, required: true },
		date: { type: String, required: true }, // YYYY-MM-DD
		status: { type: String, enum: ['Present', 'Absent'], required: true },
		locked: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

// Unique per student per subject-section per date
AttendanceSchema.index({ studentId: 1, subject: 1, section: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);


