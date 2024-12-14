const express = require("express");
const ApiResponse = require("../models/apiResponse");
const { getStats } = require("../services/statsServices");

const router = express.Router();

router.get("/", async (req, res) => {
	try {
		const stats = await getStats();
		res.json(
			new ApiResponse({
				success: true,
				data: stats,
			})
		);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});


module.exports = router;