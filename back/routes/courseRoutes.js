const express = require("express");
const ApiResponse = require("../models/apiResponse");
const Course = require("../models/course");

const router = express.Router();

router.get("/", async (req, res) => {
	try {
		const courses = await Course.find().populate("subject teacher schoolClass");
		res.json(
			new ApiResponse({
				success: true,
				data: courses,
			})
		);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
