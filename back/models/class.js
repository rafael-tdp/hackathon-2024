const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
    {
            name: {
                type: String,
                required: true
            },
            nbStudents: {
                type: Number,
                required: true
            },
            year: {
                type: Number,
                required: true
            }
    }
);

module.exports = mongoose.model('Class', classSchema);
