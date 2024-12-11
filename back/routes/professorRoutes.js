const express = require("express");
const router = express.Router();

const professors = [
  { id: 1, name: "Prof. Dupont", subject: "Mathématiques" },
  { id: 2, name: "Prof. Martin", subject: "Histoire" }
];

router.get("/", (req, res) => {
  res.json(professors);
});

module.exports = router;
