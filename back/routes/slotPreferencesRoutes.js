const express = require("express");
const SlotPreference = require("../models/SlotPreference");
const User = require("../models/user");
const router = express.Router();

router.get("/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({
        success: false,
        message: "Intervenant non trouvé ou rôle incorrect.",
      });
    }

    const preferences = await SlotPreference.findOne({ teacher: teacherId });

    if (!preferences) {
      return res.status(404).json({
        success: false,
        message: "Aucune préférence de créneaux trouvée pour cet intervenant.",
      });
    }

    res.status(200).json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des préférences :", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur.",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const preferences = await SlotPreference.find().populate(
      "teacher",
      "firstname lastname"
    );

    res.status(200).json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des préférences :", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur.",
    });
  }
});

router.post("/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;

    console.log("teacherId", teacherId);

    const { slots } = req.body;

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({
        success: false,
        message: "Intervenant non trouvé ou rôle incorrect.",
      });
    }

    // Vérifier si des créneaux sont envoyés dans le body
    if (!slots || slots.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir au moins un créneau.",
      });
    }

    let preferences = await SlotPreference.findOne({ teacher: teacherId });

    if (preferences) {
      preferences.slots = slots;
    } else {
      preferences = new SlotPreference({
        teacher: teacherId,
        slots,
      });
    }

    await preferences.save();

    res.status(201).json({
      success: true,
      message: "Préférences de créneaux mises à jour avec succès.",
      data: preferences,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout des préférences :", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur.",
    });
  }
});

module.exports = router;
