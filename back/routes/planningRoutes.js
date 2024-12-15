const express = require("express");
const ApiResponse = require("../models/apiResponse");
const planningServices = require("../services/planningServices");
const iaServices = require("../services/iaServices");
const {json} = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { teacher, schoolClass } = req.query;
        let schedule;

        if (teacher) {
            schedule = await planningServices.getTheoreticalScheduleByTeacher(teacher);
        } else if (schoolClass) {
            schedule = await planningServices.getTheoreticalScheduleBySchoolClass(schoolClass);
        } else {
            res.status(400).json({ error: "Missing required query parameter: teacher or user" });
        }
        const response = await iaServices.sendRequest(JSON.stringify(schedule), schedule.classId);
        const parsedResponse = JSON.parse(response)
        const result = await planningServices.ConvertToCourse(parsedResponse)
        res.json(new ApiResponse({
            success: true,
            data: result
        }));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;