const SchoolClass = require("../models/schoolClass");
const Subject = require("../models/subject");
const Course = require("../models/course");
const User = require("../models/user");

const getStats = async () => {
	const schoolClasses = await SchoolClass.find().populate("graduating");

	const levelCounts = schoolClasses.reduce((acc, schoolClass) => {
		const level = schoolClass.graduating?.level;
		if (level) {
			acc[level] = (acc[level] || 0) + schoolClass.nbStudents;
		}
		return acc;
	}, {});

	const studentsByLevel = Object.entries(levelCounts).map(
		([level, count]) => ({
			level,
			count,
		})
	);

	const fieldCounts = schoolClasses.reduce((acc, schoolClass) => {
		const field = schoolClass.graduating?.studyField;
		if (field) {
			acc[field] = (acc[field] || 0) + schoolClass.nbStudents;
		}
		return acc;
	}, {});

	const studentsByField = Object.entries(fieldCounts).map(
		([field, count]) => ({
			field,
			count,
		})
	);

	const coursesStatus = await Course.aggregate([
		{
			$group: {
				_id: "$status",
				count: { $sum: 1 },
			},
		},
	]);

	const totalSubjects = await Subject.countDocuments();
	const totalCourses = await Course.countDocuments();
	const totalTeachers = await User.countDocuments({ role: "teacher" });
	const totalStudents = await User.countDocuments({ role: "student" });

	return {
		studentsByLevel,
		studentsByField,
		coursesStatus,
		totalSubjects,
		totalCourses,
		totalTeachers,
		totalStudents,
	};
};

module.exports = { getStats };
