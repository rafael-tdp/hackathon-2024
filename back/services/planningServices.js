const SubjectClass = require("../models/subjectClass");
const SchoolClass = require("../models/schoolClass");
const TeacherSubject = require("../models/teacherSubject");
const Unavailability = require("../models/unavailability");
const Course = require("../models/course");

const getSubjectClassesFromClass = async (classId) => {
	if (!classId) throw new Error("classId is required");

	const subjectClasses = await SubjectClass.find({ classId }).populate({
		path: "subject",
		model: "Subject",
	});

	if (!subjectClasses || subjectClasses.length === 0) {
		throw new Error(`No subject classes found for classId: ${classId}`);
	}

	return subjectClasses;
};

const getSubjectClassesToPlanFromClass = async (classId) => {
	const subjectClasses = await getSubjectClassesFromClass(classId);

	const filteredSubjectClasses = subjectClasses.filter(
		(subjectClass) =>
			subjectClass.subject.requiredHours > subjectClass.plannedHours
	);

	if (!filteredSubjectClasses || filteredSubjectClasses.length === 0) {
		throw new Error(
			`No subject classes need planning for classId: ${classId}`
		);
	}

	return filteredSubjectClasses;
};

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

const getTeachersFromSubjects = async (subjectsIds) => {
	if (!subjectsIds || subjectsIds.length === 0) {
		throw new Error("subjectsIds array is required and cannot be empty");
	}

	const teachers = await TeacherSubject.find({
		subjects: { $in: subjectsIds },
	});

	if (!teachers || teachers.length === 0) {
		throw new Error("No teachers found for the given subjects");
	}

	return teachers;
};

const getTeacherFromClass = async (classId) => {
	const subjects = await getSubjectsFromClass(classId);
	const subjectsIds = subjects.map((subject) => subject._id);

	return await getTeachersFromSubjects(subjectsIds);
};

const getUnavailabilitiesFromTeacher = async (teacherId) => {
	if (!teacherId) throw new Error("teacherId is required");

	const unavailabilities = await Unavailability.find({ teacherId });

	if (!unavailabilities || unavailabilities.length === 0) {
		throw new Error(
			`No unavailabilities found for teacherId: ${teacherId}`
		);
	}

	return unavailabilities;
};

const getUnavailabilitiesFromTeachers = async (teachersIds) => {
	if (!teachersIds || teachersIds.length === 0) {
		throw new Error("teachersIds array is required and cannot be empty");
	}

	const unavailabilities = await Unavailability.find({
		teacherId: { $in: teachersIds },
	});

	if (!unavailabilities || unavailabilities.length === 0) {
		throw new Error("No unavailabilities found for the given teachers");
	}

	return unavailabilities;
};

const getStartAndEndOfWeek = (weekNumber, year) => {
	if (!weekNumber || weekNumber < 1 || weekNumber > 52) {
		throw new Error("Invalid week number. Must be between 1 and 52");
	}

	const givenYear = year || new Date().getFullYear();
	const firstDayOfYear = new Date(givenYear, 0, 1);
	const dayOffset = (firstDayOfYear.getDay() + 6) % 7;
	const firstMonday = new Date(firstDayOfYear.getTime());
	firstMonday.setDate(firstDayOfYear.getDate() - dayOffset);

	const startOfWeek = new Date(firstMonday.getTime());
	startOfWeek.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);

	const endOfWeek = new Date(startOfWeek.getTime());
	endOfWeek.setDate(startOfWeek.getDate() + 6);

	return { startOfWeek, endOfWeek };
};

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

const getTeacherUnavailabilitiesForWeek = async (teacherId, week) => {
	const unavailabilities = await getUnavailabilitiesFromTeacher(teacherId);
	const { startOfWeek, endOfWeek } = getStartAndEndOfWeek(week);

	return filterUnavailabilitiesByWeek(
		unavailabilities,
		startOfWeek,
		endOfWeek
	);
};

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

const getTeachersUnavailabilitiesFromClass = async (classId) => {
	const teachers = await getTeacherFromClass(classId);
	const teachersIds = teachers.map((teacher) => teacher._id);

	return await getUnavailabilitiesFromTeachers(teachersIds);
};

const getTeachersUnavailabilitiesForClassAndWeeks = async (classId) => {
	const teachers = await getTeacherFromClass(classId);
	const teachersIds = teachers.map((teacher) => teacher._id);

	const schoolClass = await SchoolClass.findById(classId);
	const weeks = schoolClass.weeks;

	return await getTeachersUnavailabilitiesForWeeks(teachersIds, weeks);
};

const getTeacherCourses = async (teacherId) => {
	return await Course.find({ teacherId });
};

const getTeacherCoursesForWeek = async (teacherId, week) => {
	const courses = await Course.find({ teacherId });
	const { startOfWeek, endOfWeek } = getStartAndEndOfWeek(week);

	return courses.filter(
		(course) =>
			new Date(course.startTime) >= startOfWeek &&
			new Date(course.endTime) <= endOfWeek
	);
};

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

const getTeachersCoursesForWeek = async (teachersIds, week) => {
	const courses = await Course.find({ teacherId: { $in: teachersIds } });
	const { startOfWeek, endOfWeek } = getStartAndEndOfWeek(week);

	return courses.filter(
		(course) =>
			new Date(course.startTime) >= startOfWeek &&
			new Date(course.endTime) <= endOfWeek
	);
};

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

const getTeacherCoursesAndUnavailabilities = async (teacherId) => {
	const courses = await getTeacherCourses(teacherId);
	const unavailabilities = await getUnavailabilitiesFromTeacher(teacherId);

	return { courses, unavailabilities };
};

const getTeacherCoursesAndUnavailabilitiesForWeek = async (teacherId, week) => {
	const courses = await getTeacherCoursesForWeek(teacherId, week);
	const unavailabilities = await getTeacherUnavailabilitiesForWeek(
		teacherId,
		week
	);

	return { courses, unavailabilities };
};

// récupère les indisponibilités des salles
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

// récupère les salles en fonction de la capacité de la salle et du nombre d'élèves
const getCapacitedRooms = async (classId) => {
	const schoolClass = await SchoolClass.findById(classId);
	const nbStudents = schoolClass.students;
	const rooms = await Room.find({ capacity: { $gte: nbStudents } });
	return rooms;
};

module.exports = {
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
