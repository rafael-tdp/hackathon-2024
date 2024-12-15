const express = require("express");
const Unavailability = require("../models/unavailability");
const Course = require("../models/course");

const router = express.Router();

router.get("/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Unavailability.countDocuments({ teacher: teacherId });
    const totalPages = Math.ceil(total / limitNum);

    const data = await Unavailability.find({ teacher: teacherId })
      .skip(skip)
      .limit(limitNum)
      .populate("teacher");

    res.json({
      success: true,
      data,
      total,
      page: pageNum,
      totalPages,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des indisponibilités :",
      error
    );
    res.status(500).json({
      error:
        "Erreur interne du serveur lors de la récupération des indisponibilités.",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Unavailability.countDocuments();
    const totalPages = Math.ceil(total / limitNum);
    const data = await Unavailability.find()
      .populate("teacher")
      .skip(skip)
      .limit(limitNum);

    console.log("data", data);

    res.json({
      success: true,
      data,
      total,
      page: pageNum,
      totalPages,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des indisponibilités :",
      error
    );
    res.status(500).json({
      error:
        "Erreur interne du serveur lors de la récupération des indisponibilités.",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { teacher, startTime, endTime } = req.body;

    const newUnavailability = new Unavailability({
      teacher,
      startTime,
      endTime,
    });
    await newUnavailability.save();

    const overlappingCourses = await Course.find({
      teacher,
      $or: [
        { startTime: { $lte: new Date(endTime), $gte: new Date(startTime) } },
        { endTime: { $lte: new Date(endTime), $gte: new Date(startTime) } },
        {
          $and: [
            { startTime: { $lte: new Date(startTime) } },
            { endTime: { $gte: new Date(endTime) } },
          ],
        },
      ],
    });

    await Promise.all(
      overlappingCourses.map(async (course) => {
        course.status = "cancelled";
        await course.save();
      })
    );

    res.status(201).json({
      message: "Indisponibilité créée et cours affectés mis à jour.",
      unavailability: newUnavailability,
      affectedCourses: overlappingCourses.length,
    });
  } catch (error) {
    console.error("Erreur lors de la création d'une indisponibilité :", error);
    res.status(500).json({
      error:
        "Erreur interne du serveur lors de la création de l'indisponibilité.",
    });
  }
});

module.exports = router;
