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
    console.log("query", req.query)

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
    // Filtrer les cours qui n'ont pas de subject, teacher, schoolClass, classRoom, start, end ou status
    let filteredCourses = courses.filter(course => course.subject && course.teacher && course.schoolClass && course.classRoom && course.start && course.end && course.status);

    // Vérifier que les cours ne chevauchent pas des cours existants pour le même professeur ou la même classe
    const existingCourses = [];
    for (const course of filteredCourses) {
      const existingCourse = await Course.findOne({
        $or: [
          { teacher: course.teacher._id },
          { schoolClass: course.schoolClass._id },
        ],
        $and: [
          { startTime: { $lt: course.end } }, // Existing course starts before the new course ends
          { endTime: { $gt: course.start } } // Existing course ends after the new course starts
        ]
      }).populate("teacher").populate("schoolClass");

      if (existingCourse) {
        console.log(`Le cours de ${course.subject.name} pour la classe ${course.schoolClass.name} et le professeur ${course.teacher.firstname} ${course.teacher.lastname} chevauche le cours existant du ${existingCourse.startTime.toLocaleString()} au ${existingCourse.endTime.toLocaleString()} de la classe ${existingCourse.schoolClass.name} et du professeur ${existingCourse.teacher.lastname} ${existingCourse.teacher.firstName}`);
        existingCourses.push(course);
      }
    }

    // Retirer les cours existants
      filteredCourses = filteredCourses.filter(course => !existingCourses.includes(course)).map(course => ({
        subject: course.subject._id,
        teacher: course.teacher._id,
        schoolClass: course.schoolClass._id,
        classRoom: course.classRoom._id,
        startTime: course.start,
        endTime: course.end,
        status: course.status
      }));

    // Enregistrer les cours
    const createdCourses = await Course.insertMany(filteredCourses);

    res.json(
      new ApiResponse({
        success: true,
        data: createdCourses,
        message: `${createdCourses.length}/${courses.length} ont été enregistrés`,
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
