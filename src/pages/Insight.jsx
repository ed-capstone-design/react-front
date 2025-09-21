import React, { useState, useEffect } from "react";
import KakaoMap from "../components/Map/Map";
import DriverListPanel from "../components/Driver/DriverListPanel";
import { DriverProvider } from "../components/Driver/DriverContext";
import { NotificationProvider } from "../components/Notification/contexts/NotificationContext";
import axios from "axios";
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

const Insight = ({ onDriverClick }) => {
  const [busLocations, setBusLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusLocations();
    // 실시간 위치 업데이트를 위한 인터벌 (150ms마다)
    const interval = setInterval(fetchBusLocations, 150);
    return () => clearInterval(interval);
  }, []);

  const fetchBusLocations = async () => {
    try {
      // 현재 운행 중인 버스들의 위치 정보 가져오기
      const response = await axios.get('/api/buses/locations');
      const locations = response.data.map(bus => ({
        lat: bus.location?.latitude || 37.5665,
        lng: bus.location?.longitude || 126.9780,
        imageSrc: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
        busInfo: {
          plateNumber: bus.plateNumber,
          busNumber: bus.busNumber,
          driverName: bus.driverName,
          status: bus.status
        }
      }));
      setBusLocations(locations);
    } catch (error) {
      console.error("버스 위치 정보 로딩 실패:", error);
      // 에러 시 기본 위치들로 설정
      setBusLocations([
        { 
          lat: 37.54699, 
          lng: 127.09598, 
          imageSrc: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
          busInfo: { plateNumber: "데모 01", busNumber: "101", status: "운행중" }
        },
        { 
          lat: 37.55000, 
          lng: 127.10000, 
          imageSrc: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
          busInfo: { plateNumber: "데모 02", busNumber: "102", status: "운행중" }
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 알림 관련 상태/로직 (Notifications.jsx에서 이식)
  const {
    notifications,
    unreadCount,
    priorityCounts,
    typeCounts,
    markAsRead,
  } = useNotifications();
  const [selectedPeriod, setSelectedPeriod] = React.useState("today");

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
    <NotificationProvider>
      <div className="max-w-6xl mx-auto py-8 px-2 md:px-6">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 tracking-tight">인사이트</h2>
        {/* 통계+지도+드라이버+카테고리 통합 카드 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-0 md:p-8 flex flex-col gap-6">
          {/* 통계 대시보드: 한 줄, 미니멀 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 px-2 md:px-0 pt-6">
            <div className="flex flex-col items-center bg-red-50 rounded-xl p-3 shadow-sm">
              <IoAlert className="text-red-500 text-2xl mb-1" />
              <span className="text-red-600 font-bold text-xl">{stats.urgent}</span>
              <span className="text-xs text-red-700 mt-0.5">긴급</span>
            </div>
            <div className="flex flex-col items-center bg-orange-50 rounded-xl p-3 shadow-sm">
              <IoWarning className="text-orange-500 text-2xl mb-1" />
              <span className="text-orange-600 font-bold text-xl">{stats.warnings}</span>
              <span className="text-xs text-orange-700 mt-0.5">경고</span>
            </div>
            <div className="flex flex-col items-center bg-blue-50 rounded-xl p-3 shadow-sm">
              <IoInformationCircle className="text-blue-500 text-2xl mb-1" />
              <span className="text-blue-600 font-bold text-xl">{stats.unread}</span>
              <span className="text-xs text-blue-700 mt-0.5">미확인</span>
            </div>
            <div className="flex flex-col items-center bg-green-50 rounded-xl p-3 shadow-sm">
              <IoTrendingUpOutline className="text-green-500 text-2xl mb-1" />
              <span className="text-green-600 font-bold text-xl">{stats.total}</span>
              <span className="text-xs text-green-700 mt-0.5">전체</span>
            </div>
          </div>
          {/* 지도+드라이버+카테고리 통계 세트 */}
          <div className="flex flex-col md:flex-row gap-0 md:gap-8 items-stretch">
            {/* 지도 */}
            <div className="w-full md:w-[60%] flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-100">
              <div className="flex items-center justify-between px-5 pt-5 pb-2">
                <h3 className="text-lg font-semibold text-gray-800">실시간 버스 위치</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  {loading ? "위치 업데이트 중..." : `${busLocations.length}대 운행중`}
                </div>
              </div>
              <div className="flex-1 min-h-[320px] max-h-[400px] px-5 pb-5">
                <KakaoMap markers={busLocations} height="320px" />
              </div>
            </div>
            {/* 드라이버 패널 */}
            <div className="w-full md:w-[40%] flex flex-col max-h-[400px] overflow-y-auto px-5 py-5">
              <DriverProvider>
                <DriverListPanel onDriverClick={onDriverClick} />
              </DriverProvider>
            </div>
          </div>
          {/* 카테고리별 통계: 지도+드라이버 카드 하단에 합침 */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-6 px-2 md:px-0 pb-4">
            <div className="flex-1 flex items-center bg-blue-50 rounded-xl p-4 gap-3">
              <IoPersonOutline className="text-blue-500 text-2xl" />
              <span className="font-semibold text-gray-900">운전자</span>
              <span className="text-2xl font-bold text-blue-600">{stats.driverRelated}</span>
              <span className="text-xs text-blue-700 ml-2" title="비율">{stats.total ? ((stats.driverRelated / stats.total) * 100).toFixed(1) : 0}%</span>
            </div>
            <div className="flex-1 flex items-center bg-green-50 rounded-xl p-4 gap-3">
              <IoCarOutline className="text-green-500 text-2xl" />
              <span className="font-semibold text-gray-900">차량</span>
              <span className="text-2xl font-bold text-green-600">{stats.busRelated}</span>
              <span className="text-xs text-green-700 ml-2" title="비율">{stats.total ? ((stats.busRelated / stats.total) * 100).toFixed(1) : 0}%</span>
            </div>
          </div>
        </div>
      
        {/* 알림 목록: 지도+드라이버 패널 바로 아래 */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-0 md:p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <IoInformationCircle className="text-blue-500" />
              전체 알림 목록
            </h3>
            <div className="space-y-2">
              {notifications.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  <IoInformationCircle className="text-4xl mx-auto mb-2 opacity-50" />
                  <div>알림 없음</div>
                </div>
              ) : (
                notifications
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map(notification => (
                    <div key={notification.id} className={`flex flex-col md:flex-row md:items-center justify-between rounded-lg p-3 bg-white hover:shadow transition-shadow ${!notification.read ? 'ring-2 ring-blue-100' : ''}`}>
                      <div className="flex items-center gap-2 mb-1 md:mb-0">
                        {getTypeIcon(notification.type)}
                        <span className="font-semibold text-gray-900 text-sm">{notification.title}</span>
                        {getPriorityBadge(notification.priority)}
                        {!notification.read && (
                          <span className="ml-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">새로움</span>
                        )}
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <IoTimeOutline />
                          {formatDateTime(notification.timestamp)}
                        </span>
                        {notification.driverId && (
                          <span className="flex items-center gap-1">
                            <IoPersonOutline />
                            운전자
                          </span>
                        )}
                        {notification.busId && (
                          <span className="flex items-center gap-1">
                            <IoCarOutline />
                            차량 {notification.busId}번
                          </span>
                        )}
                        <span className="text-gray-600 text-xs mt-1 md:mt-0">{notification.message}</span>
                        <span className="flex gap-1 ml-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 rounded-full hover:bg-blue-100 text-blue-600"
                              title="읽음 처리"
                            >
                              <IoCheckmarkCircle className="text-lg" />
                            </button>
                          )}
                          {notification.action && (
                            <button className="p-1 rounded-full hover:bg-green-100 text-green-600" title="조치하기">
                              <IoTrendingUpOutline className="text-lg" />
                            </button>
                          )}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default Insight;