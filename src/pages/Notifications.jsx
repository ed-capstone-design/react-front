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
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">알림 및 경고 집계</h2>
        <IoStatsChartOutline className="text-blue-500 text-3xl" />
      </div>

      {/* 통계 대시보드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <IoAlert className="text-red-500 text-2xl" />
            <span className="text-red-600 font-bold text-2xl">{stats.urgent}</span>
          </div>
          <div className="text-red-700 font-medium">긴급 알림</div>
          <div className="text-red-600 text-sm">즉시 조치 필요</div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <IoWarning className="text-orange-500 text-2xl" />
            <span className="text-orange-600 font-bold text-2xl">{stats.warnings}</span>
          </div>
          <div className="text-orange-700 font-medium">경고</div>
          <div className="text-orange-600 text-sm">확인 권장</div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <IoInformationCircle className="text-blue-500 text-2xl" />
            <span className="text-blue-600 font-bold text-2xl">{stats.unread}</span>
          </div>
          <div className="text-blue-700 font-medium">미확인</div>
          <div className="text-blue-600 text-sm">읽지 않은 알림</div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <IoTrendingUpOutline className="text-green-500 text-2xl" />
            <span className="text-green-600 font-bold text-2xl">{stats.total}</span>
          </div>
          <div className="text-green-700 font-medium">전체</div>
          <div className="text-green-600 text-sm">총 알림 수</div>
        </div>
      </div>

      {/* 카테고리별 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <IoPersonOutline className="text-blue-500" />
            운전자 관련 알림
          </h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.driverRelated}</div>
          <div className="text-gray-600">전체 알림 중 {((stats.driverRelated / stats.total) * 100).toFixed(1)}%</div>
        </div>

        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <IoCarOutline className="text-green-500" />
            차량 관련 알림
          </h3>
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.busRelated}</div>
          <div className="text-gray-600">전체 알림 중 {((stats.busRelated / stats.total) * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* 기간별 알림 조회 */}
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <IoCalendarOutline className="text-blue-500" />
            기간별 알림 조회
          </h3>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="today">오늘</option>
            <option value="week">최근 7일</option>
            <option value="month">이번 달</option>
            <option value="all">전체</option>
          </select>
        </div>

        <div className="space-y-4">
          {periodNotifications.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              <IoInformationCircle className="text-4xl mx-auto mb-2 opacity-50" />
              <div>해당 기간에 알림이 없습니다.</div>
            </div>
          ) : (
            periodNotifications
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map(notification => (
                <div key={notification.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(notification.type)}
                      <div>
                        <div className="font-semibold text-gray-900">{notification.title}</div>
                        <div className="text-sm text-gray-600">{notification.message}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(notification.priority)}
                      {!notification.read && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">새로움</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <IoTimeOutline />
                        {formatDateTime(notification.timestamp)}
                      </div>
                      {notification.driverId && (
                        <div className="flex items-center gap-1">
                          <IoPersonOutline />
                          운전자 관련
                        </div>
                      )}
                      {notification.busId && (
                        <div className="flex items-center gap-1">
                          <IoCarOutline />
                          차량 {notification.busId}번
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          읽음 처리
                        </button>
                      )}
                      {notification.action && (
                        <button className="text-green-600 hover:text-green-700 font-medium">
                          조치하기
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;