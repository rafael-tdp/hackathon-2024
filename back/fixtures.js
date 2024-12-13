const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/user");
const SchoolClass = require("./models/schoolClass");
const SubjectClass = require("./models/subjectClass");
const ClassRoom = require("./models/classRoom");
const Course = require("./models/course");
const Subject = require("./models/subject");
const Unavailability = require("./models/unavailability");
const Graduating = require("./models/graduating")
const TeacherSubject = require("./models/teacherSubject")
const StudyFields = require( "./enum/studyFields");
const UserRoles = require( "./enum/userRoles");
const CourseStatus = require( "./enum/courseStatus");
const Levels = require( "./enum/levels");
const { faker} = require('@faker-js/faker');
const { getStartAndEndOfWeek } = require('./services/planningServices')

dotenv.config();

const createSubjects = async (subjects) => {
    await Subject.deleteMany();
    await Subject.insertMany(subjects);
    console.log("Subjects created!");
};

const createClassRooms = async () => {
    await ClassRoom.deleteMany();
    const classRooms = [
        { name: "Room 101", capacity: 30 },
        { name: "Room 102", capacity: 20 },
        { name: "Room 103", capacity: 25 },
        { name: "Room 201", capacity: 35 },
        { name: "Room 202", capacity: 40 },
        { name: "Room 203", capacity: 50 },
    ];
    await ClassRoom.insertMany(classRooms);
    console.log("ClassRooms created!");
};

const createGraduatingClasses = async (subjectsFromTable) => {
    try {
        await Graduating.deleteMany();

        const allSubjects = await Subject.find();
        const graduatingClasses = [];

        Object.values(StudyFields).forEach((studyField) => {
            Levels.forEach((level) => {
                const matchedSubjects = subjectsFromTable.filter(
                    subject =>
                        subject.studyField === studyField && subject.graduating === level
                );
                const subjectIds = matchedSubjects.map(subjectFromTable => {
                    const matchedSubjectInDb = allSubjects.find(
                        dbSubject =>
                            dbSubject.name === subjectFromTable.name &&
                            dbSubject.requiredHours === subjectFromTable.requiredHours
                    );
                    return matchedSubjectInDb ? matchedSubjectInDb._id : null;
                }).filter(id => id);

                graduatingClasses.push({
                    name: `${studyField} ${level}`,
                    subjects: subjectIds,
                    studyField,
                    level,
                });
            });
        });

        await Graduating.insertMany(graduatingClasses);
        console.log("Graduating classes created!");
    } catch (error) {
        console.error("Error creating graduating classes:", error);
    }
};

const createClasses = async () => {
    try {
        await SchoolClass.deleteMany();

        const graduatingList = await Graduating.find();

        const weekClassesMap = {
            IW: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49],
            Security: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50],
            Cloud: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48],
        };

        const schoolClasses = [];

        for (const graduating of graduatingList) {
            const weekClasses = weekClassesMap[graduating.studyField];

            const nbClasses = 2;
            for (let i = 0; i < nbClasses; i++) {
                const schoolClass = {
                    name: `${graduating.studyField} ${graduating.level} - Class ${i + 1}`,
                    nbStudents: Math.floor(Math.random() * 20) + 20,
                    year: new Date().getFullYear(),
                    graduating: graduating._id,
                    weekClasses,
                };
                schoolClasses.push(schoolClass);
            }
        }

        await SchoolClass.insertMany(schoolClasses);
        console.log("School classes created!");
    } catch (error) {
        console.error("Error creating school classes:", error);
    }
};

const createUsers = async () => {
    try {
        await User.deleteMany();
        const schoolClasses = await SchoolClass.find();
        const users = [];

        users.push({
            firstname: faker.person.firstName(),
            lastname: faker.person.lastName(),
            email: "admin@user.com",
            password: "password",
            role: UserRoles.ADMIN,
        });

        for (let i = 0; i < 15; i++) {
            users.push({
                firstname: faker.person.firstName(),
                lastname: faker.person.lastName(),
                email: `teacher${i}@user.com`,
                password: "password",
                role: UserRoles.TEACHER,
            });
        }

        let studentCounter = 0;
        for (const schoolClass of schoolClasses) {
            const nbStudents = faker.number.int({ min: 10, max: 30 })
            for (let i = 0; i < nbStudents; i++) {
                users.push({
                    firstname: faker.person.firstName(),
                    lastname: faker.person.lastName(),
                    email: `student${studentCounter}@user.com`,
                    password: "password",
                    role: UserRoles.STUDENT,
                    schoolClass: schoolClass._id,
                });
                studentCounter++;
            }
        }

        await User.insertMany(users);
        console.log("Users created!");
    } catch (error) {
        console.error("Error creating users:", error);
    }
};

const createTeacherSubjects = async () => {
    try {
        await TeacherSubject.deleteMany();

        const teachers = await User.find({ role: UserRoles.TEACHER });
        const subjects = await Subject.find();

        if (teachers.length < 1 || subjects.length < 1) {
            throw new Error("Il faut des enseignants et des matières dans la base de données.");
        }

        const teacherSubjectMap = {};

        for (const subject of subjects) {
            const numTeachers = Math.floor(Math.random() * 5) + 1;

            const selectedTeachers = [];
            while (selectedTeachers.length < numTeachers) {
                const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];

                if (!selectedTeachers.includes(randomTeacher._id)) {
                    selectedTeachers.push(randomTeacher._id);
                }
            }

            selectedTeachers.forEach(teacherId => {
                if (!teacherSubjectMap[teacherId]) {
                    teacherSubjectMap[teacherId] = new Set();
                }
                teacherSubjectMap[teacherId].add(subject._id);
            });
        }

        const teacherSubjects = Object.keys(teacherSubjectMap).map(teacherId => {
            return {
                user: teacherId,
                subjects: Array.from(teacherSubjectMap[teacherId]),
                graduating: null,
            };
        });

        await TeacherSubject.insertMany(teacherSubjects);
        console.log("Teacher subjects created!");
    } catch (error) {
        console.error("Error creating teacher subjects:", error);
    }
};

const createCourses = async () => {
    try {
        await Course.deleteMany();

        const schoolClasses = await SchoolClass.find().populate("graduating");
        const rooms = await ClassRoom.find();

        if (!rooms.length) {
            throw new Error("Ensure rooms exist in the database.");
        }

        const courses = [];
        const subjectHoursTracker = {};
        const subjectListByClass = {};

        // Générer la liste des matières par classe
        for (const schoolClass of schoolClasses) {
            const promo = await Graduating.findOne({ _id: schoolClass.graduating }).populate("subjects");
            subjectListByClass[schoolClass._id] = promo.subjects;
        }

        const teacherSubjects = await TeacherSubject.find().populate("user subjects");

        const schoolYearStart = new Date("2024-09-02T00:00:00Z");
        const twoMonthsFromNow = new Date();
        twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);

        // Suivi des horaires occupés par chaque enseignant
        const teacherSchedules = {};

        for (const schoolClass of schoolClasses) {
            const classWeeks = schoolClass.weekClasses;
            const availableSubjects = subjectListByClass[schoolClass._id];

            for (const week of classWeeks) {
                for (let day = 1; day <= 5; day++) {
                    const numCourses = Math.floor(Math.random() * 2) + 1; // 1 ou 2 cours par jour

                    for (let i = 0; i < numCourses; i++) {
                        const duration = Math.floor(Math.random() * 4) + 1; // Durée du cours

                        let startHour;
                        do {
                            startHour = Math.floor(Math.random() * 9) + 8; // Horaire de début entre 8h et 16h
                        } while (startHour === 12); // Pas de cours à 12h

                        const startTime = new Date(schoolYearStart);
                        startTime.setUTCDate(startTime.getUTCDate() + (week - 1) * 7 + day - 1);
                        startTime.setUTCHours(startHour, 0, 0, 0);

                        if (startTime > twoMonthsFromNow) continue;

                        const endTime = new Date(startTime);
                        endTime.setUTCHours(startHour + duration);

                        const subject = availableSubjects[Math.floor(Math.random() * availableSubjects.length)];

                        // Trouver un enseignant pour la matière
                        const teacherSubject = teacherSubjects.find(ts =>
                            ts.subjects.some(subjectItem => subjectItem._id.toString() === subject._id.toString())
                        );

                        if (!teacherSubject) {
                            console.warn(`No teacher found for subject: ${subject.name}`);
                            continue;
                        }

                        const teacher = teacherSubject.user._id;

                        // Vérifier si l'enseignant est déjà occupé pendant ce créneau horaire
                        if (teacherSchedules[teacher]) {
                            const isTeacherOccupied = teacherSchedules[teacher].some(occupiedSlot => {
                                return (
                                    (startTime >= occupiedSlot.startTime && startTime < occupiedSlot.endTime) ||
                                    (endTime > occupiedSlot.startTime && endTime <= occupiedSlot.endTime) ||
                                    (startTime <= occupiedSlot.startTime && endTime >= occupiedSlot.endTime)
                                );
                            });

                            if (isTeacherOccupied) {
                                console.warn(`Teacher ${teacher} is already scheduled for a course at this time.`);
                                continue; // Skip if the teacher is already busy
                            }
                        }

                        // Si l'enseignant est libre, ajouter le cours
                        teacherSchedules[teacher] = teacherSchedules[teacher] || [];
                        teacherSchedules[teacher].push({ startTime, endTime });

                        const room = rooms[Math.floor(Math.random() * rooms.length)];

                        courses.push({
                            subject: subject._id,
                            teacher: teacher,
                            startTime,
                            endTime,
                            classRoom: room._id,
                            schoolClass: schoolClass._id,
                            status: startTime < new Date() ? Math.random() < 0.9 ? CourseStatus.ACCEPTED : CourseStatus.CANCELED : CourseStatus.PENDING,
                        });

                        subjectHoursTracker[subject._id] = (subjectHoursTracker[subject._id] || 0) + duration;
                    }
                }
            }
        }

        // Insertion des cours dans la base de données
        await Course.insertMany(courses);
        console.log("Courses created!");
    } catch (error) {
        console.error("Error creating courses:", error);
    }
};


const createClassSubjects = async () => {
    try {
        await SubjectClass.deleteMany();

        const schoolClasses = await SchoolClass.find();
        const subjects = await Subject.find();

        if (!schoolClasses.length || !subjects.length) {
            throw new Error("Ensure school classes and subjects exist in the database.");
        }

        const subjectClassData = [];

        for (const schoolClass of schoolClasses) {
            const promo = await Graduating.findOne({ _id: schoolClass.graduating }).populate("subjects");
            const matiereOfClasse = promo.subjects
            for (const subject of matiereOfClasse) {
                const courses = await Course.find({
                    schoolClass: schoolClass._id,
                    subject: subject._id,
                });

                let plannedHours = 0;
                let completedHours = 0;
                const now = new Date();

                for (const course of courses) {
                    const courseDuration = (course.endTime - course.startTime) / (1000 * 60 * 60);
                    plannedHours += courseDuration;

                    if (course.startTime < now) {
                        completedHours += courseDuration;
                    }
                }

                subjectClassData.push({
                    plannedHours,
                    completedHours,
                    schoolClass: schoolClass._id,
                    subject: subject._id,
                });
            }
        }

        await SubjectClass.insertMany(subjectClassData);
        console.log("SubjectClass records created!");
    } catch (error) {
        console.error("Error creating SubjectClass records:", error);
    }
};

const createUnavailabilities = async () => {
    try {
        await Unavailability.deleteMany();

        const teachers = await User.find({ role: UserRoles.TEACHER });

        if (!teachers.length) {
            throw new Error("Ensure there are teachers in the database.");
        }

        const unavailabilities = [];
        const currentDate = new Date();

        const getWeekRange = (date) => {
            const startOfWeek = new Date(date);
            const day = startOfWeek.getDay(),
                diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
            startOfWeek.setDate(diff);
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            return { startOfWeek, endOfWeek };
        };

        for (const teacher of teachers) {
            const pastUnavailabilityCount = Math.floor(Math.random() * 3) + 1;
            const { startOfWeek: pastStartOfWeek, endOfWeek: pastEndOfWeek } = getWeekRange(new Date(currentDate.setFullYear(currentDate.getFullYear() - 1)));

            for (let i = 0; i < pastUnavailabilityCount; i++) {
                const pastStart = new Date(pastStartOfWeek.getTime() + Math.random() * (pastEndOfWeek.getTime() - pastStartOfWeek.getTime()));
                const pastEnd = new Date(pastStart.getTime() + (Math.floor(Math.random() * 4) + 1) * 60 * 60 * 1000);

                unavailabilities.push({
                    startTime: pastStart,
                    endTime: pastEnd,
                    teacher: teacher._id,
                });
            }

            const futureUnavailabilityCount = Math.floor(Math.random() * 3) + 1;
            const { startOfWeek: futureStartOfWeek, endOfWeek: futureEndOfWeek } = getWeekRange(new Date(currentDate.setFullYear(currentDate.getFullYear() + 1)));

            for (let i = 0; i < futureUnavailabilityCount; i++) {
                const futureStart = new Date(futureStartOfWeek.getTime() + Math.random() * (futureEndOfWeek.getTime() - futureStartOfWeek.getTime()));
                const futureEnd = new Date(futureStart.getTime() + (Math.floor(Math.random() * 4) + 1) * 60 * 60 * 1000);

                unavailabilities.push({
                    startTime: futureStart,
                    endTime: futureEnd,
                    teacher: teacher._id,
                });
            }
        }

        await Unavailability.insertMany(unavailabilities);
        console.log("Unavailabilities created!");
    } catch (error) {
        console.error("Error creating unavailabilities:", error);
    }
};



const runFixtures = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log("Connected to MongoDB");

        const subjects = [
            { name: "HTML", requiredHours: 50, studyField: StudyFields.IW, graduating: "1A" },
            { name: "ReactJs", requiredHours: 50, studyField: StudyFields.IW, graduating: "1A" },
            { name: "Data Analysis", requiredHours: 45, studyField: StudyFields.IW, graduating: "1A" },
            { name: "Statistics", requiredHours: 40, studyField: StudyFields.IW, graduating: "1A" },
            { name: "Docker", requiredHours: 35, studyField: StudyFields.IW, graduating: "2A" },
            { name: "NodeJs", requiredHours: 25, studyField: StudyFields.IW, graduating: "2A" },
            { name: "ReactJs", requiredHours: 40, studyField: StudyFields.IW, graduating: "2A" },
            { name: "CSS", requiredHours: 25, studyField: StudyFields.IW, graduating: "2A" },
            { name: "Machine Learning Basics", requiredHours: 50, studyField: StudyFields.IW, graduating: "2A" },
            { name: "Data Mining", requiredHours: 35, studyField: StudyFields.IW, graduating: "2A" },
            { name: "Big Data Technologies", requiredHours: 40, studyField: StudyFields.IW, graduating: "3A" },
            { name: "Data Visualization", requiredHours: 30, studyField: StudyFields.IW, graduating: "3A" },
            { name: "Docker", requiredHours: 50, studyField: StudyFields.IW, graduating: "3A" },
            { name: "MongoDB", requiredHours: 25, studyField: StudyFields.IW, graduating: "3A" },
            { name: "NodeJs", requiredHours: 35, studyField: StudyFields.IW, graduating: "3A" },
            { name: "Advanced Machine Learning", requiredHours: 50, studyField: StudyFields.IW, graduating: "4A" },
            { name: "Deep Learning", requiredHours: 45, studyField: StudyFields.IW, graduating: "4A" },
            { name: "Docker", requiredHours: 20, studyField: StudyFields.IW, graduating: "4A" },
            { name: "ExpressJs", requiredHours: 15, studyField: StudyFields.IW, graduating: "4A" },
            { name: "Data Engineering", requiredHours: 40, studyField: StudyFields.IW, graduating: "5A" },
            { name: "AI Ethics", requiredHours: 30, studyField: StudyFields.IW, graduating: "5A" },
            { name: "Sécurité avancée", requiredHours: 30, studyField: StudyFields.IW, graduating: "5A" },
            { name: "JavaScript", requiredHours: 40, studyField: StudyFields.IW, graduating: "5A" },

            { name: "Network Security", requiredHours: 40, studyField: StudyFields.Security, graduating: "1A" },
            { name: "Introduction to Cryptography", requiredHours: 30, studyField: StudyFields.Security, graduating: "1A" },
            { name: "Android Development", requiredHours: 50, studyField: StudyFields.Security, graduating: "1A" },
            { name: "iOS Development", requiredHours: 50, studyField: StudyFields.Security, graduating: "1A" },
            { name: "Ethical Hacking Basics", requiredHours: 35, studyField: StudyFields.Security, graduating: "2A" },
            { name: "Advanced Cryptography", requiredHours: 30, studyField: StudyFields.Security, graduating: "2A" },
            { name: "Cross-Platform Development", requiredHours: 40, studyField: StudyFields.Security, graduating: "2A" },
            { name: "Mobile UI/UX Design", requiredHours: 30, studyField: StudyFields.Security, graduating: "2A" },
            { name: "Penetration Testing", requiredHours: 40, studyField: StudyFields.Security, graduating: "3A" },
            { name: "Network Defense", requiredHours: 35, studyField: StudyFields.Security, graduating: "3A" },
            { name: "Flutter Development", requiredHours: 30, studyField: StudyFields.Security, graduating: "3A" },
            { name: "React Native", requiredHours: 35, studyField: StudyFields.Security, graduating: "3A" },
            { name: "Cyber Forensics", requiredHours: 30, studyField: StudyFields.Security, graduating: "4A" },
            { name: "Advanced Ethical Hacking", requiredHours: 35, studyField: StudyFields.Security, graduating: "4A" },
            { name: "Advanced Android", requiredHours: 50, studyField: StudyFields.Security, graduating: "4A" },
            { name: "Advanced iOS", requiredHours: 50, studyField: StudyFields.Security, graduating: "4A" },
            { name: "Mobile Security", requiredHours: 40, studyField: StudyFields.Security, graduating: "5A" },
            { name: "Mobile Performance Optimization", requiredHours: 30, studyField: StudyFields.Security, graduating: "5A" },
            { name: "Security Management", requiredHours: 40, studyField: StudyFields.Security, graduating: "5A" },
            { name: "Incident Response", requiredHours: 30, studyField: StudyFields.Security, graduating: "5A" },

            { name: "AWS Basics", requiredHours: 40, studyField: StudyFields.Cloud, graduating: "1A" },
            { name: "Azure Fundamentals", requiredHours: 40, studyField: StudyFields.Cloud, graduating: "1A" },
            { name: "CI/CD Pipelines", requiredHours: 30, studyField: StudyFields.Cloud, graduating: "1A" },
            { name: "Version Control with Git", requiredHours: 20, studyField: StudyFields.Cloud, graduating: "1A" },
            { name: "Google Cloud Platform", requiredHours: 40, studyField: StudyFields.Cloud, graduating: "2A" },
            { name: "Cloud Security", requiredHours: 35, studyField: StudyFields.Cloud, graduating: "2A" },
            { name: "Containerization with Docker", requiredHours: 35, studyField: StudyFields.Cloud, graduating: "2A" },
            { name: "Infrastructure as Code", requiredHours: 30, studyField: StudyFields.Cloud, graduating: "2A" },
            { name: "Cloud Architecture", requiredHours: 50, studyField: StudyFields.Cloud, graduating: "3A" },
            { name: "Cloud DevOps", requiredHours: 45, studyField: StudyFields.Cloud, graduating: "3A" },
            { name: "Kubernetes Basics", requiredHours: 40, studyField: StudyFields.Cloud, graduating: "3A" },
            { name: "Monitoring and Logging", requiredHours: 35, studyField: StudyFields.Cloud, graduating: "3A" },
            { name: "Advanced Docker", requiredHours: 35, studyField: StudyFields.Cloud, graduating: "4A" },
            { name: "Advanced Kubernetes", requiredHours: 40, studyField: StudyFields.Cloud, graduating: "4A" },
            { name: "Advanced AWS", requiredHours: 40, studyField: StudyFields.Cloud, graduating: "4A" },
            { name: "Advanced Azure", requiredHours: 40, studyField: StudyFields.Cloud, graduating: "4A" },
            { name: "Cloud Automation", requiredHours: 35, studyField: StudyFields.Cloud, graduating: "5A" },
            { name: "Cloud Cost Management", requiredHours: 30, studyField: StudyFields.Cloud, graduating: "5A" },
            { name: "DevOps Security", requiredHours: 30, studyField: StudyFields.Cloud, graduating: "5A" },
            { name: "Site Reliability Engineering", requiredHours: 40, studyField: StudyFields.Cloud, graduating: "5A" },
        ];

        await createSubjects(subjects);
        await createClassRooms();
        await createGraduatingClasses(subjects);
        await createClasses();
        await createUsers();
        await createTeacherSubjects();
        await createCourses();
        await createClassSubjects();
        await createUnavailabilities();

        console.log("Fixtures created successfully!");
        await mongoose.disconnect();
    } catch (error) {
        console.error("Error creating fixtures:", error);
        await mongoose.disconnect();
    }
};

runFixtures();