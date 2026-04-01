const Tasks = require("../models/tasks");
const sendResponse = require("../utils/responseHelper");
const logger = require("../utils/logger");

const getTasksByProject = async (req, res) => {
    const { projectid } = req.params;
    if (!projectid) return sendResponse(res, 400, "Project ID is required");

    try {
        const result = await Tasks.getTasksByProject(projectid);
        return sendResponse(res, 200, "Tasks fetched successfully", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to fetch tasks: ", error.message);
        return sendResponse(res, 500, "Failed to fetch tasks", { error: error.message });
    }
};

const createTask = async (req, res) => {
    const { project_id, assigned_to, title, description, board_column, priority, due_date, position } = req.body;

    if (!project_id) return sendResponse(res, 400, "Project ID is required");
    if (!title) return sendResponse(res, 400, "Title is required");

    try {
        const result = await Tasks.createTask(
            project_id,
            assigned_to ?? null,
            title,
            description ?? null,
            board_column ?? "todo",
            priority ?? "medium",
            due_date ?? null,
            position ?? 0,
        );
        if (!result) return sendResponse(res, 404, "Failed to create task");
        return sendResponse(res, 200, "Task created successfully", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to create task: ", error.message);
        return sendResponse(res, 500, "Failed to create task", { error: error.message });
    }
};

const updateTask = async (req, res) => {
    const { taskid } = req.params;
    const { assigned_to, title, description, board_column, priority, due_date, position } = req.body;

    if (!taskid) return sendResponse(res, 400, "Task ID is required");
    if (!title) return sendResponse(res, 400, "Title is required");

    try {
        const result = await Tasks.updateTask(
            assigned_to ?? null,
            title,
            description ?? null,
            board_column,
            priority,
            due_date ?? null,
            position,
            taskid,
        );
        if (!result) return sendResponse(res, 404, "Task not found");
        return sendResponse(res, 200, "Task updated successfully", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to update task: ", error.message);
        return sendResponse(res, 500, "Failed to update task", { error: error.message });
    }
};

const deleteTask = async (req, res) => {
    const { taskid } = req.params;
    if (!taskid) return sendResponse(res, 400, "Task ID is required");

    try {
        await Tasks.deleteTask(taskid);
        return sendResponse(res, 200, "Task deleted successfully");
    } catch (error) {
        logger.error("[CONTROLLER] Failed to delete task: ", error.message);
        return sendResponse(res, 500, "Failed to delete task", { error: error.message });
    }
};

const moveTask = async (req, res) => {
    const { taskid } = req.params;
    const { board_column, position } = req.body;

    if (!taskid) return sendResponse(res, 400, "Task ID is required");
    if (!board_column) return sendResponse(res, 400, "board_column is required");
    if (position === undefined) return sendResponse(res, 400, "Position is required");

    try {
        const result = await Tasks.moveTask(board_column, position, taskid);
        if (!result) return sendResponse(res, 404, "Task not found");
        return sendResponse(res, 200, "Task moved successfully", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to move task: ", error.message);
        return sendResponse(res, 500, "Failed to move task", { error: error.message });
    }
};

const reorderTasks = async (req, res) => {
    const { tasks } = req.body;

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0)
        return sendResponse(res, 400, "Tasks array is required");

    try {
        await Tasks.reorderTasks(tasks);
        return sendResponse(res, 200, "Tasks reordered successfully");
    } catch (error) {
        logger.error("[CONTROLLER] Failed to reorder tasks: ", error.message);
        return sendResponse(res, 500, "Failed to reorder tasks", { error: error.message });
    }
};

module.exports = {
    getTasksByProject,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderTasks,
};
