import React, { useState } from "react";
import AddSchedule from "../components/AddSchedule";

const initialSchedules = [
  { route: "101번", start: "08:00", end: "09:00", status: "운행중" },
  { route: "202번", start: "09:00", end: "10:00", status: "대기" },
];

const OperatingSchedule = ({ onDriveDetail }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [schedules, setSchedules] = useState(initialSchedules);

  const handleAddSchedule = (newSchedule) => {
    setSchedules((prev) => [...prev, newSchedule]);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-8 text-gray-900">운행 스케줄</h2>
      <table className="w-full bg-white border border-gray-100 rounded-lg shadow-sm text-left">
        <thead>
          <tr>
            <th className="py-3 px-4 text-gray-600">노선</th>
            <th className="py-3 px-4 text-gray-600">출발 시간</th>
            <th className="py-3 px-4 text-gray-600">도착 시간</th>
            <th className="py-3 px-4 text-gray-600">상태</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((item, idx) => (
            <tr key={idx} className="hover:bg-blue-50 transition">
              <td className="py-3 px-4">{item.route}</td>
              <td className="py-3 px-4">{item.start}</td>
              <td className="py-3 px-4">{item.end}</td>
              <td className="py-3 px-4">
                <button
                  className={`px-3 py-1 rounded-full text-white font-bold shadow-sm transition
                    ${item.status === "운행중"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 hover:bg-gray-500"}`}
                  onClick={() => onDriveDetail(item.route)}
                >
                  {item.status}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end mt-6">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-sm hover:bg-blue-700 transition"
          onClick={() => setModalOpen(true)}
        >
          + 스케줄 추가
        </button>
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