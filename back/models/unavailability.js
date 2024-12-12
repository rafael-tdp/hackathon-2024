const mongoose = require("mongoose");

const unavailabilitySchema = new mongoose.Schema(
    {
        startTime: {
            type: Date,
            required: true
        },
        endTime: {
            type: Date,
            required: true
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    }
);

module.exports = mongoose.model('Unavailability', unavailabilitySchema);
