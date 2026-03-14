const express = require("express");
const router = express.Router();
const { uploadResume } = require("../config/cloudinary");
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
    getStudentExperience,
    addNewExperience,
    deleteExperience,
    editExperience,
    saveResume,
    deleteResume,
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
router.get("/getExperience/:clerkid", getStudentExperience);
router.post("/addExperience/:clerkid", addNewExperience);
router.delete("/deleteExperience/:id", deleteExperience);
router.put("/editExperience/:id", editExperience);
router.put("/saveResume/:clerkid", uploadResume.single("resume"), saveResume);
router.put("/deleteResume/:clerkid", deleteResume);

module.exports = router;
