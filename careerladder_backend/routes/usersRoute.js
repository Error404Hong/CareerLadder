const express = require("express");
const router = express.Router();
const { addNewUser } = require("../controllers/usersController");

router.post("/addNewUser", addNewUser);

module.exports = router;
