import React from "react";
import { useNotifications } from "../Notification/contexts/NotificationContext";
import { 
  IoAlert, 
  IoWarning, 
  IoInformationCircle, 
  IoCheckmarkCircle,
  IoTrendingUpOutline,
  IoCarOutline,
  IoPersonOutline,
  IoTimeOutline
} from "react-icons/io5";

const AlertSummaryWidget = () => {
  const { unreadCount, priorityCounts, typeCounts, notifications } = useNotifications();

  // 최근 24시간 내 알림 수
  const recentAlerts = notifications.filter(n => {
    const diff = new Date() - new Date(n.timestamp);
    return diff < 24 * 60 * 60 * 1000; // 24시간
  }).length;

  // 긴급 알림 수
  const urgentAlerts = priorityCounts.urgent + priorityCounts.high;

  // 운전자 관련 알림 수
  const driverAlerts = notifications.filter(n => 
    !n.read && n.driverId
  ).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">알림 현황</h3>
        <IoTrendingUpOutline className="text-blue-500 text-xl" />
      </div>
      
      {/* 메인 통계 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
          <div className="flex items-center gap-2 mb-2">
            <IoAlert className="text-red-500 text-lg" />
            <span className="text-sm font-medium text-red-700">긴급/높음</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{urgentAlerts}</div>
          <div className="text-xs text-red-600">즉시 조치 필요</div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
          <div className="flex items-center gap-2 mb-2">
            <IoWarning className="text-orange-500 text-lg" />
            <span className="text-sm font-medium text-orange-700">경고</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">{typeCounts.warning}</div>
          <div className="text-xs text-orange-600">확인 권장</div>
        </div>
      </div>

      {/* 세부 통계 */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <IoTimeOutline className="text-blue-500" />
            <span className="text-gray-600">24시간</span>
          </div>
          <div className="font-semibold text-blue-600">{recentAlerts}</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <IoPersonOutline className="text-green-500" />
            <span className="text-gray-600">운전자</span>
          </div>
          <div className="font-semibold text-green-600">{driverAlerts}</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <IoInformationCircle className="text-gray-500" />
            <span className="text-gray-600">전체</span>
          </div>
          <div className="font-semibold text-gray-600">{unreadCount}</div>
        </div>
      </div>

      {/* 최근 중요 알림 */}
      {urgentAlerts > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-sm font-medium text-gray-700 mb-2">최근 중요 알림</div>
          {notifications
            .filter(n => !n.read && (n.priority === "urgent" || n.priority === "high"))
            .slice(0, 2)
            .map(notification => (
              <div key={notification.id} className="flex items-center gap-2 py-2 px-3 bg-red-50 rounded text-sm mb-2">
                <IoAlert className="text-red-500 flex-shrink-0" />
                <div className="flex-1 truncate text-red-700">
                  {notification.title}
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
};

export default AlertSummaryWidget;
