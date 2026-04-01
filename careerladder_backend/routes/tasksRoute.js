const express = require("express");
const router = express.Router();
const {
    getTasksByProject,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderTasks,
} = require("../controllers/tasksController");

router.get("/getTasksByProject/:projectid", getTasksByProject);
router.post("/createTask", createTask);
router.put("/updateTask/:taskid", updateTask);
router.delete("/deleteTask/:taskid", deleteTask);
router.put("/moveTask/:taskid", moveTask);
router.put("/reorderTasks", reorderTasks);

module.exports = router;
