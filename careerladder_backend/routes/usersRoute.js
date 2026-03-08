const express = require("express");
const router = express.Router();
const {
    addNewUser,
    getUser,
    modifyUser,
    getStudentProfile,
} = require("../controllers/usersController");

router.post("/addNewUser", addNewUser);
router.get("/getUser/:clerkid", getUser);
router.get("/getProfile/:clerkid", getStudentProfile);
router.put("/modifyUser/:clerkid", modifyUser);

module.exports = router;
