import React, { useState, useEffect } from "react";
import axios from "axios";
import AddSchedule from "../components/AddSchedule";

const OperatingSchedule = ({ onDriveDetail }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [schedules, setSchedules] = useState([]);

  // DB에서 운행 스케줄 불러오기 (dispatch 테이블 기준)
  useEffect(() => {
    axios.get("/api/dispatch")
      .then(res => setSchedules(res.data))
      .catch(() => setSchedules([]));
  }, []);

  // 스케줄 추가 (dispatch 테이블 기준)
  const handleAddSchedule = async (newSchedule) => {
    try {
      const res = await axios.post("/api/dispatch", newSchedule);
      setSchedules(prev => [...prev, res.data]);
    } catch {
      alert("스케줄 추가 실패");
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <h2 className="text-2xl font-bold mb-8 text-gray-900 tracking-tight">운행 스케줄</h2>
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-8">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-3 px-4 text-gray-600 font-semibold">배차일</th>
              <th className="py-3 px-4 text-gray-600 font-semibold">운전자 ID</th>
              <th className="py-3 px-4 text-gray-600 font-semibold">버스 ID</th>
              <th className="py-3 px-4 text-gray-600 font-semibold">예정 출발</th>
              <th className="py-3 px-4 text-gray-600 font-semibold">실제 출발</th>
              <th className="py-3 px-4 text-gray-600 font-semibold">실제 도착</th>
              <th className="py-3 px-4 text-gray-600 font-semibold">상태</th>
              <th className="py-3 px-4 text-gray-600 font-semibold">경고수</th>
              <th className="py-3 px-4 text-gray-600 font-semibold">운행점수</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((item, idx) => (
              <tr key={item.dispatchId || idx} className="hover:bg-blue-50 transition rounded">
                <td className="py-3 px-4">{item.dispatchDate}</td>
                <td className="py-3 px-4">{item.driverId}</td>
                <td className="py-3 px-4">{item.busId}</td>
                <td className="py-3 px-4">{item.scheduledDeparture}</td>
                <td className="py-3 px-4">{item.actualDeparture}</td>
                <td className="py-3 px-4">{item.actualArrival}</td>
                <td className="py-3 px-4">
                  <span className={`px-4 py-1 rounded-full text-white font-bold shadow-sm transition
                    ${item.status === "COMPLETED"
                      ? "bg-green-300 text-green-700 hover:bg-green-500"
                      : item.status === "SCHEDULED"
                      ? "bg-blue-300 text-blue-700 hover:bg-blue-500"
                      : item.status === "DELAYED"
                      ? "bg-yellow-300 text-yellow-700 hover:bg-yellow-500"
                      : "bg-gray-400 hover:bg-gray-500"}`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-3 px-4">{item.warningCount}</td>
                <td className="py-3 px-4">{item.drivingScore}</td>
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