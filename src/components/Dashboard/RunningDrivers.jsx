import React, { useEffect, useState } from "react";
import { useScheduleAPI } from "../../hooks/useScheduleAPI";

// 배차 상태 변환 함수 (배차 테이블의 status 기준)
const getDispatchStatusLabel = (status) => {
  switch (status) {
    case "SCHEDULED":
      return "예정";
    case "RUNNING":
      return "운행중";
    case "DELAYED":
      return "지연";
    case "COMPLETED":
      return "완료";
    case "CANCELLED":
      return "취소";
    case "DRIVING":
      return "운행중";
    default:
      return status || "운행중"; // 기본값을 운행중으로 설정
  }
};

// 배차 상태별 스타일 클래스 반환
const getStatusStyle = (status) => {
  switch (status) {
    case "SCHEDULED":
      return "bg-gray-100 text-gray-800";
    case "RUNNING":
    case "DRIVING":
      return "bg-blue-100 text-blue-800";
    case "DELAYED":
      return "bg-orange-100 text-orange-800";
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-blue-100 text-blue-800"; // 기본값 (운행중)
  }
};

const RunningDrivers = () => {
  const { fetchRunningDrivers } = useScheduleAPI();
  const [runningDrivers, setRunningDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 운행중인 운전자 데이터 로드 - 주석처리
  /*
  useEffect(() => {
    const loadRunningDrivers = async () => {
      try {
        setLoading(true);
        const drivers = await fetchRunningDrivers();
        setRunningDrivers(drivers);
      } catch (error) {
        console.error('운행중인 운전자 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRunningDrivers();
  }, []); // 의존성 배열을 빈 배열로 변경
  */

  // 임시로 loading을 false로 설정
  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 px-2 text-gray-700 font-semibold text-sm">운전자</th>
              <th className="py-2 px-2 text-gray-700 font-semibold text-sm">전화번호</th>
              <th className="py-2 px-2 text-gray-700 font-semibold text-sm">예정출발</th>
              <th className="py-2 px-2 text-gray-700 font-semibold text-sm">상태</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="4" className="py-4 px-2 text-center text-gray-400">
                운전자 정보를 불러오는 중...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="py-2 px-2 text-gray-700 font-semibold text-sm">운전자</th>
          <th className="py-2 px-2 text-gray-700 font-semibold text-sm">전화번호</th>
          <th className="py-2 px-2 text-gray-700 font-semibold text-sm">예정출발</th>
          <th className="py-2 px-2 text-gray-700 font-semibold text-sm">상태</th>
        </tr>
      </thead>
      <tbody>
        {runningDrivers.length === 0 ? (
          <tr>
            <td colSpan="4" className="py-4 px-2 text-center text-gray-400">
              현재 운행중인 운전자가 없습니다.
            </td>
          </tr>
        ) : (
          runningDrivers.map(driver => (
            <tr key={driver.driverId} className="border-b border-gray-100">
              <td className="py-2 px-2">
                <div>
                  <div className="font-medium text-sm">{driver.driverName}</div>
                  <div className="text-xs text-gray-500">배차 #{driver.dispatchId}</div>
                </div>
              </td>
              <td className="py-2 px-2">{driver.phoneNumber || '-'}</td>
              <td className="py-2 px-2 text-sm font-mono">
                {driver.scheduledDeparture || '-'}
                {driver.actualDeparture && (
                  <div className="text-xs text-green-600">
                    실제: {driver.actualDeparture}
                  </div>
                )}
              </td>
              <td className="py-2 px-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(driver.status)}`}>
                  {getDispatchStatusLabel(driver.status)}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default RunningDrivers;
