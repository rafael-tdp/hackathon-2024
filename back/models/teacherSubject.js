const mongoose = require("mongoose");

const teacherSubjectSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	subjects: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Subject",
		},
	],
	graduating: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Graduating",
	},
});

module.exports = mongoose.model("TeacherSubject", teacherSubjectSchema);
