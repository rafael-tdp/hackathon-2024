const express = require("express");
const User = require("../models/user");

const router = express.Router();

router.post("/register", async (req, res) => {
	try {
		const { name, email, password } = req.body;
		const newUser = new User({ name, email, password });
		await newUser.save();
		res.status(201).json({
			message: "Utilisateur créé avec succès",
			user: newUser,
		});
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

router.get("/", async (req, res) => {
	try {
		const users = await User.find();
		res.status(200).json(users);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
