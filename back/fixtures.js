const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/user");
const SchoolClass = require("./models/schoolClass");
const SubjectClass = require("./models/subjectClass");
const ClassRoom = require("./models/room");
const Course = require("./models/course");
const Subject = require("./models/subject");
const Unavailability = require("./models/unavailability");
const Graduating = require("./models/graduating")
const TeacherSubject = require("./models/teacherSubject")
const StudyFields = require( "./enum/studyFields");
const UserRoles = require( "./enum/userRoles");
const { faker} = require('@faker-js/faker');
const { getStartAndEndOfWeek } = require('./services/planningServices')

dotenv.config();

const createClassRooms = async () => {
    const classRooms = [
        { name: "Room 101", capacity: 30 },
        { name: "Room 102", capacity: 20 },
        { name: "Room 103", capacity: 25 },
        { name: "Room 201", capacity: 35 },
        { name: "Room 202", capacity: 40 },
        { name: "Room 203", capacity: 50 },
    ];
    await ClassRoom.deleteMany();
    await ClassRoom.insertMany(classRooms);
    console.log("ClassRooms created!");
};

const createGraduatingClasses = async (tabSubjects) => {
    const studyFields = Object.keys(StudyFields);
    const subjects = await Subject.find();
    const graduatingClasses = [];

    for (let indexFiliere = 0; indexFiliere < studyFields.length; indexFiliere++) { //Pour chaque filière
        const studyField = studyFields[indexFiliere];
        for(let indexAnnee = 1; indexAnnee <= 5; indexAnnee++) { //Pour chaque année (1 à 5)
            const graduatingSubjects = tabSubjects.filter(subject => subject.studyField === studyField && subject.graduating ===  `${indexAnnee}A`);
            if (graduatingSubjects.length > 0) { //Si la filière a des matières pour cette année
                const graduatingClass = {
                    name: `${indexAnnee}A-${studyField}`,
                    subjects: subjects.filter(subject => graduatingSubjects.find(graduatingSubject => graduatingSubject.name === subject.name && graduatingSubject.requiredHours === subject.requiredHours)),
                    studyField: studyField,
                    level: `${indexAnnee}A`,
                };
                graduatingClasses.push(graduatingClass);
            }
        }
    }

    await Graduating.deleteMany();
    await Graduating.insertMany(graduatingClasses);
    console.log("Graduating classes created!");
};

const createClasses = async () => {
    const graduatingClasses = await Graduating.find();
    const classes = [];

    for (let indexGradiatingClass = 0; indexGradiatingClass < graduatingClasses.length; indexGradiatingClass++) {
        const graduatingClass = graduatingClasses[indexGradiatingClass];
        const nbClasses = faker.number.int({ min: 1, max: 3 });
        for (let indexClasse = 1; indexClasse <= nbClasses; indexClasse++) {
            const className = `${graduatingClass.name}-${indexClasse}`;
            const weekClasses1 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49];
            const weekClasses2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50];
            const weekClasses3 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48];
            const classData = {
                name: className,
                nbStudents: faker.number.int({ min: 15, max: 40 }),
                year: 2024,
                graduatingId: graduatingClass._id,
                weekClasses: faker.helpers.arrayElement([weekClasses1, weekClasses2, weekClasses3])
            };
            classes.push(classData);
        }
    }
    await SchoolClass.deleteMany();
    await SchoolClass.insertMany(classes);
    console.log("SchoolClasses created!");
}

const createUsers = async () => {
    const classes = await SchoolClass.find();

    const users = [
        { firstname: faker.person.firstName(), lastname: faker.person.lastName(), email: faker.internet.email(), password: faker.internet.password(), role: UserRoles.STUDENT, classId: classes[0]._id },
        { firstname: faker.person.firstName(), lastname: faker.person.lastName(), email: faker.internet.email(), password: faker.internet.password(), role: UserRoles.ADMIN },
    ];

    for (let i = 0; i < 7; i++) {
        users.push({ firstname: faker.person.firstName(), lastname: faker.person.lastName(), email: faker.internet.email(), password: "password", role: UserRoles.TEACHER });
    }

    await User.deleteMany();
    await User.insertMany(users);
    console.log("Users created!");
};

const createTeacherSubjects = async () => {
    const teachers = await User.find({ role: "teacher" });
    const subjects = await Subject.find();
    const graduatingClasses = await Graduating.find();

    const teacherSubjects = [];
    for (let i = 0; i < teachers.length; i++) {
        const teacher = teachers[i];
        const graduatingClass = graduatingClasses[i % graduatingClasses.length];
        const teacherSubject = {
            userId: teacher._id,
            subjects: faker.helpers.shuffle(subjects).slice(0, faker.number.int({ min: 1, max: 5 })).map(subject => subject._id),
            graduatingId: graduatingClass._id,
        };
        teacherSubjects.push(teacherSubject);
    }

    await TeacherSubject.deleteMany();
    await TeacherSubject.insertMany(teacherSubjects);
}

const createSubjects = async (subjects) => {
    await Subject.deleteMany();
    await Subject.insertMany(subjects);
    console.log("Subjects created!");
};

const createCourses = async () => {
    const schoolClasses = await SchoolClass.find();
    const teachers = await User.find({ role: "teacher" });
    const classRooms = await ClassRoom.find();
    const subjects = await Subject.find();

    const courses = [];
    for (let i = 0; i < 50; i++) {
        const schoolClass = schoolClasses[i % schoolClasses.length];
        const teacher = teachers[i % teachers.length];
        const classRoom = classRooms[i % classRooms.length];
        const subject = subjects[i % subjects.length];

        const week = faker.helpers.arrayElement(schoolClass.weekClasses);
        const startHour = faker.number.int({ min: 8, max: 15 });
        const endHour = startHour + faker.number.int({ min: 1, max: 4 });
        const startTime = new Date(2024, 11, week, startHour, 0);
        const endTime = new Date(2024, 11, week, endHour, 0);

        const course = {
            subjectId: subject._id,
            teacherId: teacher._id,
            classRoom: classRoom.name,
            classId: schoolClass._id,
            startTime: startTime,
            endTime: endTime,
        };
        courses.push(course);
    }


    await Course.deleteMany();
    await Course.insertMany(courses);
    console.log("Courses created!");
};
const createSubjectClass = async () => {
    const schoolClass = await SchoolClass.find();
    const subjectClasses = [];

    for(let i = 0; i < schoolClass.length; i++){// Pour chaque classe
        const graduating = await Graduating.findOne({ _id: schoolClass[i].graduatingId }).populate("subjects");
        const subjectsOfSchoolClass = graduating.subjects
        for(let j = 0; j < subjectsOfSchoolClass.length; j++){//Pour chaque matière
            const courses = await Course.find({ classId: schoolClass[i]._id, subjectId: subjectsOfSchoolClass[j]._id });
            const courseDuration = courses.reduce((acc, course) => acc + (course.endTime - course.startTime), 0);
            const courseDurationInHours = courseDuration / 3600000;
            const subjectClass = {
                subjectId: subjectsOfSchoolClass[j]._id,
                classId: schoolClass[i]._id,
                completedHours: courseDurationInHours,
                plannedHours: 0,
            }
            subjectClasses.push(subjectClass);
        }
    }

    SubjectClass.deleteMany()
    SubjectClass.insertMany(subjectClasses)
    console.log("SubjectClass created!");
}

const createUnavailabilities = async () => {
    const teachers = await User.find({ role: UserRoles.TEACHER });
    const unavailabilities = [];
    for (const teacher of teachers) {
        const teacherSubjects = await TeacherSubject.find({ userId: teacher._id }).populate("subjects");
        const classes = []
        for(const teacherSubject of teacherSubjects){
            const classe = await SchoolClass.find({ graduatingId: teacherSubject.graduatingId });
            classes.push(classe);
        }
        const weekClasses = classes[0].map(classe => classe.weekClasses).flat()

        const nbIndispo = faker.number.int({ min: 0, max: 5 });
        if(weekClasses.length === 0) continue;
        for (let i = 0; i < nbIndispo; i++) {
            const week = faker.helpers.arrayElement(weekClasses);
            const intervalWeek = getStartAndEndOfWeek(week, 2024);
            const startHour = faker.number.int({ min: 8, max: 15 });
            const endHour = startHour + faker.number.int({ min: 1, max: 4 });
            const date = faker.date.between({
                from: intervalWeek.startOfWeek,
                to: intervalWeek.endOfWeek
            });
            const startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour);
            const endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endHour);
            const unavailability = {
                startTime: startTime,
                endTime: endTime,
                teacherId: teacher._id
            };
            unavailabilities.push(unavailability);
        }
    }

    await Unavailability.deleteMany();
    await Unavailability.insertMany(unavailabilities);
    console.log("Unavailabilities created!");
};


const runFixtures = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log("Connected to MongoDB");

        const subjects = [
            { name: "HTML", requiredHours: 50, studyField: StudyFields.IW, graduating: "1A" },
            { name: "ReactJs", requiredHours: 50, studyField: StudyFields.IW, graduating: "1A" },
            { name: "Docker", requiredHours: 35, studyField: StudyFields.IW, graduating: "2A" },
            { name: "NodeJs", requiredHours: 25, studyField: StudyFields.IW, graduating: "2A" },
            { name: "ReactJs", requiredHours: 40, studyField: StudyFields.IW, graduating: "2A" },
            { name: "CSS", requiredHours: 25, studyField: StudyFields.IW, graduating: "2A" },
            { name: "Docker", requiredHours: 50, studyField: StudyFields.IW, graduating: "3A" },
            { name: "MongoDB", requiredHours: 25, studyField: StudyFields.IW, graduating: "3A" },
            { name: "NodeJs", requiredHours: 35, studyField: StudyFields.IW, graduating: "3A" },
            { name: "Docker", requiredHours: 20, studyField: StudyFields.IW, graduating: "4A" },
            { name: "ExpressJs", requiredHours: 15, studyField: StudyFields.IW, graduating: "4A" },
            { name: "Sécurité avancée", requiredHours: 30, studyField: StudyFields.IW, graduating: "5A" },
            { name: "JavaScript", requiredHours: 40, studyField: StudyFields.IW, graduating: "5A" },

            { name: "Network Security", requiredHours: 40, studyField: StudyFields.Security, graduating: "1A" },
            { name: "Introduction to Cryptography", requiredHours: 30, studyField: StudyFields.Security, graduating: "1A" },
            { name: "Ethical Hacking Basics", requiredHours: 35, studyField: StudyFields.Security, graduating: "2A" },
            { name: "Advanced Cryptography", requiredHours: 30, studyField: StudyFields.Security, graduating: "2A" },
            { name: "Penetration Testing", requiredHours: 40, studyField: StudyFields.Security, graduating: "3A" },
            { name: "Network Defense", requiredHours: 35, studyField: StudyFields.Security, graduating: "3A" },
            { name: "Cyber Forensics", requiredHours: 30, studyField: StudyFields.Security, graduating: "4A" },
            { name: "Advanced Ethical Hacking", requiredHours: 35, studyField: StudyFields.Security, graduating: "4A" },
            { name: "Security Management", requiredHours: 40, studyField: StudyFields.Security, graduating: "5A" },
            { name: "Incident Response", requiredHours: 30, studyField: StudyFields.Security, graduating: "5A" },

            { name: "Data Analysis", requiredHours: 45, studyField: StudyFields.Data, graduating: "1A" },
            { name: "Statistics", requiredHours: 40, studyField: StudyFields.Data, graduating: "1A" },
            { name: "Machine Learning Basics", requiredHours: 50, studyField: StudyFields.Data, graduating: "2A" },
            { name: "Data Mining", requiredHours: 35, studyField: StudyFields.Data, graduating: "2A" },
            { name: "Big Data Technologies", requiredHours: 40, studyField: StudyFields.Data, graduating: "3A" },
            { name: "Data Visualization", requiredHours: 30, studyField: StudyFields.Data, graduating: "3A" },
            { name: "Advanced Machine Learning", requiredHours: 50, studyField: StudyFields.Data, graduating: "4A" },
            { name: "Deep Learning", requiredHours: 45, studyField: StudyFields.Data, graduating: "4A" },
            { name: "Data Engineering", requiredHours: 40, studyField: StudyFields.Data, graduating: "5A" },
            { name: "AI Ethics", requiredHours: 30, studyField: StudyFields.Data, graduating: "5A" },

            { name: "Android Development", requiredHours: 50, studyField: StudyFields.Mobile, graduating: "1A" },
            { name: "iOS Development", requiredHours: 50, studyField: StudyFields.Mobile, graduating: "1A" },
            { name: "Cross-Platform Development", requiredHours: 40, studyField: StudyFields.Mobile, graduating: "2A" },
            { name: "Mobile UI/UX Design", requiredHours: 30, studyField: StudyFields.Mobile, graduating: "2A" },
            { name: "Flutter Development", requiredHours: 30, studyField: StudyFields.Mobile, graduating: "3A" },
            { name: "React Native", requiredHours: 35, studyField: StudyFields.Mobile, graduating: "3A" },
            { name: "Advanced Android", requiredHours: 50, studyField: StudyFields.Mobile, graduating: "4A" },
            { name: "Advanced iOS", requiredHours: 50, studyField: StudyFields.Mobile, graduating: "4A" },
            { name: "Mobile Security", requiredHours: 40, studyField: StudyFields.Mobile, graduating: "5A" },
            { name: "Mobile Performance Optimization", requiredHours: 30, studyField: StudyFields.Mobile, graduating: "5A" },

            { name: "AWS Basics", requiredHours: 40, studyField: StudyFields.Cloud, graduating: "1A" },
            { name: "Azure Fundamentals", requiredHours: 40, studyField: StudyFields.Cloud, graduating: "1A" },
            { name: "Google Cloud Platform", requiredHours: 40, studyField: StudyFields.Cloud, graduating: "2A" },
            { name: "Cloud Security", requiredHours: 35, studyField: StudyFields.Cloud, graduating: "2A" },
            { name: "Cloud Architecture", requiredHours: 50, studyField: StudyFields.Cloud, graduating: "3A" },
            { name: "Cloud DevOps", requiredHours: 45, studyField: StudyFields.Cloud, graduating: "3A" },
            { name: "Advanced AWS", requiredHours: 40, studyField: StudyFields.Cloud, graduating: "4A" },
            { name: "Advanced Azure", requiredHours: 40, studyField: StudyFields.Cloud, graduating: "4A" },
            { name: "Cloud Automation", requiredHours: 35, studyField: StudyFields.Cloud, graduating: "5A" },
            { name: "Cloud Cost Management", requiredHours: 30, studyField: StudyFields.Cloud, graduating: "5A" },

            { name: "CI/CD Pipelines", requiredHours: 30, studyField: StudyFields.DevOps, graduating: "1A" },
            { name: "Version Control with Git", requiredHours: 20, studyField: StudyFields.DevOps, graduating: "1A" },
            { name: "Containerization with Docker", requiredHours: 35, studyField: StudyFields.DevOps, graduating: "2A" },
            { name: "Infrastructure as Code", requiredHours: 30, studyField: StudyFields.DevOps, graduating: "2A" },
            { name: "Kubernetes Basics", requiredHours: 40, studyField: StudyFields.DevOps, graduating: "3A" },
            { name: "Monitoring and Logging", requiredHours: 35, studyField: StudyFields.DevOps, graduating: "3A" },
            { name: "Advanced Docker", requiredHours: 35, studyField: StudyFields.DevOps, graduating: "4A" },
            { name: "Advanced Kubernetes", requiredHours: 40, studyField: StudyFields.DevOps, graduating: "4A" },
            { name: "DevOps Security", requiredHours: 30, studyField: StudyFields.DevOps, graduating: "5A" },
            { name: "Site Reliability Engineering", requiredHours: 40, studyField: StudyFields.DevOps, graduating: "5A" },
        ];

        await createSubjects(subjects);
        await createClassRooms();
        await createGraduatingClasses(subjects);
        await createClasses();
        await createUsers();
        await createCourses();
        await createSubjectClass();
        await createTeacherSubjects();
        await createUnavailabilities();

        console.log("Fixtures created successfully!");
        await mongoose.disconnect();
    } catch (error) {
        console.error("Error creating fixtures:", error);
        await mongoose.disconnect();
    }
};

runFixtures();