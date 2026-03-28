const express = require("express");
const router = express.Router();
const {
    getAllTrainingPrograms,
    registerTraining,
    getTrainingRegByUser,
    getCompanyTrainingPrograms,
    createNewProgram,
    getProgramById,
    updateProgramById,
    deleteProgramById,
    getProgramRegistration,
} = require("../controllers/trainingController");

router.get("/getAllTraining", getAllTrainingPrograms);
router.post("/register", registerTraining);
router.get("/getTrainingReg/:clerkid", getTrainingRegByUser);
router.get("/getCompanyTrainings/:companyid", getCompanyTrainingPrograms);
router.post("/createProgram", createNewProgram);
router.get("/getProgramById/:programid", getProgramById);
router.put("/updateProgramById/:programid", updateProgramById);
router.delete("/deleteProgram/:programid", deleteProgramById);
router.get("/getProgramRegistration/:programid", getProgramRegistration);

module.exports = router;
