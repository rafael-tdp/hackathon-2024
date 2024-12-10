const mongoose = require("mongoose");

const classRoomSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        capacity: {
            type: Number,
            required: true
        }
    }
);

module.exports = mongoose.model('ClassRoom', classRoomSchema);
