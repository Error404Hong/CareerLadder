const express = require("express");
const router = express.Router();
const {
    createNotification,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} = require("../controllers/notificationsController");

router.post("/createNotification", createNotification);
router.get("/getNotifications/:recipient_id", getNotifications);
router.get("/getUnreadCount/:recipient_id", getUnreadCount);
router.put("/markAsRead/:id", markAsRead);
router.put("/markAllAsRead", markAllAsRead);

module.exports = router;
