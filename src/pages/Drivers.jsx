import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDriverAPI } from "../hooks/useDriverAPI";
// import AddDriverModal from "../components/Driver/AddDriverModal";
import EditDriverModal from "../components/Driver/EditDriverModal";


const Drivers = () => {
  const navigate = useNavigate();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  
  // useDriverAPI 훅 사용하여 독립적 데이터 관리
  const { drivers, loading, error, fetchDrivers, updateDriver } = useDriverAPI();

  // 컴포넌트 마운트 시 운전자 목록 로드
  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // 수정 모달 열기
  const openEditModal = (driver) => {
    setSelectedDriver(driver);
    setEditOpen(true);
  };

  // 운전자 행 클릭 시 유저 디테일 페이지로 이동
  const handleRowClick = (driver) => {
    navigate(`/userdetailpage/${driver.userId}`);
  };

  // 수정 완료 후 콜백
  const handleUpdateSuccess = () => {
    setEditOpen(false);
    setSelectedDriver(null);
    // 목록 새로고침
    fetchDrivers();
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-8 text-gray-900">운전자 관리</h2>
      
      {/* 로딩 및 에러 상태 표시 */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">운전자 목록을 불러오는 중...</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">오류: {error}</p>
        </div>
      )}
      
      {/* <div className="flex justify-end mb-2">
        <button onClick={() => setAddOpen(true)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold">+ 운전자 추가</button>
      </div> */}
      
      {!loading && (
        <table className="w-full bg-white border border-gray-100 rounded-lg shadow-sm text-left">
          <thead>
            <tr>
              <th className="py-3 px-4 text-gray-600">이름</th>
              <th className="py-3 px-4 text-gray-600">면허번호</th>
              <th className="py-3 px-4 text-gray-600">경력(년)</th>
              <th className="py-3 px-4 text-gray-600">평균점수</th>
              <th className="py-3 px-4 text-gray-600">등급</th>
              <th className="py-3 px-4 text-gray-600">수정</th>
            </tr>
          </thead>
          <tbody>
            {drivers.length === 0 && !error ? (
              <tr>
                <td colSpan="6" className="py-8 px-4 text-center text-gray-500">
                  등록된 운전자가 없습니다.
                </td>
              </tr>
            ) : (
              drivers.map((d, idx) => (
                <tr 
                  key={d.userId || idx} 
                  className="hover:bg-blue-50 transition cursor-pointer"
                  onClick={() => handleRowClick(d)}
              >
                <td className="py-3 px-4 text-gray-900">{d.username}</td>
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

                <td className="py-3 px-4">
                  <button
                    className="text-blue-600 hover:underline font-semibold"
                    onClick={(e) => {
                      e.stopPropagation(); // 행 클릭 이벤트 전파 방지
                      openEditModal(d);
                    }}
                  >
                    수정
                  </button>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      )}

      <EditDriverModal 
        open={editOpen} 
        onClose={() => setEditOpen(false)} 
        driver={selectedDriver}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  );
};

export default Drivers;