import React, { useState } from "react";
import { useNotifications } from "../components/Notification/contexts/NotificationContext";
import { 
  IoAlert, 
  IoWarning, 
  IoInformationCircle, 
  IoCheckmarkCircle,
  IoTrendingUpOutline,
  IoStatsChartOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoPersonOutline,
  IoCarOutline
} from "react-icons/io5";

const Notifications = () => {
  const { 
    notifications, 
    unreadCount, 
    priorityCounts, 
    typeCounts, 
    getFilteredNotifications,
    markAsRead,
    removeNotification 
  } = useNotifications();

  const [selectedPeriod, setSelectedPeriod] = useState("today");

  // 기간별 필터링
  const getNotificationsByPeriod = (period) => {
    const now = new Date();
    let startDate;
    
    switch (period) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return notifications;
    }
    
    return notifications.filter(n => new Date(n.timestamp) >= startDate);
  };

  const periodNotifications = getNotificationsByPeriod(selectedPeriod);

  // 통계 계산
  const stats = {
    total: notifications.length,
    unread: unreadCount,
    urgent: priorityCounts.urgent,
    high: priorityCounts.high,
    errors: typeCounts.error,
    warnings: typeCounts.warning,
    driverRelated: notifications.filter(n => n.driverId).length,
    busRelated: notifications.filter(n => n.busId).length,
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "success": return <IoCheckmarkCircle className="text-green-500" />;
      case "warning": return <IoWarning className="text-yellow-500" />;
      case "error": return <IoAlert className="text-red-500" />;
      default: return <IoInformationCircle className="text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "urgent":
        return <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">긴급</span>;
      case "high":
        return <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">높음</span>;
      case "normal":
        return <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">보통</span>;
      case "low":
        return <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">낮음</span>;
      default:
        return null;
    }
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-8 text-gray-900">알림 및 경고 집계</h2>
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-8 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">금일 발생 알림</h3>
        <ul>
          {todayNotis.length === 0 ? (
            <li className="text-gray-400 py-4">금일 알림이 없습니다.</li>
          ) : (
            todayNotis.map(n => (
              <li key={n.id} className="flex justify-between items-center py-2 border-b last:border-b-0 border-gray-50">
                <span className="text-gray-800">{n.message}</span>
                {/* 삭제 버튼 없음 */}
              </li>
            ))
          )}
        </ul>
      </div>
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">전체 통계</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>전체 알림 수: {notifications.length}건</li>
          <li>미확인 알림: {notifications.filter(n => !n.read).length}건</li>
          <li>경고(Warning) 알림: {notifications.filter(n => n.type === "warning").length}건</li>
        </ul>
      </div>
    </div>
  );
};

export default Notifications;