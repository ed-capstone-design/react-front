import React, { useState, useEffect } from "react";
import AddSchedule from "../components/AddSchedule";
import { useToast } from "../components/Toast/ToastProvider";
import { useSchedule } from "../components/Schedule/ScheduleContext";

const OperatingSchedule = ({ onDriveDetail }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailySchedules, setDailySchedules] = useState([]);
  const [dailyLoading, setDailyLoading] = useState(false);
  const toast = useToast();
  
  const { 
    loading, 
    error,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    getDriverById,
    getBusById,
    fetchSchedulesByDate
  } = useSchedule();

  // 선택된 날짜의 스케줄 로드
  useEffect(() => {
    loadSchedulesForDate(selectedDate);
  }, [selectedDate]);

  const loadSchedulesForDate = async (date) => {
    setDailyLoading(true);
    const schedules = await fetchSchedulesByDate(date);
    setDailySchedules(schedules);
    setDailyLoading(false);
  };

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
      // 수정 후 해당 날짜 스케줄 다시 로드
      loadSchedulesForDate(selectedDate);
    } else {
      toast.error(result.error || "스케줄 수정에 실패했습니다.");
    }
    return result;
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
              {dailySchedules.map((item, idx) => (
                <tr key={item.dispatchId || idx} className="hover:bg-blue-50 transition rounded">
                  <td className="py-3 px-4">{item.dispatchDate}</td>
                  <td className="py-3 px-4">
                    {getDriverById(item.driverId) ? (
                      <div>
                        <div className="font-medium">{getDriverById(item.driverId).driverName}</div>
                        <div className="text-xs text-gray-500">ID: {item.driverId}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">ID: {item.driverId}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {getBusById(item.busId) ? (
                      <div>
                        <div className="font-medium">{getBusById(item.busId).vehicleNumber}</div>
                        <div className="text-xs text-gray-500">{getBusById(item.busId).routeNumber}번</div>
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
    </div>
  );
};

export default OperatingSchedule;