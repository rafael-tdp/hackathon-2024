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
        schoolClass: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SchoolClass'
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        },
    }
);

module.exports = mongoose.model('SubjectClass', classSchema);
