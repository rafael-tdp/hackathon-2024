const express = require("express");
const Unavailability = require("../models/unavailability");
const Course = require("../models/course");

const router = express.Router();

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
            error: "Erreur interne du serveur lors de la création de l'indisponibilité.",
        });
    }
});

module.exports = router;
