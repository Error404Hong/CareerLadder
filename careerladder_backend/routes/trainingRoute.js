const express = require("express");
const router = express.Router();
const {
    getAllTrainingPrograms,
    registerTraining,
} = require("../controllers/trainingController");

router.get("/getAllTraining", getAllTrainingPrograms);
router.post("/register", registerTraining);

module.exports = router;
