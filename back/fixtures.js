const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/user");
const Class = require("./models/class");
const ClassRoom = require("./models/classRoom");
const Course = require("./models/course");
const Subject = require("./models/subject");
const Unavailability = require("./models/unavailability");
const WeekClass = require("./models/weekClass");

dotenv.config();

const createUsers = async () => {
    const users = [
        { firstname: "John", lastname: "Doe", email: "john.doe@example.com", password: "password123", role: "student" },
        { firstname: "Jane", lastname: "Smith", email: "jane.smith@example.com", password: "password123", role: "teacher" },
        { firstname: "Admin", lastname: "User", email: "admin@example.com", password: "password123", role: "admin" },
    ];
    await User.deleteMany();
    await User.insertMany(users);
    console.log("Users created!");
};

const createClasses = async () => {
    const classes = [
        { name: "Class 1", year: 2024, nbStudents: 27 },
        { name: "Class 2", year: 2024, nbStudents: 15 }
    ];
    await Class.deleteMany();
    await Class.insertMany(classes);
    console.log("Classes created!");
};

const createClassRooms = async () => {
    const classRooms = [
        { name: "Room 101", capacity: 30},
        { name: "Room 102", capacity: 20 },
    ];
    await ClassRoom.deleteMany();
    await ClassRoom.insertMany(classRooms);
    console.log("ClassRooms created!");
};

const createSubjects = async () => {
    const subjects = [
        { name: "Subject 1", requiredHours: 40 },
        { name: "Subject 2", requiredHours: 30 },
    ];
    await Subject.deleteMany();
    await Subject.insertMany(subjects);
    console.log("Subjects created!");
};

const createCourses = async () => {
    const courses = [
        { name: "Course 1", classId: "6758ada6a6b4ce42f741bc8e", teacherId: "6758ada6a6b4ce42f741bc8e", startTime: new Date(), endTime: new Date(), classRoom: "Room 101", subjectId: "6758ada6a6b4ce42f741bc8e"},
        { name: "Course 2", classId: "6758ada6a6b4ce42f741bc8e", teacherId: "6758ada6a6b4ce42f741bc8e", startTime: new Date(), endTime: new Date(), classRoom: "Room 102", subjectId: "6758ada6a6b4ce42f741bc8e"},
    ];
    await Course.deleteMany();
    await Course.insertMany(courses);
    console.log("Courses created!");
};

const createUnavailabilities = async () => {
    const unavailabilities = [
        { startTime: new Date(), endTime: new Date(), teacherId: "6758ada6a6b4ce42f741bc8e" },
        { startTime: new Date(), endTime: new Date(), teacherId: "6758ada6a6b4ce42f741bc8e" },
    ];
    await Unavailability.deleteMany();
    await Unavailability.insertMany(unavailabilities);
    console.log("Unavailabilities created!");
};

const createWeekClasses = async () => {
    const weekClasses = [
        { startTime: new Date(), endTime: new Date(), classId: "6758ada6a6b4ce42f741bc8e", year: 2024, students: 27 },
        { startTime: new Date(), endTime: new Date(), classId: "6758ada6a6b4ce42f741bc8e", year: 2024, students: 15 },
    ];
    await WeekClass.deleteMany();
    await WeekClass.insertMany(weekClasses);
    console.log("WeekClasses created!");
};

const runFixtures = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log("Connected to MongoDB");

        await createUsers();
        await createClasses();
        await createClassRooms();
        await createCourses();
        await createPrograms();
        await createSubjects();
        await createUnavailabilities();
        await createWeekClasses();

        console.log("Fixtures created successfully!");
        await mongoose.disconnect();
    } catch (error) {
        console.error("Error creating fixtures:", error);
        await mongoose.disconnect();
    }
};

runFixtures();