const express = require("express");
const ApiResponse = require("../models/apiResponse");
const planningServices = require("../services/planningServices");
const iaServices = require("../services/iaServices");
const router = express.Router();
// router.get("/:classId", async (req, res) => {
//     try {
//         const classId = req.params.classId;
//         const schedule = await planningServices.getClassSchedule(classId);
//         const countTotal = schedule.length;
//         res.set('X-Total-Count', countTotal);
//         res.json(new ApiResponse({
//             success: true,
//             data: schedule
//         }));
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });
router.get("/:teacherId", async (req, res) => {
    try {
        const teacherId = req.params.teacherId;
        const schedule = await planningServices.getTheoreticalScheduleByTeacher(teacherId);
        const response = await iaServices.sendRequest(JSON.stringify(schedule))

        // const countTotal = schedule.length;
        // res.set('X-Total-Count', countTotal);
        res.json(new ApiResponse({
            success: true,
            data: {
                response,
                schedule
            }
        }));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;