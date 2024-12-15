const mongoose = require("mongoose");
const CourseStatus = require("../enum/courseStatus");

const courseSchema = new mongoose.Schema(
    {
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
            required: true
        },
        teacher: {
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
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ClassRoom',
        },
        schoolClass: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SchoolClass',
            required: true
        },
        status: {
            type: String,
            default: CourseStatus.PENDING,
            enum: [CourseStatus.PENDING, CourseStatus.ACCEPTED, CourseStatus.CANCELLED]
        }
    }
);

module.exports = mongoose.model('Course', courseSchema);
