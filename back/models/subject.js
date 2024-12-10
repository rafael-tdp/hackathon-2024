const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        requiredHours: {
            type: Number,
            required: true
        },
        completedHours: {
            type: Boolean,
            default: false
        },
        professors: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        programId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Program'
        }
});

module.exports = mongoose.model('Subject', subjectSchema);
