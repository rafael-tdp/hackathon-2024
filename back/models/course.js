const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
    {
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
            required: true
        },
        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        startTime: {
            type: Date,
            required: true
        },
        endTime: {
            type: Date,
            required: true
        },
        classRoom: {
            type: String,
            required: true
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: true
        }
    }
);

module.exports = mongoose.model('Course', courseSchema);
