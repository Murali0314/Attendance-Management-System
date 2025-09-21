const mongoose = require('mongoose');

const EmailLogSchema = new mongoose.Schema(
    {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
        subject: { type: String, required: true },
        weekStart: { type: String, required: true },
        weekEnd: { type: String, required: true },
        sentAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['Success', 'Failed'], required: true },
        message: { type: String },
    },
    { timestamps: false }
);

module.exports = mongoose.model('EmailLog', EmailLogSchema);



