import React, { useState, useEffect } from "react";
import { useNotificationCount } from "./NotificationCountProvider";
import axios from "axios";
import { 
  IoAlert, 
  IoWarning, 
  IoInformationCircle, 
  IoTrendingUpOutline,
  IoPersonOutline,
  IoTimeOutline
} from "react-icons/io5";

const AlertSummaryWidget = () => {
  const { unreadCount } = useNotificationCount();
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnreadNotifications();
  }, []);

  const fetchUnreadNotifications = async () => {
    try {
      setLoading(true);
      // 읽지 않은 알림만 가져오기 - Dashboard와 동일한 엔드포인트 사용
      const response = await axios.get('/api/notifications/me/unread');
      setUnreadNotifications(response.data);
    } catch (error) {
      console.error("읽지 않은 알림 로딩 실패:", error);
      setUnreadNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // warningType별 통계 계산 - Dashboard와 동일한 타입 사용
  const warningTypeCounts = {
    Acceleration: unreadNotifications.filter(n => n.warningType === 'Acceleration').length,
    Drowsiness: unreadNotifications.filter(n => n.warningType === 'Drowsiness').length,
    Braking: unreadNotifications.filter(n => n.warningType === 'Braking').length,
    Abnormal: unreadNotifications.filter(n => n.warningType === 'Abnormal').length,
  };

  // 최근 24시간 내 알림 수
  const recentAlerts = unreadNotifications.filter(n => {
    const diff = new Date() - new Date(n.warningtime);
    return diff < 24 * 60 * 60 * 1000;
  }).length;

  // 긴급 알림 수 (Acceleration + Abnormal)
  const urgentAlerts = warningTypeCounts.Acceleration + warningTypeCounts.Abnormal;

  // 운전자 관련 알림 수 (Drowsiness)
  const driverAlerts = warningTypeCounts.Drowsiness;

  // warningType별 아이콘 반환
  const getWarningTypeIcon = (warningType) => {
    switch (warningType) {
      case "Drowsiness": return <IoAlert className="text-red-500" />;
      case "Acceleration": return <IoWarning className="text-orange-500" />;
      case "Braking": return <IoPersonOutline className="text-yellow-500" />;
      case "Abnormal": return <IoInformationCircle className="text-blue-500" />;
      default: return <IoInformationCircle className="text-gray-500" />;
    }
  };

  // warningType별 한글 라벨 반환
  const getWarningTypeLabel = (warningType) => {
    switch (warningType) {
      case "Drowsiness": return "졸음";
      case "Acceleration": return "급과속";
      case "Braking": return "급제동";
      case "Abnormal": return "이상감지";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">알림 현황</h3>
        <IoTrendingUpOutline className="text-blue-500 text-xl" />
      </div>
      
      {loading ? (
        <div className="text-center py-8 text-gray-500">로딩 중...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <IoAlert className="text-red-500 text-lg" />
                <span className="text-sm font-medium text-red-700">긴급</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{urgentAlerts}</div>
              <div className="text-xs text-red-600">즉시 조치 필요</div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <IoWarning className="text-orange-500 text-lg" />
                <span className="text-sm font-medium text-orange-700">과속</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{warningTypeCounts.Acceleration}</div>
              <div className="text-xs text-orange-600">확인 권장</div>
            </div>
          </div>

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
                <span className="text-gray-600">졸음</span>
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

          {urgentAlerts > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-sm font-medium text-gray-700 mb-2">최근 중요 알림</div>
              {unreadNotifications
                .filter(n => n.warningType === "Drowsiness" || n.warningType === "Acceleration")
                .slice(0, 2)
                .map((notification, index) => (
                  <div key={index} className="flex items-center gap-2 py-2 px-3 bg-red-50 rounded text-sm mb-2">
                    {getWarningTypeIcon(notification.warningType)}
                    <div className="flex-1 truncate text-red-700">
                      {getWarningTypeLabel(notification.warningType)} - {new Date(notification.warningtime).toLocaleString()}
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AlertSummaryWidget;
