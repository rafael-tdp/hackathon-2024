const express = require("express");
const ApiResponse = require("../models/apiResponse");
const Course = require("../models/course");

const router = express.Router();

router.get("/populated", async (req, res) => {
	try {
		const { teacherId, classRoomId, schoolClassId, status } = req.query;

		// create a query that populates the teacher, classRoom and schoolClass fields and filters by the query parameters
		const query = Course.find()
			.populate("teacher")
			.populate("classRoom")
			.populate("schoolClass")
			.populate("subject");

		if (teacherId) {
			query.where("teacher", teacherId);
		}

		if (classRoomId) {
			query.where("classRoom", classRoomId);
		}

		if (schoolClassId) {
			query.where("schoolClass", schoolClassId);
		}

		if (status) {
			query.where("status", status);
		}

		const courses = await query.exec();

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

router.post("/validation", async (req, res) => {
	try {
		const courses = req.body;
		const createdCourses = await Course.insertMany(courses);

		res.json(
			new ApiResponse({
				success: true,
				data: createdCourses,
			})
		);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.get("/status/:status", async (req, res) => {
	try {
		const { status } = req.params;

		const courses = await Course.find({ status }).exec();

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
