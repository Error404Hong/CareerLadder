import axiosInstance from "./config";

export const createNotification = async (
    recipient_id: string,
    type: string,
    title: string,
    message: string,
    reference_type: string,
    reference_id: string,
) => {
    try {
        const response = await axiosInstance.post(
            "/notifications/createNotification",
            { recipient_id, type, title, message, reference_type, reference_id },
        );
        return response.data;
    } catch (error) {
        console.log("error creating notification: ", error);
        throw error;
    }
};

export const getNotifications = async (recipient_id: string) => {
    try {
        const response = await axiosInstance.get(`/notifications/getNotifications/${recipient_id}`);
        return response.data;
    } catch (error) {
        console.log("error fetching notifications: ", error);
        throw error;
    }
};

export const getUnreadCount = async (recipient_id: string) => {
    try {
        const response = await axiosInstance.get(`/notifications/getUnreadCount/${recipient_id}`);
        return response.data;
    } catch (error) {
        console.log("error fetching unread count: ", error);
        throw error;
    }
};

export const markAsRead = async (id: number, recipient_id: string) => {
    try {
        const response = await axiosInstance.put(`/notifications/markAsRead/${id}`, { recipient_id });
        return response.data;
    } catch (error) {
        console.log("error marking notification as read: ", error);
        throw error;
    }
};

export const markAllAsRead = async (recipient_id: string) => {
    try {
        const response = await axiosInstance.put("/notifications/markAllAsRead", { recipient_id });
        return response.data;
    } catch (error) {
        console.log("error marking all as read: ", error);
        throw error;
    }
};
