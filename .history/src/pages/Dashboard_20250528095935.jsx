import React from "react";
import { IoCarSportOutline, IoPeopleOutline, IoStatsChartOutline } from "react-icons/io5";
import { useNotifications } from "../contexts/NotificationContext";

const stats = [
  { icon: <IoCarSportOutline className="text-blue-500 text-3xl" />, label: "총 운행", value: "1,240회" },
  { icon: <IoPeopleOutline className="text-green-500 text-3xl" />, label: "운전자 수", value: "32명" },
  { icon: <IoStatsChartOutline className="text-purple-500 text-3xl" />, label: "평균 만족도", value: "4.7점" },
];

const Dashboard = ({ onNotificationCardClick }) => {
  const { notifications } = useNotifications();
  const today = new Date().toISOString().slice(0, 10);
  const todayNotis = notifications.filter(n => n.date === today);

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
          onClick={onNotificationCardClick}
          title="알림 상세 보기"
        >
          <div className="mb-2 text-blue-500 text-3xl font-bold">🔔</div>
          <div className="text-base font-semibold text-blue-700">금일 알림</div>
          <div className="text-2xl font-extrabold text-blue-700">{todayNotis.length}건</div>
          <div className="w-full mt-4 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-100">
            {todayNotis.length === 0 ? (
              <div className="text-gray-400 text-sm text-center">금일 알림 없음</div>
            ) : (
              todayNotis.map(n => (
                <div key={n.id} className="text-xs text-gray-700 py-1 border-b last:border-b-0 border-gray-50 truncate">
                  {n.message}
                </div>
              ))
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
          <li className="py-4 flex justify-between items-center">
            <span className="font-medium text-gray-700">101번 노선</span>
            <span className="text-blue-600 font-semibold text-sm bg-blue-50 px-3 py-1 rounded">{`운행중`}</span>
          </li>
          <li className="py-4 flex justify-between items-center">
            <span className="font-medium text-gray-700">202번 노선</span>
            <span className="text-gray-500 font-semibold text-sm bg-gray-50 px-3 py-1 rounded">{`대기`}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;