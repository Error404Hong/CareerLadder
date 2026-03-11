const express = require("express");
const router = express.Router();
const {
    addNewUser,
    getUser,
    modifyUser,
    getStudentProfile,
    modifyProfileSummary,
    getStudentEducation,
    addNewEducation,
    deleteEducation,
    editEducation,
} = require("../controllers/usersController");

router.post("/addNewUser", addNewUser);
router.get("/getUser/:clerkid", getUser);
router.get("/getProfile/:clerkid", getStudentProfile);
router.put("/modifyUser/:clerkid", modifyUser);
router.put("/modifyProfileSummary/:clerkid", modifyProfileSummary);
router.get("/getEducation/:clerkid", getStudentEducation);
router.post("/addEducation/:clerkid", addNewEducation);
router.delete("/deleteEducation/:id", deleteEducation);
router.put("/editEducation/:id", editEducation);

module.exports = router;
