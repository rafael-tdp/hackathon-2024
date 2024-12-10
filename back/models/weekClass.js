const mongoose = require("mongoose");

const weekClassSchema = new mongoose.Schema(
    {
        startTime: {
            type: Date,
            required: true
        },
        endTime: {
            type: Date,
            required: true
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: true
        }
    }
);

module.exports = mongoose.model('WeekClass', weekClassSchema);
