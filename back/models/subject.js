const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	requiredHours: {
		type: Number,
		required: true,
	},
	graduatingId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Graduating",
	},
});

module.exports = mongoose.model("Subject", subjectSchema);
