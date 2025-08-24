import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddSchedule from "../components/AddSchedule";
import { useToast } from "../components/Toast/ToastProvider";
import { useSchedule } from "../components/Schedule/ScheduleContext";

const OperatingSchedule = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailySchedules, setDailySchedules] = useState([]);
  const [dailyLoading, setDailyLoading] = useState(false);
  const toast = useToast();
  
  const { 
    loading, 
    addSchedule,
    updateSchedule,
    deleteSchedule,
    getDriverById,
    getBusById,
    fetchSchedulesByDate
  } = useSchedule();

  // 선택된 날짜의 스케줄 로드
  const loadSchedulesForDate = async (date) => {
    setDailyLoading(true);
    const schedules = await fetchSchedulesByDate(date);
    setDailySchedules(schedules);
    setDailyLoading(false);
  };

  useEffect(() => {
    loadSchedulesForDate(selectedDate);
  }, [selectedDate, fetchSchedulesByDate]);

  // 스케줄 추가 핸들러
  const handleAddSchedule = async (newSchedule) => {
    const result = await addSchedule(newSchedule);
    if (result.success) {
      toast.success("스케줄이 성공적으로 추가되었습니다.");
      setModalOpen(false);
      // 추가 후 해당 날짜 스케줄 다시 로드
      loadSchedulesForDate(selectedDate);
    } else {
      toast.error(result.error || "스케줄 추가에 실패했습니다.");
    }
  };

  // 스케줄 수정 핸들러
  const handleUpdateSchedule = async (dispatchId, scheduleData) => {
    const result = await updateSchedule(dispatchId, scheduleData);
    if (result.success) {
      toast.success("스케줄이 성공적으로 수정되었습니다.");
      setEditModalOpen(false);
      setEditingSchedule(null);
      // 수정 후 해당 날짜 스케줄 다시 로드
      loadSchedulesForDate(selectedDate);
    } else {
      toast.error(result.error || "스케줄 수정에 실패했습니다.");
    }
    return result;
  };

  // 수정 버튼 클릭 핸들러
  const handleEditClick = (schedule) => {
    setEditingSchedule(schedule);
    setEditModalOpen(true);
  };

  // 스케줄 삭제 핸들러
  const handleDeleteSchedule = async (dispatchId) => {
    if (window.confirm("정말로 이 스케줄을 삭제하시겠습니까?")) {
      const result = await deleteSchedule(dispatchId);
      if (result.success) {
        toast.success("스케줄이 성공적으로 삭제되었습니다.");
        // 삭제 후 해당 날짜 스케줄 다시 로드
        loadSchedulesForDate(selectedDate);
      } else {
        toast.error(result.error || "스케줄 삭제에 실패했습니다.");
      }
      return result;
    }
    return { success: false };
  };

  // 날짜 변경 핸들러
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  if (loading || dailyLoading) {
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
      
      {/* 날짜 필터 섹션 */}
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">날짜 선택:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <span className="font-medium">{selectedDate}</span> 
            <span>스케줄</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {dailySchedules.length}건
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-8">
        {dailySchedules.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              {selectedDate}에 등록된 스케줄이 없습니다.
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              첫 번째 스케줄 추가하기
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-3 text-gray-700 font-semibold text-sm w-24">날짜</th>
                  <th className="py-3 px-3 text-gray-700 font-semibold text-sm w-32">운전자</th>
                  <th className="py-3 px-3 text-gray-700 font-semibold text-sm w-28">버스</th>
                  <th className="py-3 px-3 text-gray-700 font-semibold text-sm w-20">예정출발</th>
                  <th className="py-3 px-3 text-gray-700 font-semibold text-sm w-20">실제출발</th>
                  <th className="py-3 px-3 text-gray-700 font-semibold text-sm w-20">실제도착</th>
                  <th className="py-3 px-3 text-gray-700 font-semibold text-sm w-20">상태</th>
                  <th className="py-3 px-3 text-gray-700 font-semibold text-sm w-16 text-center">경고</th>
                  <th className="py-3 px-3 text-gray-700 font-semibold text-sm w-16 text-center">점수</th>
                  <th className="py-3 px-3 text-gray-700 font-semibold text-sm w-32 text-center">작업</th>
                </tr>
              </thead>
              <tbody>
                {dailySchedules.map((item, idx) => (
                  <tr key={item.dispatchId || idx} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                    <td className="py-3 px-3 text-sm">{item.dispatchDate.slice(5)}</td>
                    <td className="py-3 px-3">
                      {getDriverById(item.driverId) ? (
                        <div>
                          <div className="font-medium text-sm">{getDriverById(item.driverId).driverName}</div>
                          <div className="text-xs text-gray-500">#{item.driverId}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">#{item.driverId}</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {getBusById(item.busId) ? (
                        <div>
                          <div className="font-medium text-sm">{getBusById(item.busId).vehicleNumber}</div>
                          <div className="text-xs text-gray-500">{getBusById(item.busId).routeNumber}번</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">#{item.busId}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-sm font-mono">{item.scheduledDeparture || "-"}</td>
                    <td className="py-3 px-3 text-sm font-mono">{item.actualDeparture || "-"}</td>
                    <td className="py-3 px-3 text-sm font-mono">{item.actualArrival || "-"}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                    <td className="py-3 px-3 text-center text-sm">{item.warningCount || 0}</td>
                    <td className="py-3 px-3 text-center text-sm">
                      {item.drivingScore ? `${item.drivingScore}점` : "-"}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1">
                        {/* 수정 버튼 - 예정된 스케줄만 */}
                        {item.status === "SCHEDULED" && (
                          <button
                            onClick={() => handleEditClick(item)}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            수정
                          </button>
                        )}
                        
                        {/* 삭제 버튼 - 완료되지 않은 스케줄만 */}
                        {item.status !== "COMPLETED" && (
                          <button
                            onClick={() => handleDeleteSchedule(item.dispatchId)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          >
                            삭제
                          </button>
                        )}
                        
                        {/* 상세보기 버튼 - 운행중이거나 완료된 스케줄만 */}
                        {(item.status === "RUNNING" || item.status === "COMPLETED") && (
                          <button
                            onClick={() => navigate(`/drivedetail/${item.dispatchId}`)}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                          >
                            상세보기
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {dailySchedules.length > 0 && (
          <div className="flex justify-end mt-8">
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow-sm hover:bg-blue-700 transition"
              onClick={() => setModalOpen(true)}
            >
              스케줄 추가
            </button>
          </div>
        )}
      </div>
      <AddSchedule
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddSchedule}
      />
      
      {/* 수정 모달 */}
      <AddSchedule
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingSchedule(null);
        }}
        onAdd={(scheduleData) => handleUpdateSchedule(editingSchedule?.dispatchId, scheduleData)}
        initialData={editingSchedule}
        isEdit={true}
      />
    </div>
  );
};

export default OperatingSchedule;