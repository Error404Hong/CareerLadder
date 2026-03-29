const Notifications = require("../models/notifications");
const sendResponse = require("../utils/responseHelper");
const logger = require("../utils/logger");

const createNotification = async (req, res) => {
    const { recipient_id, type, title, message, reference_type, reference_id } =
        req.body;

    try {
        const result = await Notifications.createNotification(
            recipient_id,
            type,
            title,
            message,
            reference_type,
            reference_id,
        );
        return sendResponse(res, 200, "Notifications created", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to create notifications");
        return sendResponse(res, 500, "Failed to create notifications", {
            error: error.message,
        });
    }
};

const getNotifications = async (req, res) => {
    const { recipient_id } = req.params;
    if (!recipient_id)
        return sendResponse(res, 400, "Recipient ID is required");

    try {
        const result = await Notifications.getNotifications(recipient_id);
        return sendResponse(
            res,
            200,
            "Notifications fetched successfully",
            result,
        );
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to fetch notifications: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to fetch notifications", {
            error: error.message,
        });
    }
};

const getUnreadCount = async (req, res) => {
    const { recipient_id } = req.params;
    if (!recipient_id)
        return sendResponse(res, 400, "Recipient ID is required");

    try {
        const count = await Notifications.getUnreadCount(recipient_id);
        return sendResponse(res, 200, "Unread count fetched successfully", {
            unread_count: count,
        });
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to fetch unread count: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to fetch unread count", {
            error: error.message,
        });
    }
};

const markAsRead = async (req, res) => {
    const { id } = req.params;
    const { recipient_id } = req.body;
    if (!id || !recipient_id)
        return sendResponse(
            res,
            400,
            "Notification ID and Recipient ID are required",
        );

    try {
        const result = await Notifications.markAsRead(id, recipient_id);
        if (!result) return sendResponse(res, 404, "Notification not found");
        return sendResponse(res, 200, "Notification marked as read", result);
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to mark notification as read: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to mark notification as read", {
            error: error.message,
        });
    }
};

const markAllAsRead = async (req, res) => {
    const { recipient_id } = req.body;
    if (!recipient_id)
        return sendResponse(res, 400, "Recipient ID is required");

    try {
        await Notifications.markAllAsRead(recipient_id);
        return sendResponse(res, 200, "All notifications marked as read");
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to mark all as read: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to mark all as read", {
            error: error.message,
        });
    }
};

module.exports = {
    createNotification,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
};
