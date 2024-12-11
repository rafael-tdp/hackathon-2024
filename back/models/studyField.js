const mongoose = require("mongoose");

const studyFieldSchema  = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
    }
);

module.exports = mongoose.model('Study', studyFieldSchema );
