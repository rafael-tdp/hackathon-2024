const express = require("express");
const ApiResponse = require("../models/apiResponse");
const planningServices = require("../services/planningServices");

const router = express.Router();

router.get("/:classId", async (req, res) => {
    try {
        const classId = req.params.classId;
        const schedule = await planningServices.getClassSchedule(classId);
        res.json(new ApiResponse({
            success: true,
            data: schedule
        }));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;