import React from "react";
import { IoCarSportOutline, IoPeopleOutline, IoStatsChartOutline } from "react-icons/io5";

const stats = [
  { icon: <IoCarSportOutline className="text-blue-500 text-2xl" />, label: "총 운행", value: "1,240회" },
  { icon: <IoPeopleOutline className="text-green-500 text-2xl" />, label: "운전자 수", value: "32명" },
  { icon: <IoStatsChartOutline className="text-purple-500 text-2xl" />, label: "평균 만족도", value: "4.7점" },
];

const Dashboard = () => (
  <div className="max-w-5xl mx-auto py-12 px-4">
    <h2 className="text-2xl font-bold mb-8 text-gray-900 tracking-tight">대시보드</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      {stats.map((item, idx) => (
        <div
          key={idx}
          className="bg-white border border-gray-100 rounded-lg p-6 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition"
        >
          <div className="mb-2">{item.icon}</div>
          <div className="text-base font-medium text-gray-600">{item.label}</div>
          <div className="text-xl font-bold text-gray-900">{item.value}</div>
        </div>
      ))}
    </div>
    <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 운행 요약</h3>
      <ul>
        <li className="py-3 flex justify-between items-center border-b last:border-b-0 border-gray-50">
          <span className="font-medium text-gray-700">101번 노선</span>
          <span className="text-blue-600 font-semibold text-sm bg-blue-50 px-3 py-1 rounded">운행중</span>
        </li>
        <li className="py-3 flex justify-between items-center">
          <span className="font-medium text-gray-700">202번 노선</span>
          <span className="text-gray-500 font-semibold text-sm bg-gray-50 px-3 py-1 rounded">대기</span>
        </li>
      </ul>
    </div>
  </div>
);

export default Dashboard;