const express = require("express");
const router = express.Router();

const classes = [
  { id: 1, name: "Mathématiques", professor: "Prof. Dupont", schedule: "Lundi 10h" },
  { id: 2, name: "Histoire", professor: "Prof. Martin", schedule: "Mardi 14h" }
];

router.get("/", (req, res) => {
  res.json(classes);
});

router.post("/", (req, res) => {
  const newClass = {
    id: classes.length + 1,
    name: req.body.name,
    professor: req.body.professor,
    schedule: req.body.schedule
  };
  classes.push(newClass);
  res.status(201).json(newClass);
});

module.exports = router;
