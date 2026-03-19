const express = require("express");
const router = express.Router();
const {
    getAllTrainingPrograms,
    registerTraining,
    getTrainingRegByUser,
} = require("../controllers/trainingController");

router.get("/getAllTraining", getAllTrainingPrograms);
router.post("/register", registerTraining);
router.get("/getTrainingReg/:clerkid", getTrainingRegByUser);

module.exports = router;
