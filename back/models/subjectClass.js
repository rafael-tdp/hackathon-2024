const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
{
        plannedHours: {
            type: Number,
            required: true
        },
        completedHours: {
            type: Number,
            required: true
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class'
        },
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        },
    }
);

module.exports = mongoose.model('Class', classSchema);
