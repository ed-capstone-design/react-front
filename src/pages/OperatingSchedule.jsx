import React, { useState, useEffect } from "react";
import axios from "axios";
import AddSchedule from "../components/AddSchedule";
import { useToast } from "../components/Toast/ToastProvider";

// axios 기본 URL 설정
axios.defaults.baseURL = "http://localhost:8080";

const OperatingSchedule = ({ onDriveDetail }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [drivers, setDrivers] = useState({});
  const [buses, setBuses] = useState({});
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // DB에서 운행 스케줄과 관련 정보들 불러오기
  useEffect(() => {
    fetchScheduleData();
  }, []);

  const fetchScheduleData = async () => {
    try {
      // 병렬로 모든 데이터 가져오기
      const [schedulesRes, driversRes, busesRes] = await Promise.all([
        axios.get("/api/dispatch"),
        axios.get("/api/drivers"),
        axios.get("/api/buses")
      ]);

      setSchedules(schedulesRes.data);
      
      // 운전자 정보를 ID로 매핑
      const driversMap = {};
      driversRes.data.forEach(driver => {
        driversMap[driver.driverId] = driver;
      });
      setDrivers(driversMap);

      // 버스 정보를 ID로 매핑
      const busesMap = {};
      busesRes.data.forEach(bus => {
        busesMap[bus.busId] = bus;
      });
      setBuses(busesMap);
    } catch (error) {
      console.error("스케줄 데이터 로딩 실패:", error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  // 스케줄 추가 (dispatch 테이블 기준)
  const handleAddSchedule = async (newSchedule) => {
    try {
      const res = await axios.post("/api/dispatch", newSchedule);
      setSchedules(prev => [...prev, res.data]);
      // 새 스케줄 추가 후 전체 데이터 다시 로딩
      fetchScheduleData();
    } catch (error) {
      console.error("스케줄 추가 실패:", error);
      toast.error("스케줄 추가에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">운행 스케줄을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <h2 className="text-2xl font-bold mb-8 text-gray-900 tracking-tight">운행 스케줄</h2>
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-8">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-3 px-4 text-gray-600 font-semibold">배차일</th>
              <th className="py-3 px-4 text-gray-600 font-semibold">운전자</th>
              <th className="py-3 px-4 text-gray-600 font-semibold">버스</th>
              <th className="py-3 px-4 text-gray-600 font-semibold">예정 출발</th>
              <th className="py-3 px-4 text-gray-600 font-semibold">실제 출발</th>
              <th className="py-3 px-4 text-gray-600 font-semibold">실제 도착</th>
              <th className="py-3 px-4 text-gray-600 font-semibold">상태</th>
              <th className="py-3 px-4 text-gray-600 font-semibold">경고수</th>
              <th className="py-3 px-4 text-gray-600 font-semibold">운행점수</th>
              <th className="py-3 px-4 text-gray-600 font-semibold">작업</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((item, idx) => (
              <tr key={item.dispatchId || idx} className="hover:bg-blue-50 transition rounded">
                <td className="py-3 px-4">{item.dispatchDate}</td>
                <td className="py-3 px-4">
                  {drivers[item.driverId] ? (
                    <div>
                      <div className="font-medium">{drivers[item.driverId].name}</div>
                      <div className="text-xs text-gray-500">ID: {item.driverId}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400">ID: {item.driverId}</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {buses[item.busId] ? (
                    <div>
                      <div className="font-medium">{buses[item.busId].plateNumber}</div>
                      <div className="text-xs text-gray-500">{buses[item.busId].busNumber}번</div>
                    </div>
                  ) : (
                    <span className="text-gray-400">ID: {item.busId}</span>
                  )}
                </td>
                <td className="py-3 px-4">{item.scheduledDeparture || "-"}</td>
                <td className="py-3 px-4">{item.actualDeparture || "-"}</td>
                <td className="py-3 px-4">{item.actualArrival || "-"}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                    item.status === "RUNNING" ? "bg-blue-100 text-blue-800" :
                    item.status === "SCHEDULED" ? "bg-gray-100 text-gray-800" :
                    item.status === "DELAYED" ? "bg-orange-100 text-orange-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {item.status === "COMPLETED" ? "완료" :
                     item.status === "RUNNING" ? "운행중" :
                     item.status === "SCHEDULED" ? "예정" :
                     item.status === "DELAYED" ? "지연" : item.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">{item.warningCount || 0}</td>
                <td className="py-3 px-4 text-center">
                  {item.drivingScore ? `${item.drivingScore}점` : "-"}
                </td>
                <td className="py-3 px-4">
                  {(item.status === "RUNNING" || item.status === "COMPLETED") && (
                    <button
                      onClick={() => onDriveDetail && onDriveDetail(item.dispatchId)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      상세보기
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end mt-8">
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow-sm hover:bg-blue-700 transition"
            onClick={() => setModalOpen(true)}
          >
            스케줄 추가
          </button>
        </div>
      </div>
      <AddSchedule
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddSchedule}
      />
    </div>
  );
};

export default OperatingSchedule;