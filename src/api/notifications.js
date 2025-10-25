import axios from 'axios';
import dayjs from 'dayjs';
import { extractResponseData, extractErrorMessage } from '../utils/responseUtils';

// createdAt 문자열이 마이크로초(6자리) 포함될 수 있으므로 3자리로 잘라 Date 파싱
function safeDate(v) {
  if (!v) return dayjs().toISOString();
  try {
    const s = String(v);
    const truncated = s.replace(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3})(\d+)(Z|[+\-].*)?$/, '$1$3');
    const parsed = dayjs(truncated || s);
    return parsed.isValid() ? parsed.toISOString() : dayjs().toISOString();
  } catch { return dayjs().toISOString(); }
}

// 서버 응답 flatten: 루트 + payload 병합
const mapToNotification = (n) => {
  if (!n) return null;
  const p = n.payload || {};
  return {
    id: n.notificationId,
    message: n.message,
    type: n.notificationType,
    url: n.relatedUrl,
    // normalize to ISO string
    createdAt: safeDate(n.createdAt),
    dispatchId: p.dispatchId ?? null,
    vehicleNumber: p.vehicleNumber ?? null,
    driverName: p.driverName ?? null,
    latitude: p.latitude ?? null,
    longitude: p.longitude ?? null,
    scheduledDepartureTime: p.scheduledDepartureTime ? safeDate(p.scheduledDepartureTime) : null,
    isRead: !!n.isRead,
  };
};

export async function getMyNotifications(token) {
  try {
    const res = await axios.get('/api/notifications/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const list = extractResponseData(res, []);
    return Array.isArray(list)
      ? list.map(mapToNotification).filter(Boolean).sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
      : [];
  } catch (error) {
    console.error('알림 목록 조회 실패:', error);
    const errorMessage = extractErrorMessage(error, '알림 목록을 불러올 수 없습니다.');
    throw new Error(errorMessage);
  }
}

export async function getMyUnreadNotifications(token) {
  try {
    const url = '/api/notifications/me/unread';
    try { console.debug('[api/notifications] getMyUnreadNotifications -> request', { url, tokenPreview: token ? `${token.substring(0,10)}...` : null }); } catch {}
    const res = await axios.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    try { console.debug('[api/notifications] getMyUnreadNotifications -> response', { status: res?.status, dataLength: Array.isArray(res?.data?.data || res?.data) ? (res.data.data || res.data).length : null }); } catch {}
    const list = extractResponseData(res, []);
    return Array.isArray(list)
      ? list.map(mapToNotification).filter(Boolean).sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
      : [];
  } catch (error) {
    console.error('안읽은 알림 목록 조회 실패:', error);
    const errorMessage = extractErrorMessage(error, '안읽은 알림 목록을 불러올 수 없습니다.');
    throw new Error(errorMessage);
  }
}

export async function markAsRead(notificationId, token) {
  try {
    const res = await axios.patch(`/api/notifications/${notificationId}/read`, null, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return extractResponseData(res, { success: true });
  } catch (error) {
    console.error('알림 읽음 처리 실패:', error);
    const errorMessage = extractErrorMessage(error, '알림 읽음 처리에 실패했습니다.');
    throw new Error(errorMessage);
  }
}
