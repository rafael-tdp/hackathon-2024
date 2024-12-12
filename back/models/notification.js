const mongoose = require("mongoose");

const NotificationStatus = {
    UNREAD: 'unread',
    READ: 'read',
};

const notificationSchema = new mongoose.Schema(
    {
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
            required: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course', 
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            default: NotificationStatus.UNREAD,
            enum: [NotificationStatus.UNREAD, NotificationStatus.READ],
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
