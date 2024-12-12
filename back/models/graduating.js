const mongoose = require("mongoose");
const StudyFields = require("../enum/studyFields");
const Levels = require("../enum/levels");

const graduatingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    subjects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
        },
    ],
    studyField: {
        type: String,
        required: true,
        enum: StudyFields,
    },
    level: {
        type: String,
        required: true,
        enum: Levels,
    },
});

module.exports = mongoose.model("Graduating", graduatingSchema);