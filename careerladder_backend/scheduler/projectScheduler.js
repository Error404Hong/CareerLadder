const cron = require("node-cron");
const Projects = require("../models/projects");
const Notifications = require("../models/notifications");
const logger = require("../utils/logger");

const autoCompleteExpiredProjects = async () => {
    logger.info("[SCHEDULER] Running expired project check...");
    try {
        const expiredProjects = await Projects.getExpiredProjects();

        if (expiredProjects.length === 0) {
            logger.info("[SCHEDULER] No expired projects found.");
            return;
        }

        for (const project of expiredProjects) {
            await Projects.updateProjectStatus(project.id, "completed");
            logger.info(`[SCHEDULER] Project ${project.id} marked as completed.`);

            const members = await Projects.getProjectMembers(project.id);

            const notifyIds = [
                project.company_id,
                ...members.map((m) => m.clerk_id),
            ];

            await Promise.all(
                notifyIds.map((recipientId) =>
                    Notifications.createNotification(
                        recipientId,
                        "project_completed",
                        "Project Completed",
                        `The project "${project.title}" has been marked as completed as the end date has passed.`,
                        "project",
                        project.id,
                    ),
                ),
            );
        }

        logger.info(
            `[SCHEDULER] Completed ${expiredProjects.length} expired project(s).`,
        );
    } catch (error) {
        logger.error("[SCHEDULER] Failed to auto-complete projects: ", error);
    }
};

const startProjectScheduler = () => {
    // Run daily at midnight
    cron.schedule("0 0 * * *", autoCompleteExpiredProjects);
    logger.info("[SCHEDULER] Project scheduler started.");
};

module.exports = { startProjectScheduler, autoCompleteExpiredProjects };