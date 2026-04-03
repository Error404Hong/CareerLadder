const express = require("express");
const router = express.Router();
const {
    getTasksByProject,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    getStudentTasksByProject,
} = require("../controllers/tasksController");

router.get("/getTasksByProject/:projectid", getTasksByProject);
router.post("/createTask", createTask);
router.put("/updateTask/:taskid", updateTask);
router.delete("/deleteTask/:taskid", deleteTask);
router.put("/moveTask/:taskid", moveTask);
router.get("/getStudentTasks/:clerkid/:projectid", getStudentTasksByProject);

module.exports = router;
