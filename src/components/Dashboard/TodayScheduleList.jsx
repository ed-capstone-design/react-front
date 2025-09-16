import React, { useEffect, useState } from "react";
import { useSchedule } from "../Schedule/ScheduleContext";

const TodayScheduleList = () => {
  const { fetchSchedulesByDate, drivers, buses } = useSchedule();
  const [todaySchedules, setTodaySchedules] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const today = new Date().toISOString().split('T')[0];
      const schedules = await fetchSchedulesByDate(today);
      setTodaySchedules(schedules);
    };
    fetchData();
  }, [fetchSchedulesByDate]);
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
          const driver = drivers.find(d => d.driverId === sch.driverId);
          const bus = buses.find(b => b.busId === sch.busId);
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
