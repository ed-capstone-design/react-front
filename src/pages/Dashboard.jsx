import React, { useState, useEffect } from "react";
import { IoCarSportOutline, IoPeopleOutline, IoStatsChartOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { NotificationProvider, useNotifications } from "../components/Notification/contexts/NotificationContext";

// axios 기본 URL 설정
axios.defaults.baseURL = "http://localhost:8080";

const DashboardContent = () => {
  const { notifications, unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { icon: <IoCarSportOutline className="text-blue-500 text-3xl" />, label: "총 운행", value: "로딩중..." },
    { icon: <IoPeopleOutline className="text-green-500 text-3xl" />, label: "운전자 수", value: "로딩중..." },
    { icon: <IoStatsChartOutline className="text-purple-500 text-3xl" />, label: "평균 만족도", value: "로딩중..." },
  ]);
  const [recentDrives, setRecentDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  // 통계 데이터 불러오기
  useEffect(() => {
    fetchDashboardStats();
    fetchRecentDrives();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // 1. 총 운행 수 (dispatch 테이블에서)
      const dispatchResponse = await axios.get("/api/dispatch");
      const totalDispatches = dispatchResponse.data.length;
      const completedDispatches = dispatchResponse.data.filter(d => d.status === "COMPLETED").length;

      // 2. 운전자 수 (driver 테이블에서)
      const driversResponse = await axios.get("/api/drivers");
      const totalDrivers = driversResponse.data.length;

      // 3. 평균 만족도 계산 (평균 운전 점수)
      const drivers = driversResponse.data;
      const avgScore = drivers.length > 0 
        ? (drivers.reduce((sum, d) => sum + (d.avgDrivingScore || 0), 0) / drivers.length).toFixed(1)
        : "0.0";

      setStats([
        { icon: <IoCarSportOutline className="text-blue-500 text-3xl" />, label: "총 운행", value: `${completedDispatches}회` },
        { icon: <IoPeopleOutline className="text-green-500 text-3xl" />, label: "운전자 수", value: `${totalDrivers}명` },
        { icon: <IoStatsChartOutline className="text-purple-500 text-3xl" />, label: "평균 점수", value: `${avgScore}점` },
      ]);
    } catch (error) {
      console.error("통계 데이터 로딩 실패:", error);
      setStats([
        { icon: <IoCarSportOutline className="text-blue-500 text-3xl" />, label: "총 운행", value: "오류" },
        { icon: <IoPeopleOutline className="text-green-500 text-3xl" />, label: "운전자 수", value: "오류" },
        { icon: <IoStatsChartOutline className="text-purple-500 text-3xl" />, label: "평균 점수", value: "오류" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentDrives = async () => {
    try {
      const response = await axios.get("/api/dispatch");
      const recent = response.data
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
    navigate('/notifications');
  };
  
  // 오늘 날짜로 필터링 (timestamp를 사용)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayNotis = notifications.filter(n => {
    const notiDate = new Date(n.timestamp);
    notiDate.setHours(0, 0, 0, 0);
    return notiDate.getTime() === today.getTime();
  });

  // 읽지 않은 오늘 알림
  const todayUnreadNotis = todayNotis.filter(n => !n.read);

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
                .map(n => (
                  <div 
                    key={n.id} 
                    className={`text-xs py-1 border-b last:border-b-0 border-gray-50 truncate ${
                      !n.read ? 'text-gray-900 font-medium' : 'text-gray-500'
                    }`}
                  >
                    {n.title}: {n.message}
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
      {/* 데이터 분석 & 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">데이터 분석</h3>
          <div className="flex-1 h-40 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
            [그래프/통계 영역]
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">통계</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>월별 운행 횟수: 120회</li>
            <li>평균 만족도: 4.7점</li>
            <li>신규 가입자: 30명</li>
          </ul>
        </div>
      </div>
      {/* 최근 운행 요약 */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 운행 요약</h3>
        <ul className="divide-y divide-gray-50">
          {loading ? (
            <li className="py-4 text-center text-gray-400">로딩중...</li>
          ) : recentDrives.length === 0 ? (
            <li className="py-4 text-center text-gray-400">최근 운행 데이터가 없습니다.</li>
          ) : (
            recentDrives.map((drive) => (
              <li key={drive.dispatchId} className="py-4 flex justify-between items-center">
                <span className="font-medium text-gray-700">
                  {drive.busId ? `${drive.busId}번 버스` : `배차 ${drive.dispatchId}번`}
                </span>
                <span className={`text-sm font-semibold px-3 py-1 rounded ${
                  drive.status === "COMPLETED" 
                    ? "text-green-600 bg-green-50" 
                    : drive.status === "SCHEDULED"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-500 bg-gray-50"
                }`}>
                  {drive.status === "COMPLETED" ? "운행완료" : 
                   drive.status === "SCHEDULED" ? "예정" : 
                   drive.status === "DELAYED" ? "지연" : "대기"}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

const Dashboard = () => (
  <NotificationProvider>
    <DashboardContent />
  </NotificationProvider>
);

export default Dashboard;