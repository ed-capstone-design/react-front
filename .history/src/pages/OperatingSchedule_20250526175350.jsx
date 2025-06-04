import React from "react";
import {useState} from "react";
import AddSchedule from "./AddSchedule";

const OperatingSchedule = ({ onDriveDetail }) => {
    const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6">운행 스케줄</h2>
      <table className="w-full bg-white rounded shadow text-left">
        <thead>
          <tr>
            <th className="py-2 px-4">노선</th>
            <th className="py-2 px-4">출발 시간</th>
            <th className="py-2 px-4">도착 시간</th>
            <th className="py-2 px-4">상태</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>101번</td>
            <td>08:00</td>
            <td>09:00</td>
            <td>
              <button
                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                onClick={() => onDriveDetail("101")}
              >
                운행중
              </button>
            </td>
          </tr>
          <tr>
            <td>202번</td>
            <td>09:00</td>
            <td>10:00</td>
            <td>
              <button
                className="px-3 py-1 rounded bg-gray-400 text-white hover:bg-gray-500 transition"
                onClick={() => onDriveDetail("202")}
              >
                대기
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <button
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={() => setShowAddSchedule(true)}
      >
        추가
      </button>
    </div>
  );
};

export default OperatingSchedule;