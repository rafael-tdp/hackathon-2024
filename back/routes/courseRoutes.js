const express = require("express");
const ApiResponse = require("../models/apiResponse");
const Course = require("../models/course");

const router = express.Router();

router.get("/populated", async (req, res) => {
  try {
    const {
      page = 1,
      limit,
      teacherId,
      classRoomId,
      schoolClassId,
      status,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = limit ? parseInt(limit) : null;
    const skip = (pageNum - 1) * (limitNum || 0);

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

    // Récupérer les données avec la pagination
    const [courses, total] = await Promise.all([
      query.skip(skip).limit(limitNum).exec(),
      Course.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);
    res.set("X-Total-Count", total)
    res.json(
        new ApiResponse({
          success: true,
          data: courses,
          total,
          page: pageNum,
          totalPages,
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

    const courses = await Course.find({ status })
      .populate("teacher")
      .populate("classRoom")
      .populate("schoolClass")
      .populate("subject");

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
