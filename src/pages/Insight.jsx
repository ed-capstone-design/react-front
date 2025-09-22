import React, { useState, useEffect } from "react";
import KakaoMap from "../components/Map/Map";
import DriverListPanel from "../components/Driver/DriverListPanel";
import { useNotificationCount } from "../components/Notification/NotificationCountProvider";
import axios from "axios";
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
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(true);
  const { unreadCount } = useNotificationCount();

  useEffect(() => {
    fetchBusLocations();
    fetchNotifications();
    // 실시간 위치 업데이트를 위한 인터벌 (150ms마다)
    const interval = setInterval(fetchBusLocations, 150);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);
      const response = await axios.get('/api/notifications/me/unread');
      setNotifications(response.data);
    } catch (error) {
      console.error("알림 로딩 실패:", error);
      // 에러 시 빈 배열로 설정
      setNotifications([]);
    } finally {
      setNotificationLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`);
      // 읽음 처리 후 해당 알림을 목록에서 제거 (읽지 않은 알림만 표시하므로)
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error("알림 읽음 처리 실패:", error);
    }
  };

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

  // 알림 관련 상태/로직
  const [selectedPeriod, setSelectedPeriod] = React.useState("today");

    // 알림 통계 계산 - Dashboard와 동일한 warningType 구조 사용
  const warningTypeCounts = {
    Acceleration: notifications.filter(n => n.warningType === 'Acceleration').length,
    Drowsiness: notifications.filter(n => n.warningType === 'Drowsiness').length,
    Braking: notifications.filter(n => n.warningType === 'Braking').length,
    Abnormal: notifications.filter(n => n.warningType === 'Abnormal').length,
  };

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
    return notifications.filter(n => new Date(n.warningtime) >= startDate);
  };
  const periodNotifications = getNotificationsByPeriod(selectedPeriod);
  const stats = {
    total: notifications.length,
    unread: unreadCount,
    acceleration: warningTypeCounts.Acceleration,
    drowsiness: warningTypeCounts.Drowsiness,
    braking: warningTypeCounts.Braking,
    abnormal: warningTypeCounts.Abnormal,
    driverRelated: notifications.filter(n => n.driverId).length,
    busRelated: notifications.filter(n => n.busId).length,
  };
  const getWarningTypeIcon = (warningType) => {
    switch (warningType) {
      case "Acceleration": return <IoAlert className="text-red-500" />;
      case "Drowsiness": return <IoWarning className="text-orange-500" />;
      case "Braking": return <IoAlert className="text-red-600" />;
      case "Abnormal": return <IoInformationCircle className="text-blue-500" />;
    }
  };

  const getWarningTypeLabel = (warningType) => {
    switch (warningType) {
      case "Acceleration": return "급과속";
      case "Drowsiness": return "졸음운전";
      case "Braking": return "급제동";
      case "Abnormal": return "이상감지";
      default: return "기타";
    }
  };

  const getWarningTypeBadge = (warningType) => {
    switch (warningType) {
      case "Acceleration":
        return <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">급과속</span>;
      case "Drowsiness":
        return <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">졸음</span>;
      case "Braking":
        return <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">급제동</span>;
      case "Abnormal":
        return <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">이상감지</span>;
      default:
        return <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">기타</span>;
    }
  };

  const formatDateTime = (warningtime) => {
    return new Date(warningtime).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-2 md:px-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 tracking-tight">인사이트</h2>
      {/* 통계+지도+드라이버+카테고리 통합 카드 */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-0 md:p-8 flex flex-col gap-6">
        {/* 통계 대시보드: 한 줄, 미니멀 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 px-2 md:px-0 pt-6">
          <div className="flex flex-col items-center bg-red-50 rounded-xl p-3 shadow-sm">
            <IoAlert className="text-red-500 text-2xl mb-1" />
            <div className="text-xs font-semibold text-red-700">급과속</div>
            <div className="text-lg font-bold text-red-700">{stats.acceleration}</div>
          </div>
          <div className="flex flex-col items-center bg-orange-50 rounded-xl p-3 shadow-sm">
            <IoWarning className="text-orange-500 text-2xl mb-1" />
            <div className="text-xs font-semibold text-orange-700">졸음</div>
            <div className="text-lg font-bold text-orange-700">{stats.drowsiness}</div>
          </div>
          <div className="flex flex-col items-center bg-red-100 rounded-xl p-3 shadow-sm">
            <IoAlert className="text-red-600 text-2xl mb-1" />
            <div className="text-xs font-semibold text-red-800">급정거</div>
            <div className="text-lg font-bold text-red-800">{stats.braking}</div>
          </div>
          <div className="flex flex-col items-center bg-blue-50 rounded-xl p-3 shadow-sm">
            <IoInformationCircle className="text-blue-500 text-2xl mb-1" />
            <div className="text-xs font-semibold text-blue-700">이상감지</div>
            <div className="text-lg font-bold text-blue-700">{stats.abnormal}</div>
          </div>
        </div>

        {/* 지도와 운전자 리스트 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-4 text-blue-700 flex items-center gap-2">
              <IoCarOutline />
              실시간 버스 위치
            </h3>
            {loading ? (
              <div className="w-full h-80 bg-gray-100 rounded-xl flex items-center justify-center">
                <div className="text-gray-500">위치 정보를 불러오는 중...</div>
              </div>
            ) : (
              <KakaoMap locations={busLocations} />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 text-green-700 flex items-center gap-2">
              <IoPersonOutline />
              운전자 목록
            </h3>
            <DriverListPanel onDriverClick={onDriverClick} />
          </div>
        </div>

        {/* 카테고리별 알림 통계 */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h3 className="text-xl font-bold text-purple-700 flex items-center gap-2">
              <IoCalendarOutline />
              알림 현황
            </h3>
            <div className="flex gap-2">
              {["today", "week", "month"].map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    selectedPeriod === period 
                      ? "bg-purple-500 text-white" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {period === "today" ? "오늘" : period === "week" ? "이번 주" : "이번 달"}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="flex items-center gap-2 bg-red-50 p-3 rounded-lg">
              <IoAlert className="text-red-500" />
              <div>
                <div className="text-xs text-red-600">급과속</div>
                <div className="font-bold text-red-700">{stats.acceleration}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-orange-50 p-3 rounded-lg">
              <IoWarning className="text-orange-500" />
              <div>
                <div className="text-xs text-orange-600">졸음</div>
                <div className="font-bold text-orange-700">{stats.drowsiness}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-red-100 p-3 rounded-lg">
              <IoAlert className="text-red-600" />
              <div>
                <div className="text-xs text-red-800">급정거</div>
                <div className="font-bold text-red-800">{stats.braking}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
              <IoInformationCircle className="text-blue-500" />
              <div>
                <div className="text-xs text-blue-600">이상감지</div>
                <div className="font-bold text-blue-700">{stats.abnormal}</div>
              </div>
            </div>
          </div>
          
          {/* 알림 리스트 */}
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {notificationLoading ? (
              <div className="p-4 text-center text-gray-500">알림을 불러오는 중...</div>
            ) : periodNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">선택된 기간에 알림이 없습니다.</div>
            ) : (
              periodNotifications
                .sort((a, b) => new Date(b.warningtime) - new Date(a.warningtime))
                .map(notification => (
                  <div
                    key={notification.id}
                    className="border-b last:border-b-0 p-3 hover:bg-gray-50 transition bg-blue-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        {getWarningTypeIcon(notification.warningType)}
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">{notification.title || getWarningTypeLabel(notification.warningType)}</div>
                          <div className="text-xs text-gray-600 mt-1">{notification.message}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <IoTimeOutline className="text-gray-400 text-xs" />
                            <span className="text-xs text-gray-400">{formatDateTime(notification.warningtime)}</span>
                            {getWarningTypeBadge(notification.warningType)}
                          </div>
                        </div>
                      </div>
                      <span className="flex gap-1">
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-500 hover:text-blue-700 text-xs"
                          title="읽음 처리"
                        >
                          읽음
                        </button>
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insight;
