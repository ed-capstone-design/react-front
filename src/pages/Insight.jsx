import React, { useState, useEffect } from "react";
// 실시간 지도/드라이버 패널은 현재 비활성화 상태이므로 import 제거
import { useNotificationCount } from '../components/Notification/NotificationCountProvider';
import { useWebSocket } from '../components/WebSocket/WebSocketProvider';
import { useToken } from '../components/Token/TokenProvider';
// axios 기반 알림 API는 현재 비활성화 상태
import {
  IoAlert,
  IoWarning,
  IoInformationCircle,
  IoCheckmarkCircle,
  IoCalendarOutline
} from "react-icons/io5";

const Insight = ({ onDriverClick }) => {
  // const [busLocations, setBusLocations] = useState([]); // 주석처리
  const [loading, setLoading] = useState(false); // 버스 위치 로딩 비활성화
  const [notifications, setNotifications] = useState([]); // 빈 배열로 초기화
  const [notificationLoading, setNotificationLoading] = useState(false); // 로딩 비활성화
  const { unreadCount } = useNotificationCount();
  const { notifications: wsNotifications, isConnected, clearNotifications } = useWebSocket();
  const { token, getUserInfoFromToken } = useToken();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // 토큰에서 사용자 역할 추출
    const userInfo = getUserInfoFromToken();
    if (userInfo && userInfo.roles) {
      setUserRole(userInfo.roles[0]); // 첫 번째 역할 사용
      console.log("🔍 사용자 역할:", userInfo.roles);
    }
    // 실시간 위치 업데이트를 위한 인터벌 (150ms마다) - 주석처리
    // const interval = setInterval(fetchBusLocations, 150);
    // return () => clearInterval(interval);
  }, [token]);

  // 알림 API 호출 함수 - 백엔드 미구현으로 주석처리
  // const fetchNotifications = async () => {
  //   try {
  //     setNotificationLoading(true);
  //     const response = await axios.get('/api/notifications/me/unread');
  //     setNotifications(response.data?.data || response.data);
  //   } catch (error) {
  //     console.error("알림 로딩 실패:", error);
  //     // 에러 시 빈 배열로 설정
  //     setNotifications([]);
  //   } finally {
  //     setNotificationLoading(false);
  //   }
  // };

  // 알림 읽음 처리 함수 - 백엔드 미구현으로 주석처리
  // const markAsRead = async (notificationId) => {
  //   try {
  //     await axios.patch(`/api/notifications/${notificationId}/read`);
  //     // 읽음 처리 후 해당 알림을 목록에서 제거 (읽지 않은 알림만 표시하므로)
  //     setNotifications(prev => prev.filter(n => n.id !== notificationId));
  //   } catch (error) {
  //     console.error("알림 읽음 처리 실패:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchBusLocations();
  //   // 실시간 위치 업데이트를 위한 인터벌 (150ms마다)
  //   const interval = setInterval(fetchBusLocations, 150);
  //   return () => clearInterval(interval);
  // }, []); // 주석처리

  // 버스 위치 관련 함수 주석처리
  // const fetchBusLocations = async () => {
  //   try {
  //     // 현재 운행 중인 버스들의 위치 정보 가져오기
  //     const response = await axios.get('/api/buses/locations');
  //     const busData = response.data?.data || response.data;
  //     const locations = busData.map(bus => ({
  //       lat: bus.location?.latitude || 37.5665,
  //       lng: bus.location?.longitude || 126.9780,
  //       imageSrc: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
  //       busInfo: {
  //         plateNumber: bus.plateNumber,
  //         busNumber: bus.busNumber,
  //         driverName: bus.driverName,
  //         status: bus.status
  //       }
  //     }));
  //     setBusLocations(locations);
  //   } catch (error) {
  //     console.error("버스 위치 정보 로딩 실패:", error);
  //     // 에러 시 기본 위치들로 설정
  //     setBusLocations([
  //       { 
  //         lat: 37.54699, 
  //         lng: 127.09598, 
  //         imageSrc: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
  //         busInfo: { plateNumber: "데모 01", busNumber: "101", status: "운행중" }
  //       },
  //       { 
  //         lat: 37.55000, 
  //         lng: 127.10000, 
  //         imageSrc: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
  //         busInfo: { plateNumber: "데모 02", busNumber: "102", status: "운행중" }
  //       },
  //     ]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
      {/* 헤더와 WebSocket 상태 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">인사이트</h2>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
            isConnected 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            실시간 연결 {isConnected ? '활성' : '비활성'}
          </div>
          {wsNotifications.length > 0 && (
            <div className="bg-sky-100 text-sky-700 px-3 py-2 rounded-lg text-sm font-medium">
              실시간 알림 {wsNotifications.length}개
            </div>
          )}
        </div>
      </div>
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

        {/* 지도와 운전자 리스트 - 주석처리 */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        </div> */}

        {/* 카테고리별 알림 통계 */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h3 className="text-xl font-bold text-purple-700 flex items-center gap-2">
              <IoCalendarOutline />
              알림 현황
            </h3>
            <div className="flex gap-2">
              {/* 관리자용 테스트 전송 버튼은 WebSocket 최소화 단계에서 비활성화 */}
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
            {/* 실시간 WebSocket 알림 섹션 */}
            {wsNotifications.length > 0 && (
              <>
                <div className="bg-sky-50 border-b-2 border-sky-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold text-sky-700 text-sm">실시간 알림</span>
                      <span className="bg-sky-500 text-white text-xs px-2 py-1 rounded-full">
                        {wsNotifications.length}
                      </span>
                    </div>
                    <button
                      onClick={clearNotifications}
                      className="text-xs text-sky-600 hover:text-sky-800 underline"
                    >
                      모두 지우기
                    </button>
                  </div>
                </div>
                {wsNotifications.slice(0, 5).map((notification, index) => (
                  <div
                    key={`ws-${index}`}
                    className="border-b border-sky-100 p-3 bg-sky-25 hover:bg-sky-50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {/* 운전 경고 아이콘 */}
                          {notification.eventType === "DROWSINESS" && <IoWarning className="text-orange-500 text-sm" />}
                          {notification.eventType === "ACCELERATION" && <IoAlert className="text-red-500 text-sm" />}
                          {notification.eventType === "BRAKING" && <IoAlert className="text-red-600 text-sm" />}
                          {notification.eventType === "ABNORMAL" && <IoInformationCircle className="text-blue-500 text-sm" />}
                          
                          {/* 일반 알림 아이콘 */}
                          {!notification.eventType && notification.type === "EMERGENCY" && <IoAlert className="text-red-500 text-sm" />}
                          {!notification.eventType && notification.type === "WARNING" && <IoWarning className="text-orange-500 text-sm" />}
                          {!notification.eventType && notification.type === "INFO" && <IoInformationCircle className="text-blue-500 text-sm" />}
                          
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            notification.eventType === "DROWSINESS" ? "bg-orange-100 text-orange-700" :
                            notification.eventType === "ACCELERATION" ? "bg-red-100 text-red-700" :
                            notification.eventType === "BRAKING" ? "bg-red-100 text-red-700" :
                            notification.eventType === "ABNORMAL" ? "bg-blue-100 text-blue-700" :
                            notification.type === "EMERGENCY" ? "bg-red-100 text-red-700" :
                            notification.type === "WARNING" ? "bg-orange-100 text-orange-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                            {notification.eventType === "DROWSINESS" ? "졸음감지" :
                             notification.eventType === "ACCELERATION" ? "급가속" :
                             notification.eventType === "BRAKING" ? "급정거" :
                             notification.eventType === "ABNORMAL" ? "이상감지" :
                             notification.type === "EMERGENCY" ? "긴급" :
                             notification.type === "WARNING" ? "경고" : "정보"}
                          </span>
                          <span className="text-xs text-green-600 font-medium">실시간</span>
                        </div>
                        <div className="text-sm text-gray-800 mb-1">
                          {notification.driverName && (
                            <span className="font-semibold text-gray-900">{notification.driverName}: </span>
                          )}
                          {notification.message || `${notification.eventType} 이벤트가 감지되었습니다.`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(notification.timestamp).toLocaleString('ko-KR')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {wsNotifications.length > 5 && (
                  <div className="p-2 text-center text-xs text-sky-600 bg-sky-25">
                    {wsNotifications.length - 5}개의 추가 알림이 있습니다
                  </div>
                )}
              </>
            )}
            
            {/* 기존 백엔드 알림 - 백엔드 미구현으로 주석처리 */}
            {/* {notificationLoading ? (
              <div className="p-4 text-center text-gray-500">알림을 불러오는 중...</div>
            ) : periodNotifications.length === 0 && wsNotifications.length === 0 ? (
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
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-600">기록</span>
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
            )} */}
            
            {/* WebSocket 알림이 없을 때 빈 상태 표시 */}
            {wsNotifications.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                실시간 알림을 기다리는 중입니다...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insight;
