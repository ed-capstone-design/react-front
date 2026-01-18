import { apiClient } from "../apiClient";

const NOTIFICATION_URL = "/api/notifications";

export const notificationsService = {
  unread: async () => {
    const response = await apiClient.get(`${NOTIFICATION_URL}/me/unread`);
    return response.data;
  },
  allNotification: async () => {
    console.log("");
    const response = await apiClient.get(`${NOTIFICATION_URL}/me`);
    return response.data;
  },
  read: async (notificationId) => {
    const response = await apiClient.patch(
      `${NOTIFICATION_URL}/${notificationId}/read`
    );
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await apiClient.patch(`${NOTIFICATION_URL}/read-all`);
    return response.data;
  },
};
