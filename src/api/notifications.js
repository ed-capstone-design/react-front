import axios from 'axios';

// 서버 응답을 프론트 표준 모델로 매핑
const mapToNotification = (n) => ({
  id: n.notificationId,
  message: n.message,
  type: n.notificationType,
  url: n.relatedUrl,
  createdAt: new Date(n.createdAt),
  dispatchId: n.dispatchId ?? null,
  vehicleNumber: n.vehicleNumber ?? null,
  driverName: n.driverName ?? null,
  isRead: !!n.isRead,
});

export async function getMyNotifications(token) {
  const res = await axios.get('/api/notifications/me', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  const list = res.data?.data ?? [];
  return list.map(mapToNotification).sort((a, b) => b.createdAt - a.createdAt);
}

export async function markAsRead(notificationId, token) {
  await axios.patch(`/api/notifications/${notificationId}/read`, null, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}
