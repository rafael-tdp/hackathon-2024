const SubjectClass = require("../models/subjectClass");
const SchoolClass = require("../models/schoolClass");
const TeacherSubject = require("../models/teacherSubject");
const Unavailability = require("../models/unavailability");
const Course = require("../models/course");
const ClassRoom = require("../models/classRoom");
const User = require("../models/user");
const Subject = require("../models/subject");
const {Types} = require("mongoose");
const moment = require('moment');

const getSubjectClassesFromClass = async (classId) => {
	if (!classId) throw new Error("classId is required");

	const subjectClasses = await SubjectClass.find({ schoolClass: classId }).populate({
		path: "subject",
		model: "Subject",
	});

	if (!subjectClasses || subjectClasses.length === 0) {
		throw new Error(`No subject classes found for classId: ${classId}`);
	}

	return subjectClasses;
};

/**
 * Récupère les matières qui ont besoin de planning pour une classe donnée
 * @param classId
 * @returns {Promise<*>}
 */
const getSubjectClassesToPlanFromClass = async (classId) => {
	const subjectClasses = await getSubjectClassesFromClass(classId);

	const filteredSubjectClasses = subjectClasses.filter(
		(subjectClass) =>
			subjectClass.subject.requiredHours > subjectClass.plannedHours + subjectClass.completedHours
	);

	if (!filteredSubjectClasses || filteredSubjectClasses.length === 0) {
		throw new Error(
			`No subject classes need planning for classId: ${classId}`
		);
	}

	return filteredSubjectClasses;
};

/**
 *
 * @param classId
 * @returns {Promise<[{ref: string, type: ObjectId}]|[{ref: string, type: ObjectId}]|*>}
 */
const getSubjectsFromClass = async (classId) => {
	if (!classId) throw new Error("classId is required");

	const classToCheck = await SchoolClass.findById(classId).populate({
		path: "graduating",
		model: "Graduating",
		populate: {
			path: "subjects",
			model: "Subject",
		},
	});

	if (!classToCheck) {
		throw new Error(`Class with id ${classId} not found`);
	}

	if (!classToCheck.graduating || !classToCheck.graduating.subjects) {
		throw new Error(`No subjects found for classId: ${classId}`);
	}

	return classToCheck.graduating.subjects;
};

/**
 * Récupère les professeurs qui enseignent les matières données
 * @param subjectsIds
 * @returns {Promise<*>}
 */
const getTeachersFromSubjects = async (subjectsIds) => {
	if (!subjectsIds || subjectsIds.length === 0) {
		throw new Error("subjectsIds array is required and cannot be empty");
	}

	const teachers = await TeacherSubject.find({
		subjects: { $in: subjectsIds.map( id => id.toString())},
	});

	if (!teachers || teachers.length === 0) {
		throw new Error("No teachers found for the given subjects");
	}

	const teachersIds = teachers.map((teacher) => teacher.user);
	return teachersIds.map(id => id.toString());
};

/**
 * Récupère les professeurs qui enseignent les matières d'une classe donnée
 * @param classId
 * @returns {Promise<*>}
 */
const getTeacherFromClass = async (classId) => {
	const subjects = await getSubjectsFromClass(classId);
	const subjectsIds = subjects.map((subject) => subject._id);

	return await getTeachersFromSubjects(subjectsIds);
};

/**
 * Récupère les indisponibilités d'un professeur
 * @param teacherId
 * @returns {Promise<*|*[]>}
 */
const getUnavailabilitiesFromTeacher = async (teacherId) => {
	if (!teacherId) throw new Error("teacherId is required");

	const unavailabilities = await Unavailability.find({ teacher: teacherId });

	if (!unavailabilities || unavailabilities.length === 0)  return [];

	return unavailabilities.map((unavailability) => ({
		startTime: unavailability.startTime,
		endTime: unavailability.endTime,
	}));
};

/**
 * Récupère les indisponibilités de plusieurs professeurs
 * @param teachersIds
 * @returns {Promise<*>}
 */
const getUnavailabilitiesFromTeachers = async (teachersIds) => {
	if (!teachersIds || teachersIds.length === 0) {
		throw new Error("teachersIds array is required and cannot be empty");
	}

	const unavailabilities = await Unavailability.find({
		teacher: { $in: teachersIds },
	});

	return unavailabilities;
};

const getCoursesFromTeachers = async (teachersIds, schoolClassDays) => {
  if (!teachersIds || teachersIds.length === 0) {
    throw new Error("teachersIds array is required and cannot be empty");
  }

  const courses = await Course.find({
    teacher: { $in: teachersIds },
	startTime: { $gte: new Date() },
  });

  const filteredCourses = courses.filter(course => {
    const courseDate = new Date(course.startTime).toDateString();
    return schoolClassDays.some(day => new Date(day).toDateString() === courseDate);
  });

  return filteredCourses;
};

/**
 * Récupère la date de début et de fin d'une semaine
 * @param weekNumber
 * @param year
 * @returns {{startOfWeek: Date, endOfWeek: Date}}
 */
const getStartAndEndOfWeek = (weekNumber, year) => {
    // Helper to calculate the date of the first Thursday of the year
    function getFirstThursday(year) {
        const jan1 = new Date(Date.UTC(year, 0, 1));
        const dayOfWeek = jan1.getUTCDay();
        const offset = (dayOfWeek <= 4 ? 4 - dayOfWeek : 11 - dayOfWeek); // Distance to the first Thursday
        jan1.setUTCDate(jan1.getUTCDate() + offset);
        return jan1;
    }

    // Get the first Monday of the first ISO week
    const firstThursday = getFirstThursday(year);
    const firstMonday = new Date(firstThursday);
    firstMonday.setUTCDate(firstThursday.getUTCDate() - 3); // Go back to the Monday of the same week

    // Calculate the start and end of the requested week
    const startOfWeek = new Date(firstMonday);
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() + (weekNumber - 1) * 7); // Move forward to the desired week

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setUTCDate(endOfWeek.getUTCDate() + 4); // Add 4 days to get Friday

    return {
        startOfWeek: startOfWeek, // Lundi
        endOfWeek: endOfWeek // Vendredi
    };
}


/**
 * Filtre les indisponibilités pour une semaine donnée
 * @param unavailabilities
 * @param startOfWeek
 * @param endOfWeek
 * @returns {*}
 */
const filterUnavailabilitiesByWeek = (
	unavailabilities,
	startOfWeek,
	endOfWeek
) => {
	return unavailabilities.filter(
		(unavailability) =>
			new Date(unavailability.startTime) >= startOfWeek &&
			new Date(unavailability.endTime) <= endOfWeek
	);
};

/**
 * Récupère les indisponibilités d'un professeur pour une semaine donnée
 * @param teacherId
 * @param week
 * @returns {Promise<*>}
 */
const getTeacherUnavailabilitiesForWeek = async (teacherId, week) => {
	const unavailabilities = await getUnavailabilitiesFromTeacher(teacherId);
	const { startOfWeek, endOfWeek } = getStartAndEndOfWeek(week);

	return filterUnavailabilitiesByWeek(
		unavailabilities,
		startOfWeek,
		endOfWeek
	);
};

/**
 * Récupère les indisponibilités d'un professeur pour plusieurs semaines
 * @param teacherId
 * @param weeks
 * @returns {Promise<*>}
 */
const getTeacherUnavailabilitiesForWeeks = async (teacherId, weeks) => {
	if (!Array.isArray(weeks) || weeks.length === 0) {
		throw new Error("weeks must be a non-empty array");
	}

	const unavailabilities = await getUnavailabilitiesFromTeacher(teacherId);
	return weeks.map((week) => {
		const { startOfWeek, endOfWeek } = getStartAndEndOfWeek(week);
		return filterUnavailabilitiesByWeek(
			unavailabilities,
			startOfWeek,
			endOfWeek
		);
	});
};

const getTeachersUnavailabilitiesForWeek = async (teachersIds, week) => {
	const unavailabilities = await getUnavailabilitiesFromTeachers(teachersIds);
	const { startOfWeek, endOfWeek } = getStartAndEndOfWeek(week);

	return filterUnavailabilitiesByWeek(
		unavailabilities,
		startOfWeek,
		endOfWeek
	);
};

/**
 * Récupère les indisponibilités de plusieurs professeurs pour plusieurs semaines
 * @param teachersIds
 * @param weeks
 * @returns {Promise<*>}
 */
const getTeachersUnavailabilitiesForWeeks = async (teachersIds, weeks) => {
	if (!Array.isArray(weeks) || weeks.length === 0) {
		throw new Error("weeks must be a non-empty array");
	}

	const unavailabilities = await getUnavailabilitiesFromTeachers(teachersIds);
	return weeks.map((week) => {
		const { startOfWeek, endOfWeek } = getStartAndEndOfWeek(week);
		return filterUnavailabilitiesByWeek(
			unavailabilities,
			startOfWeek,
			endOfWeek
		);
	});
};

/**
 * Récupère les indisponibilités d'une classe
 * @param classId
 * @returns {Promise<*>}
 */
const getTeachersUnavailabilitiesFromClass = async (classId) => {
	const teachersIds = await getTeacherFromClass(classId);

	const listUnavailabilities =  await getUnavailabilitiesFromTeachers(teachersIds);
	return listUnavailabilities.map(unavailability => ({
		startTime: unavailability.startTime,
		endTime: unavailability.endTime,
		teacher: unavailability.teacher
	}));
};

/**
 * Récupère les indisponibilités des professeurs pour une classe et une semaine donnée
 * @param classId
 * @returns {Promise<*>}
 */
const getTeachersUnavailabilitiesForClassAndWeeks = async (classId) => {
	const teachers = await getTeacherFromClass(classId);
	const teachersIds = teachers.map((teacher) => teacher._id);

	const schoolClass = await SchoolClass.findById(classId);
	const weeks = schoolClass.weeks;

	return await getTeachersUnavailabilitiesForWeeks(teachersIds, weeks);
};

/**
 * Récupère les cours à venir d'un professeur
 * @param teacherId
 * @returns {Promise<*>}
 */
const getTeacherCourses = async (teacherId) => {
	//Récupère tout les cours du professeur après la date actuelle
	return await Course.find({ teacher: teacherId, startTime: { $gte: new Date() } });
};

/**
 * Récupère les cours d'un professeur pour une semaine donnée
 * @param teacherId
 * @param week
 * @returns {Promise<*>}
 */
const getTeacherCoursesForWeek = async (teacherId, week) => {
	const courses = await Course.find({ teacherId });
	const { startOfWeek, endOfWeek } = getStartAndEndOfWeek(week);

	return courses.filter(
		(course) =>
			new Date(course.startTime) >= startOfWeek &&
			new Date(course.endTime) <= endOfWeek
	);
};

/**
 * Récupère les cours d'un professeur pour plusieurs semaines
 * @param teacherId
 * @param weeks
 * @returns {Promise<*>}
 */
const getTeacherCoursesForWeeks = async (teacherId, weeks) => {
	if (!Array.isArray(weeks) || weeks.length === 0) {
		throw new Error("weeks must be a non-empty array");
	}

	const courses = await Course.find({ teacherId });
	return weeks.map((week) => {
		const { startOfWeek, endOfWeek } = getStartAndEndOfWeek(week);
		return courses.filter(
			(course) =>
				new Date(course.startTime) >= startOfWeek &&
				new Date(course.endTime) <= endOfWeek
		);
	});
};

/**
 * Récupère les cours de plusieurs professeurs sur une semaine
 * @param teachersIds
 * @param week
 * @returns {Promise<*>}
 */
const getTeachersCoursesForWeek = async (teachersIds, week) => {
	const courses = await Course.find({ teacherId: { $in: teachersIds } });
	const { startOfWeek, endOfWeek } = getStartAndEndOfWeek(week);

	return courses.filter(
		(course) =>
			new Date(course.startTime) >= startOfWeek &&
			new Date(course.endTime) <= endOfWeek
	);
};

/**
 * Récupère les les cours de plusieurs professeurs sur plusieurs semaines
 * @param teachersIds
 * @param weeks
 * @returns {Promise<*>}
 */
const getTeachersCoursesForWeeks = async (teachersIds, weeks) => {
	if (!Array.isArray(weeks) || weeks.length === 0) {
		throw new Error("weeks must be a non-empty array");
	}

	const courses = await Course.find({ teacherId: { $in: teachersIds } });
	return weeks.map((week) => {
		const { startOfWeek, endOfWeek } = getStartAndEndOfWeek(week);
		return courses.filter(
			(course) =>
				new Date(course.startTime) >= startOfWeek &&
				new Date(course.endTime) <= endOfWeek
		);
	});
};

/**
 * Récupère les indisponibilités des professeur
 * @param teacherId
 * @returns {Promise<*>}
 */
const getTeacherCoursesAndUnavailabilities = async (teacherId) => {
	const courses = await getTeacherCourses(teacherId);
	const unavailabilities = await getUnavailabilitiesFromTeacher(teacherId);

	return { courses, unavailabilities };
};



/**
 * Récupère les cours et les indisponibilités d'un professeur pour une semaine donnée
 * @param teacherId
 * @param week
 * @returns {Promise<{unavailabilities: *, courses: *}>}
 */
const getTeacherCoursesAndUnavailabilitiesForWeek = async (teacherId, week) => {
	const courses = await getTeacherCoursesForWeek(teacherId, week);
	const unavailabilities = await getTeacherUnavailabilitiesForWeek(
		teacherId,
		week
	);

	return { courses, unavailabilities };
};

/**
 * Récupère les salles non disponibles
 * @returns {Promise<*>}
 */
const getRoomUnavailabilities = async () => {
	const courses = await Course.find();
	return courses.map((course) => {
		return {
			roomId: course.roomId,
			startTime: course.startTime,
			endTime: course.endTime,
		};
	});
};

/**
 * Récupère les salles disponibles pour une classe
 * @param classId
 * @returns {Promise<*>}
 */
const getCapacitedRooms = async (classId) => {
	const schoolClass = await SchoolClass.findById(classId);
	const nbStudents = schoolClass.students;
	const rooms = await ClassRoom.find({ capacity: { $gte: nbStudents } });
	return rooms;
};

const getSubjectsByTeacher = async (teacherId) => {
	const result = await TeacherSubject.findOne({user: teacherId}, 'subjects').populate('subjects');
	return result.subjects.map((subject) => ({
		_id: subject._id,
		requiredHours: subject.requiredHours
	}))
}


const getShoolClassBySubject = async (subjectId) => {
	const result = await SubjectClass.find({subject: subjectId}, 'schoolClass').populate('schoolClass');
	return result.map((subjectClass) => ({
		_id: subjectClass.schoolClass._id,
		weekClasses: subjectClass.schoolClass.weekClasses
	}))
}

const getTheoreticalScheduleByTeacher = async (teacherId) => {
	// Récupère les matières enseignées par le professeur (heures requis)
	const listOfSubjects = await getSubjectsByTeacher(teacherId);
	// Récupère les indisponibilités du professeur
	const listOfUnavaibilities = await getUnavailabilitiesFromTeacher(teacherId);
	// Récupère les classes de l'école (semaine de cours)
	const listOfSchoolClasses = [];
	for (const subject of listOfSubjects) {
		const schoolClasses = await getShoolClassBySubject(subject._id);
		schoolClasses.forEach((schoolClass) => {
			// Ajout uniquement si l'objet n'existe pas déjà
			if (!listOfSchoolClasses.some(existingClass => existingClass._id === schoolClass._id)) {
				listOfSchoolClasses.push(schoolClass);
			}
		});
	}
	//Récupère les cours planifiés par le professeur (après la date actuelle)
	const listOfCourses = await getTeacherCourses(teacherId);

	return {
		teacherId,
		subjectClass: listOfSubjects,
		schoolWeekClass: listOfSchoolClasses,
		plannedCourses: listOfCourses,
		unavailabilityHours: listOfUnavaibilities
	};
};

const getSubjectClassesAndTeachersFromClass = async (classId) => {
	if (!classId) throw new Error("classId is required");

	// Step 1: Retrieve all subjectClasses associated with the given schoolClass
	const subjectClasses = await SubjectClass.find({ schoolClass: classId }).populate('subject');

	if (!subjectClasses || subjectClasses.length === 0) {
		throw new Error(`No subject classes found for classId: ${classId}`);
	}

	// Step 2: For each subjectClass, retrieve the associated subject and teachers
	const result = await Promise.all(subjectClasses.map(async (subjectClass) => {
		const subject = subjectClass.subject;
		const teachers = await TeacherSubject.find({ subjects: subject._id }).populate('user');

		return {
			subject: subject.name,
			hoursToPlan: subject.requiredHours - (subjectClass.plannedHours +  subjectClass.completedHours),
			teachers: teachers.map(teacher => teacher.user._id.toString())
		};
	}));

	return result;
};

const getTheoreticalScheduleBySchoolClass = async (classId) => {
	//Récupère les matières de la classe et les professeurs qui les enseignent
	const listOfSubjectsToPlan = await getSubjectClassesAndTeachersFromClass(classId);
	//Récupère la liste des professeurs de la classe
	const listOfTeachers = await getTeacherFromClass(classId);
	//Récupère les semaines de cours de la classe
	const listOfSchoolClassesWeeks = await SchoolClass.findById(classId, 'weekClasses').populate('weekClasses');
	//Récupère les jours de cours de la classe
	const listOfSchoolClassesDays = getDaysFromWeeks(listOfSchoolClassesWeeks.weekClasses).filter(day => day >= moment().toISOString());
	//Récupère les indisponibilités des professeurs
	const listOfUnavailabilities = (await getTeachersUnavailabilitiesFromClass(classId)).filter(unavailability => {
		const now = new Date();
		return new Date(unavailability.endTime) >= now && listOfSchoolClassesDays.some(day => new Date(day).toDateString() === new Date(unavailability.startTime).toDateString());
	});
	//Récupère la liste des cours à venir
	const listOfPlannedCourses = await getCoursesFromTeachers(listOfTeachers, listOfSchoolClassesDays);

	return {
		classId,
		listOfSubjectsToPlan,
		listOfSchoolClassesDays,
		listOfPlannedCourses,
		listOfUnavailabilities
	};

}

const getDaysFromWeeks = (weeks) => {
    const days = [];

    weeks.forEach(week => {
        const year = week > 35 ? 2024 : 2025;
        const startOfWeek = moment().year(year).week(week).startOf('isoWeek');

		if (year === 2024) {
            startOfWeek.add(1, 'weeks');
        }

        for (let i = 0; i < 5; i++) {
            days.push(startOfWeek.clone().add(i, 'days').toString());
        }
    });

    return days;
}

const ConvertToCourse = async (jsonCourses) => {
	try {
		const courses = await Promise.all(
			jsonCourses.potentialWorkHours.map(async (workHour) => {
				const classRoom = await ClassRoom.findById(workHour.classRoom);
				const schoolClass = await SchoolClass.findById(workHour.schoolClass);
				const teacher = await User.findById(workHour.teacher);
				let subject;
                if (Types.ObjectId.isValid(workHour.subject)) {
                    subject = await Subject.findById(workHour.subject);
                } else {
                    subject = await Subject.findOne({ name: workHour.subject });
                }

				return new Course({
					_id: new Types.ObjectId(),
					startTime: workHour.startTime,
					endTime: workHour.endTime,
					classRoom,
					schoolClass,
					teacher,
					subject,
					status: workHour.status,
				});
			})
		);

		return courses;
	} catch (error) {
		throw new Error(`Error converting to Course: ${error.message}`);
	}
};

const ExcludeExistingCourses = async (courses) => {
	const existingCourses = [];
	for (const course of courses) {
		const existingCourse = await Course.findOne({
			$or: [
				{ teacher: course.teacher._id },
				{ schoolClass: course.schoolClass._id },
			],
			$and: [
				{ startTime: { $lt: course.endTime } },
				{ endTime: { $gt: course.startTime } }
			]
		}).populate("teacher").populate("schoolClass");

		if (existingCourse) {
			console.log(`Le cours de ${course.subject.name} pour la classe ${course.schoolClass.name} et le professeur ${course.teacher.firstname} ${course.teacher.lastname} chevauche le cours existant du ${existingCourse.startTime.toLocaleString()} au ${existingCourse.endTime.toLocaleString()} de la classe ${existingCourse.schoolClass.name} et du professeur ${existingCourse.teacher.lastname} ${existingCourse.teacher.firstName}`);
			existingCourses.push(course);
		}
	}

	// Retirer les cours existants
	return courses.filter(course => !existingCourses.includes(course));
}

module.exports = {
	ConvertToCourse,
	getTheoreticalScheduleBySchoolClass,
	getTheoreticalScheduleByTeacher,
	ExcludeExistingCourses,
	getSubjectClassesFromClass,
	getSubjectClassesToPlanFromClass,
	getSubjectsFromClass,
	getTeacherFromClass,
	getUnavailabilitiesFromTeacher,
	getUnavailabilitiesFromTeachers,
	getStartAndEndOfWeek,
	getTeacherUnavailabilitiesForWeek,
	getTeacherUnavailabilitiesForWeeks,
	getTeachersUnavailabilitiesForWeek,
	getTeachersUnavailabilitiesForWeeks,
	getTeachersUnavailabilitiesFromClass,
	getTeachersUnavailabilitiesForClassAndWeeks,
};
