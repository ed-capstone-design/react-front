import React, { useState, useEffect } from "react";
import axios from "axios";
import AddDriverModal from "../components/Driver/AddDriverModal";
import EditDriverModal from "../components/Driver/EditDriverModal";

// axios 기본 URL 설정
axios.defaults.baseURL = "http://localhost:8080";

const Drivers = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
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

  // 운전자 수정
  const handleEdit = (updatedDriver) => {
    setDrivers(prev => prev.map(driver => 
      driver.driverId === updatedDriver.driverId ? updatedDriver : driver
    ));
  };

  // 수정 모달 열기
  const openEditModal = (driver) => {
    setSelectedDriver(driver);
    setEditOpen(true);
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
            <th className="py-3 px-4 text-gray-600">평균점수</th>
            <th className="py-3 px-4 text-gray-600">등급</th>
            <th className="py-3 px-4 text-gray-600">운영사ID</th>
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
              <td className="py-3 px-4">{d.avgDrivingScore}</td>
              <td className="py-3 px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm
                  ${d.grade === "A" ? "bg-green-100 text-green-700" : 
                    d.grade === "B" ? "bg-blue-100 text-blue-700" : 
                    d.grade === "C" ? "bg-yellow-100 text-yellow-700" : 
                    d.grade === "D" ? "bg-orange-100 text-orange-700" : 
                    "bg-red-100 text-red-700"}`}>
                  {d.grade}
                </span>
              </td>
              <td className="py-3 px-4">{d.operatorId}</td>
              <td className="py-3 px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm
                  ${d.status === "운행중" ? "bg-green-100 text-green-700" : d.status === "대기" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>
                  {d.status}
                </span>
              </td>
              <td className="py-3 px-4">
                <button
                  className="text-blue-600 hover:underline font-semibold"
                  onClick={() => openEditModal(d)}
                >
                  수정
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <AddDriverModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} />
      <EditDriverModal 
        open={editOpen} 
        onClose={() => setEditOpen(false)} 
        driver={selectedDriver}
        onEdit={handleEdit} 
      />
    </div>
  );
};

export default Drivers;