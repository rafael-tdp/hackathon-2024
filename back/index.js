const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRouter = require("./routes/authRoutes");
const { json, urlencoded } = require("express");
const cors = require("cors");
const GenericRouter = require("./routes/genericRouter");
const User = require("./models/user");
const Class = require("./models/class");
const ClassRoom = require("./models/classRoom");
const Course = require("./models/course");
const Program = require("./models/studyField");
const Subject = require("./models/subject");
const Unavailability = require("./models/unavailability");
const WeekClass = require("./models/weekClass");
const GenericService = require("./services/genericServices");
const GenericController = require("./controllers/genericController");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(json());

// User
const userService = new GenericService(User);
const userController = new GenericController(userService);
const userRouter = new GenericRouter(userController).getRouter();
// Class
const classService = new GenericService(Class);
const classController = new GenericController(classService);
const classRouter = new GenericRouter(classController).getRouter();
// ClassRoom
const classRoomService = new GenericService(ClassRoom);
const classRoomController = new GenericController(classRoomService);
const classRoomRouter = new GenericRouter(classRoomController).getRouter();
// Course
const courseService = new GenericService(Course);
const courseController = new GenericController(courseService);
const courseRouter = new GenericRouter(courseController).getRouter();
// Program
const programService = new GenericService(Program);
const programController = new GenericController(programService);
const programRouter = new GenericRouter(programController).getRouter();
// Subject
const subjectService = new GenericService(Subject);
const subjectController = new GenericController(subjectService);
const subjectRouter = new GenericRouter(subjectController).getRouter();
// Unavailability
const unavailabilityService = new GenericService(Unavailability);
const unavailabilityController = new GenericController(unavailabilityService);
const unavailabilityRouter = new GenericRouter(unavailabilityController).getRouter();
// WeekClass
const weekClassService = new GenericService(WeekClass);
const weekClassController = new GenericController(weekClassService);
const weekClassRouter = new GenericRouter(weekClassController).getRouter();

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/classes", classRouter);
app.use("/api/classrooms", classRoomRouter);
app.use("/api/courses", courseRouter);
app.use("/api/programs", programRouter);
app.use("/api/subjects", subjectRouter);
app.use("/api/unavailabilities", unavailabilityRouter);
app.use("/api/weekclasses", weekClassRouter);

mongoose
    .connect(process.env.MONGO_URI, {})
    .then(() => console.log("Connexion à MongoDB réussie !"))
    .catch((err) => console.error("Erreur de connexion à MongoDB:", err));

app.get("/", (req, res) => {
    res.send("Bienvenue sur l'API !");
});

app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});