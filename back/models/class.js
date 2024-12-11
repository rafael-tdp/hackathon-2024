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
        },
        studyFieldId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'StudyField'
        },
        subjects: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        }],
    }
);

module.exports = mongoose.model('Class', classSchema);
