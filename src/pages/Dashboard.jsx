import React, { useState, useEffect } from "react";
import { IoCarSportOutline, IoPeopleOutline, IoStatsChartOutline, IoNotificationsOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useNotificationCount } from "../components/Notification/NotificationCountProvider";
import { useScheduleAPI } from "../hooks/useScheduleAPI";
import RunningDrivers from "../components/Dashboard/RunningDrivers";
import TodayScheduleList from "../components/Dashboard/TodayScheduleList";

// axios 기본 URL 설정
axios.defaults.baseURL = "http://localhost:8080";

const DashboardContent = () => {
  const { unreadCount } = useNotificationCount();
  const { fetchSchedulesByDate } = useScheduleAPI();
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { icon: <IoCarSportOutline className="text-blue-500 text-3xl" />, label: "오늘 스케줄", value: "로딩중..." },
    { icon: <IoPeopleOutline className="text-green-500 text-3xl" />, label: "운전자 수", value: "로딩중..." },
    { icon: <IoStatsChartOutline className="text-purple-500 text-3xl" />, label: "완료 운행", value: "로딩중..." },
  ]);
  const [recentDrives, setRecentDrives] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationLoading, setNotificationLoading] = useState(true);

  // 통계 데이터 불러오기
  useEffect(() => {
    fetchDashboardStats();
    fetchRecentDrives();
    fetchRecentNotifications();
  }, []);

  // unreadCount 변경 시 stats 업데이트
  useEffect(() => {
    setStats(prev => prev.map(stat => 
      stat.label === "미읽은 알림" 
        ? { ...stat, value: unreadCount }
        : stat
    ));
  }, [unreadCount]);

  const fetchRecentNotifications = async () => {
    setNotificationLoading(true);
    try {
      // 읽지 않은 알림만 가져오기
      const response = await axios.get("/api/notifications/me/unread?limit=5");
      setRecentNotifications(response.data);
    } catch (error) {
      console.log("읽지 않은 알림 조회 실패, 예시 데이터 사용");
      setRecentNotifications([
        {
          warningType: "Acceleration",
          warningtime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30분 전
          isRead: false
        },
        {
          warningType: "Drowsiness",
          warningtime: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1시간 전
          isRead: false
        },
        {
          warningType: "Abnormal",
          warningtime: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10분 전
          isRead: false
        }
      ]);
    } finally {
      setNotificationLoading(false);
    }
  };

  // warningType별 라벨 반환
  const getWarningTypeLabel = (warningType) => {
    switch (warningType) {
      case "Acceleration": return "급과속";
      case "Braking": return "급정거";
      case "Drowsiness": return "졸음";
      case "Abnormal": return "이상감지";
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // 1. 오늘 스케줄 조회 (최적화)
      const today = new Date().toISOString().split('T')[0];
      const todaySchedules = await fetchSchedulesByDate(today);
      const completedToday = todaySchedules.filter(d => d.status === "COMPLETED").length;

      // 2. 운전자 수 (driver 테이블에서)
      const driversResponse = await axios.get("/api/drivers");
      const totalDrivers = driversResponse.data.length;

      setStats([
        { icon: <IoCarSportOutline className="text-blue-500 text-3xl" />, label: "오늘 스케줄", value: `${todaySchedules.length}건` },
        { icon: <IoPeopleOutline className="text-green-500 text-3xl" />, label: "운전자 수", value: `${totalDrivers}명` },
        { icon: <IoStatsChartOutline className="text-purple-500 text-3xl" />, label: "완료 운행", value: `${completedToday}건` },
      ]);
    } catch (error) {
      console.error("통계 데이터 로딩 실패:", error);
      setStats([
        { icon: <IoCarSportOutline className="text-blue-500 text-3xl" />, label: "오늘 스케줄", value: "오류" },
        { icon: <IoPeopleOutline className="text-green-500 text-3xl" />, label: "운전자 수", value: "오류" },
        { icon: <IoStatsChartOutline className="text-purple-500 text-3xl" />, label: "완료 운행", value: "오류" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentDrives = async () => {
    try {
      // 오늘 스케줄만 가져와서 최근 운행으로 표시
      const today = new Date().toISOString().split('T')[0];
      const todaySchedules = await fetchSchedulesByDate(today);
      const recent = todaySchedules
        .filter(d => d.status === "COMPLETED" || d.status === "SCHEDULED")
        .slice(0, 2); // 최근 2개만
      setRecentDrives(recent);
    } catch (error) {
      console.error("최근 운행 데이터 로딩 실패:", error);
      setRecentDrives([
        { dispatchId: 1, status: "COMPLETED", busId: 101 },
        { dispatchId: 2, status: "SCHEDULED", busId: 202 }
      ]);
    }
  };
  
  // 알림 카드 클릭 핸들러
  const handleNotificationCardClick = () => {
    navigate('/insight');
  };
  
  // 오늘 날짜로 필터링 (warningtime을 사용)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayNotis = recentNotifications.filter(n => {
    const notiDate = new Date(n.warningtime);
    notiDate.setHours(0, 0, 0, 0);
    return notiDate.getTime() === today.getTime();
  });

  // 읽지 않은 오늘 알림 (모든 알림이 읽지 않은 알림이므로 그대로 사용)
  const todayUnreadNotis = todayNotis;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold mb-10 text-gray-900 tracking-tight">대시보드</h2>
      {/* 상단 통계 + 알림 카드 4개 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-100 rounded-xl p-8 flex flex-col items-center gap-3 shadow-sm hover:shadow transition"
          >
            <div className="mb-2">{item.icon}</div>
            <div className="text-base font-semibold text-gray-700">{item.label}</div>
            <div className="text-2xl font-extrabold text-gray-900">{item.value}</div>
          </div>
        ))}
        {/* 알림 카드 */}
        <div
          className="bg-white border border-blue-100 rounded-xl p-8 flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition cursor-pointer relative"
          onClick={handleNotificationCardClick}
          title="알림 상세 보기"
        >
          <div className="mb-2 text-blue-500 text-3xl font-bold">🔔</div>
          {unreadCount > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
          <div className="text-base font-semibold text-blue-700">금일 알림</div>
          <div className="text-2xl font-extrabold text-blue-700">
            {todayUnreadNotis.length}/{todayNotis.length}
          </div>
          <div className="w-full mt-4 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-100">
            {todayNotis.length === 0 ? (
              <div className="text-gray-400 text-sm text-center">금일 알림 없음</div>
            ) : (
              todayNotis
                .slice(0, 5) // 최대 5개만 표시
                .map((n, index) => (
                  <div 
                    key={index} 
                    className="text-xs py-1 border-b last:border-b-0 border-gray-50 truncate text-gray-900 font-medium"
                  >
                    {getWarningTypeLabel(n.warningType)}: {new Date(n.warningtime).toLocaleTimeString()}
                  </div>
                ))
            )}
            {todayNotis.length > 5 && (
              <div className="text-xs text-blue-500 text-center pt-2">
                +{todayNotis.length - 5}개 더보기
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 추가컨텐츠: 운행중인 운전자 리스트, 당일 배차목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* 운행중인 운전자 리스트 */}
        <section className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold mb-4 text-blue-700">운행중인 운전자</h3>
          <RunningDrivers />
        </section>
        {/* 당일 배차목록 */}
        <section className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold mb-4 text-green-700">오늘의 배차목록</h3>
          <TodayScheduleList />
        </section>
      </div>
    </div>
  );
}


const Dashboard = () => (
  <DashboardContent />
);

export default Dashboard;