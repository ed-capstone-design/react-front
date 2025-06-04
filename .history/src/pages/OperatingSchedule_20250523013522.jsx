import React from "react";

const OperatingSchedule = () => {
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
            <td>운행중</td>
          </tr>
          <tr>
            <td>202번</td>
            <td>09:00</td>
            <td>10:00</td>
            <td>대기</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default OperatingSchedule;