const express = require("express");
const Notification = require("../models/notification");
const User = require("../models/user");
const Course = require("../models/course");
const ApiResponse = require("../models/apiResponse");
const sendEmail = require("../utils/sendEmail");
const ClassRoom = require("../models/classRoom");
const Subject = require("../models/subject");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { teacherId, courseId, message } = req.body;

    const teacher = await User.findById(teacherId);

    if (!(!teacher || teacher.role !== "teacher")) {
      return res.status(404).json(
        new ApiResponse({
          success: false,
          message: "Enseignant non trouvé ou rôle invalide",
        })
      );
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json(
        new ApiResponse({
          success: false,
          message: "Cours non trouvé",
        })
      );
    }

    const notification = new Notification({
      teacher: teacher._id,
      course: course._id,
      message: message,
    });

    await notification.save();

    const room = await ClassRoom.findById(course.classRoom);

    const subject = await Subject.findById(course.subject);

    const emailSubject = "Notification : Changement de cours";
    const emailText = `
            Bonjour ${teacher.firstname} ${teacher.lastname},

            Une nouvelle notification concernant un cours vous a été adressée :
            - Cours : ${subject.name}
            - Salle : ${room.name}
            - Message : ${message}

            Merci de vérifier les détails dans votre tableau de bord.
        `;

    await sendEmail({
      to: teacher.email,
      subject: emailSubject,
      text: emailText,
    });

    res.status(201).json(
      new ApiResponse({
        success: true,
        message: "Notification créée et email envoyé avec succès",
        data: notification,
      })
    );
  } catch (error) {
    console.error("Erreur lors de la création de la notification :", error);
    res.status(500).json(
      new ApiResponse({
        success: false,
        message: "Erreur lors de la création de la notification",
      })
    );
  }
});

router.get("/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json(
        new ApiResponse({
          success: false,
          message: "Enseignant non trouvé ou rôle invalide",
        })
      );
    }

    const notifications = await Notification.find({ teacher: teacherId }).sort({
      date: -1,
    });

    res.status(200).json(
      new ApiResponse({
        success: true,
        message: "Notifications récupérées avec succès",
        data: notifications,
      })
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications :", error);
    res.status(500).json(
      new ApiResponse({
        success: false,
        message: "Erreur lors de la récupération des notifications",
      })
    );
  }
});

router.put("/:notificationId/markAsRead", async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json(
        new ApiResponse({
          success: false,
          message: "Notification non trouvée",
        })
      );
    }

    notification.status = "read";
    await notification.save();

    res.status(200).json(
      new ApiResponse({
        success: true,
        message: "Notification marquée comme lue",
        data: notification,
      })
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la notification :", error);
    res.status(500).json(
      new ApiResponse({
        success: false,
        message: "Erreur lors de la mise à jour de la notification",
      })
    );
  }
});

module.exports = router;
