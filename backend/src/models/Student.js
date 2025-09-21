const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
    {
        rollNo: { type: Number, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        subject: { type: String, required: true },
        section: { type: String, required: true },
        joinDate: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Student', StudentSchema);

// Ensure roll number uniqueness per subject (can repeat across subjects)
StudentSchema.index({ rollNo: 1, subject: 1 }, { unique: true });


