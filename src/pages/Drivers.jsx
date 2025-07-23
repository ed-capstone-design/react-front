import React, { useState, useEffect } from "react";
import axios from "axios";
import AddDriverModal from "../components/Driver/AddDriverModal";

const Drivers = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [drivers, setDrivers] = useState([]);

  // 운전자 목록 불러오기 (driver 테이블 기준)
  useEffect(() => {
    axios.get("/api/drivers")
      .then(res => setDrivers(res.data))
      .catch(() => setDrivers([]));
  }, []);

  // 운전자 추가
  const handleAdd = (driver) => {
    setDrivers(prev => [...prev, driver]);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-8 text-gray-900">운전자 관리</h2>
      <div className="flex justify-end mb-2">
        <button onClick={() => setAddOpen(true)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold">+ 운전자 추가</button>
      </div>
      <table className="w-full bg-white border border-gray-100 rounded-lg shadow-sm text-left">
        <thead>
          <tr>
            <th className="py-3 px-4 text-gray-600">이름</th>
            <th className="py-3 px-4 text-gray-600">면허번호</th>
            <th className="py-3 px-4 text-gray-600">경력(년)</th>
            <th className="py-3 px-4 text-gray-600">등급</th>
            <th className="py-3 px-4 text-gray-600">상태</th>
            <th className="py-3 px-4 text-gray-600">수정</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((d, idx) => (
            <tr key={d.driverId || idx} className="hover:bg-blue-50 transition">
              <td className="py-3 px-4 text-gray-900">{d.driverName}</td>
              <td className="py-3 px-4">{d.licenseNumber}</td>
              <td className="py-3 px-4">{d.careerYears}</td>
              <td className="py-3 px-4">{d.grade}</td>
              <td className="py-3 px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm
                  ${d.status === "운행중" ? "bg-green-100 text-green-700" : d.status === "대기" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>
                  {d.status}
                </span>
              </td>
              <td className="py-3 px-4">
                <button
                  className="text-blue-600 hover:underline font-semibold"
                  onClick={() => alert("수정 기능은 구현 필요")}
                >
                  수정
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <AddDriverModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} />
    </div>
  );
};

export default Drivers;