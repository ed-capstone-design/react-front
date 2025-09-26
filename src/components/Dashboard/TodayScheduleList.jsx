import React, { useEffect, useState } from "react";
import { useScheduleAPI } from "../../hooks/useScheduleAPI";

const TodayScheduleList = () => {
  const { fetchSchedulesByPeriod, fetchDriverById, fetchBusById } = useScheduleAPI();
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [scheduleDetails, setScheduleDetails] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const schedules = await fetchSchedulesByPeriod(today, today);
        setTodaySchedules(schedules);

        // 각 스케줄의 운전자와 버스 정보를 병렬로 가져오기
        const details = {};
        const detailPromises = schedules.map(async (schedule) => {
          const [driver, bus] = await Promise.all([
            fetchDriverById(schedule.driverId),
            fetchBusById(schedule.busId)
          ]);
          details[schedule.dispatchId] = { driver, bus };
        });
        
        await Promise.all(detailPromises);
        setScheduleDetails(details);
      } catch (error) {
        console.error('오늘 스케줄 데이터 로드 실패:', error);
      }
    };
    fetchData();
  }, []); // 의존성 배열을 빈 배열로 변경 - 컴포넌트 마운트시에만 실행
  if (todaySchedules.length === 0) return <div className="text-gray-400">오늘 등록된 배차가 없습니다.</div>;
  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="py-2 px-2 text-gray-700 font-semibold text-sm">운전자</th>
          <th className="py-2 px-2 text-gray-700 font-semibold text-sm">버스 노선번호</th>
          <th className="py-2 px-2 text-gray-700 font-semibold text-sm">예정출발</th>
          <th className="py-2 px-2 text-gray-700 font-semibold text-sm">상태</th>
          <th className="py-2 px-2 text-gray-700 font-semibold text-sm">경고</th>
        </tr>
      </thead>
      <tbody>
        {todaySchedules.map(sch => {
          const details = scheduleDetails[sch.dispatchId];
          const driver = details?.driver;
          const bus = details?.bus;
          return (
            <tr key={sch.dispatchId} className="border-b border-gray-100">
              <td className="py-2 px-2">{driver ? driver.driverName : `ID:${sch.driverId}`}</td>
              <td className="py-2 px-2">{bus ? bus.routeNumber : `BusID:${sch.busId}`}</td>
              <td className="py-2 px-2">{sch.scheduledDeparture}</td>
              <td className="py-2 px-2">{sch.status}</td>
              <td className="py-2 px-2">{sch.warningCount || 0}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default TodayScheduleList;
