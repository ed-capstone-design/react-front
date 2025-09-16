import React from "react";
import { useSchedule } from "../Schedule/ScheduleContext";

// 상태 변환 함수
const getStatusLabel = (status) => {
  switch (status) {
    case "DRIVING":
      return "운행중";
    case "BREAK":
      return "대기";
    case "OFF":
      return "휴무";
    default:
      return status || "-";
  }
};

const RunningDrivers = () => {
  const { drivers } = useSchedule();

  if (!drivers || drivers.length === 0) {
    return <div className="text-gray-400">운전자 정보를 불러오는 중...</div>;
  }

  // 운행중인 운전자만 필터링
  const runningDrivers = drivers.filter(driver => driver.status === "DRIVING");

  if (runningDrivers.length === 0) {
    return <div className="text-gray-400">현재 운행중인 운전자가 없습니다.</div>;
  }

  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="py-2 px-2 text-gray-700 font-semibold text-sm">운전자</th>
          <th className="py-2 px-2 text-gray-700 font-semibold text-sm">전화번호</th>
          <th className="py-2 px-2 text-gray-700 font-semibold text-sm">상태</th>
        </tr>
      </thead>
      <tbody>
        {runningDrivers.map(driver => (
          <tr key={driver.driverId} className="border-b border-gray-100">
            <td className="py-2 px-2">{driver.driverName}</td>
            <td className="py-2 px-2">{driver.phoneNumber}</td>
            <td className="py-2 px-2">{getStatusLabel(driver.status)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RunningDrivers;
