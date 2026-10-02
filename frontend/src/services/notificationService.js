import api from "../api/axios";

/*
----------------------------------
GET ALL NOTIFICATIONS
----------------------------------
*/

export const getNotifications = async () => {
  try {
    const response = await api.get("/notifications");

    return response.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch notifications:", error);

    return [];
  }
};

/*
----------------------------------
GET UNREAD COUNT
----------------------------------
*/

export const getUnreadCount = async () => {
  try {
    const response = await api.get("/notifications/unread-count");

    // Backend returns:
    // {
    //   status:"success",
    //   data:5
    // }

    return Number(response.data?.data || 0);
  } catch (error) {
    console.error("Failed to fetch unread count:", error);

    return 0;
  }
};

/*
----------------------------------
MARK SINGLE NOTIFICATION READ
----------------------------------
*/

export const markNotificationRead = async (id) => {
  try {
    const response = await api.put(`/notifications/${id}/read`);

    return response.data?.data || {};
  } catch (error) {
    console.error("Failed to mark notification read:", error);

    return {};
  }
};

/*
----------------------------------
MARK ALL NOTIFICATIONS READ
----------------------------------
*/

export const markAllNotificationsRead = async () => {
  try {
    const response = await api.put("/notifications/read-all");

    return response.data?.data || false;
  } catch (error) {
    console.error("Failed to mark all notifications read:", error);

    return false;
  }
};
