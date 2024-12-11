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
        studyFieldId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'StudyField'
        }
});

module.exports = mongoose.model('Subject', subjectSchema);
