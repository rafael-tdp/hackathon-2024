const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		firstname: {
			type: String,
			required: true,
		},
		lastname: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			default: "student",
			enum: ["student", "teacher", "admin"],
		},
		classId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Class",
		},
		programId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Program",
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
