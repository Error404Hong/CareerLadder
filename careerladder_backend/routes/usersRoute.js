const express = require("express");
const router = express.Router();
const { addNewUser, getUser } = require("../controllers/usersController");

router.post("/addNewUser", addNewUser);
router.get("/getUser/:clerkid", getUser);

module.exports = router;
