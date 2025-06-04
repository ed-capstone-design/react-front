import React from "react";
import { IoCarSportOutline, IoPeopleOutline, IoStatsChartOutline } from "react-icons/io5";

const stats = [
  { icon: <IoCarSportOutline className="text-blue-500 text-3xl" />, label: "총 운행", value: "1,240회" },
  { icon: <IoPeopleOutline className="text-green-500 text-3xl" />, label: "운전자 수", value: "32명" },
  { icon: <IoStatsChartOutline className="text-purple-500 text-3xl" />, label: "평균 만족도", value: "4.7점" },
];

const Dashboard = () => (
  <div className="max-w-5xl mx-auto py-10 px-4">
    <h2 className="text-2xl font-bold mb-8 text-blue-700">대시보드</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
      {stats.map((item, idx) => (
        <div key={idx} className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-2 border border-blue-50">
          {item.icon}
          <div className="text-lg font-semibold text-gray-700">{item.label}</div>
          <div className="text-2xl font-extrabold text-blue-700">{item.value}</div>
        </div>
      ))}
    </div>
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-50">
      <h3 className="text-xl font-bold text-blue-700 mb-4">최근 운행 요약</h3>
      <ul className="divide-y divide-blue-50">
        <li className="py-3 flex justify-between items-center">
          <span className="font-semibold text-gray-700">101번 노선</span>
          <span className="text-blue-600 font-bold">운행중</span>
        </li>
        <li className="py-3 flex justify-between items-center">
          <span className="font-semibold text-gray-700">202번 노선</span>
          <span className="text-gray-500 font-bold">대기</span>
        </li>
      </ul>
    </div>
  </div>
);

export default Dashboard;