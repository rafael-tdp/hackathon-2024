const express = require("express");
const router = express.Router();

const rooms = [
  { id: 1, roomNumber: "A101", capacity: 30 },
  { id: 2, roomNumber: "B202", capacity: 40 }
];

router.get("/", (req, res) => {
  res.json(rooms);
});

module.exports = router;
