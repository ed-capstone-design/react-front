import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddSchedule from "../components/Schedule/AddSchedule";
import { useToast } from "../components/Toast/ToastProvider";
import { useScheduleAPI } from "../hooks/useScheduleAPI";
import dayjs from "dayjs";

const OperatingSchedule = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [period, setPeriod] = useState({
    start: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    end: dayjs().add(1, 'day').format('YYYY-MM-DD')
  });
  const [periodSchedules, setPeriodSchedules] = useState([]);
  const [periodLoading, setPeriodLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState(["RUNNING", "SCHEDULED", "DELAYED"]);

  const toast = useToast();
  
  const {
    addSchedule,
    updateSchedule,
    deleteSchedule,
    fetchSchedulesByPeriod
  } = useScheduleAPI();

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // 시간 추출 함수 (2024-09-24T14:30:00 -> 14:30)
  const extractTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    try {
      // ISO 형식에서 시간 부분만 추출
      const timePart = dateTimeString.split('T')[1];
      if (timePart) {
        return timePart.substring(0, 5); // HH:MM 형식
      }
      return '-';
    } catch (error) {
      return '-';
    }
  };

  // 상태 체크박스 목록
  const statusOptions = [
    { value: "SCHEDULED", label: "예정" },
    { value: "DELAYED", label: "지연" },
    { value: "RUNNING", label: "운행중" },
    { value: "COMPLETED", label: "완료" },
    { value: "CANCELED", label: "취소" }, // CANCELLED → CANCELED로 변경
  ];

  // 기간 내 스케줄 불러오기
  useEffect(() => {
    const load = async () => {
      try {
        setPeriodLoading(true);
        setFetchError(null);
        
        // statusFilter를 API 파라미터로 전달
        const data = await fetchSchedulesByPeriod(period.start, period.end, statusFilter);
        setPeriodSchedules(data);
      } catch (error) {
        console.error('스케줄 로드 실패:', error);
        setFetchError(error.message || '스케줄을 불러올 수 없습니다.');
        toast.error('스케줄을 불러올 수 없습니다.');
      } finally {
        setPeriodLoading(false);
      }
    };
    load();
  }, [period.start, period.end, statusFilter]); // statusFilter 의존성 추가

  // 스케줄 추가 핸들러
  const handleAddSchedule = async (newSchedule) => {
    try {
      setLoading(true);
      await addSchedule(newSchedule);
      toast.success("스케줄이 성공적으로 추가되었습니다.");
      setModalOpen(false);
      // 추가 후 해당 기간 스케줄 다시 로드
      const data = await fetchSchedulesByPeriod(period.start, period.end, statusFilter);
      setPeriodSchedules(data);
    } catch (error) {
      console.error('스케줄 추가 실패:', error);
      toast.error(error.message || "스케줄 추가에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 스케줄 수정 핸들러 (취소 후 재생성 방식)
  const handleUpdateSchedule = async (dispatchId, scheduleData) => {
    try {
      setLoading(true);
      console.log('📝 [OperatingSchedule] 스케줄 수정 시작 - 취소 후 재생성:', { dispatchId, scheduleData });
      
      // 1. 기존 배차 취소
      await deleteSchedule(dispatchId);
      console.log('✅ [OperatingSchedule] 기존 배차 취소 완료:', dispatchId);
      
      // 2. 새로운 배차 생성
      await addSchedule(scheduleData);
      console.log('✅ [OperatingSchedule] 새로운 배차 생성 완료:', scheduleData);
      
      toast.success("스케줄이 성공적으로 수정되었습니다.");
      setEditModalOpen(false);
      setEditingSchedule(null);
      
      // 수정 후 해당 기간 스케줄 다시 로드
      const data = await fetchSchedulesByPeriod(period.start, period.end, statusFilter);
      setPeriodSchedules(data);
      return { success: true };
    } catch (error) {
      console.error('스케줄 수정 실패:', error);
      toast.error(error.message || "스케줄 수정에 실패했습니다.");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // 수정 버튼 클릭 핸들러
  const handleEditClick = (schedule) => {
    setEditingSchedule(schedule);
    setEditModalOpen(true);
  };

  // 스케줄 삭제 핸들러
  const handleDeleteSchedule = async (dispatchId) => {
    if (window.confirm("정말로 이 스케줄을 삭제하시겠습니까?")) {
      try {
        setLoading(true);
        await deleteSchedule(dispatchId);
        toast.success("스케줄이 성공적으로 삭제되었습니다.");
        // 삭제 후 해당 기간 스케줄 다시 로드
        const data = await fetchSchedulesByPeriod(period.start, period.end, statusFilter);
        setPeriodSchedules(data);
        return { success: true };
      } catch (error) {
        console.error('스케줄 삭제 실패:', error);
        toast.error(error.message || "스케줄 삭제에 실패했습니다.");
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    }
    return { success: false };
  };

  // 체크박스 핸들러
  const handleStatusChange = (value) => {
    setStatusFilter(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  // 서버에서 필터링된 데이터를 바로 사용 (클라이언트 사이드 필터링 제거)
  const filteredSchedules = periodSchedules;

  // 조회 버튼을 눌러야만 리스트가 갱신되도록 변경
  const [pendingPeriod, setPendingPeriod] = useState({
    start: period.start,
    end: period.end
  });
  const [pendingStatusFilter, setPendingStatusFilter] = useState([...statusFilter]);

  // 조회 버튼 클릭 시 실제 필터 적용
  const handleSearch = () => {
    setPeriod({ ...pendingPeriod });
    setStatusFilter([...pendingStatusFilter]);
  };

  if (loading || periodLoading) {
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
      {fetchError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200 text-center font-semibold">
          {fetchError}
        </div>
      )}
      <h2 className="text-2xl font-bold mb-8 text-gray-900 tracking-tight">운행 스케줄</h2>
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* 기간 선택 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">기간:</label>
            <input 
              type="date" 
              value={pendingPeriod.start} 
              onChange={e => setPendingPeriod(p => ({...p, start: e.target.value}))} 
              className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" 
            />
            <span className="text-gray-400">~</span>
            <input 
              type="date" 
              value={pendingPeriod.end} 
              onChange={e => setPendingPeriod(p => ({...p, end: e.target.value}))} 
              className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" 
            />
          </div>
          
          {/* 상태 필터 - 컴팩트한 태그 스타일 */}
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">상태:</label>
            {statusOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPendingStatusFilter(prev => prev.includes(opt.value) ? prev.filter(v => v !== opt.value) : [...prev, opt.value])}
                className={`px-2 py-1 text-xs rounded-full border transition-all duration-200 ${
                  pendingStatusFilter.includes(opt.value)
                    ? 'bg-blue-100 border-blue-300 text-blue-700 shadow-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          
          {/* 조회 버튼 */}
          <button
            onClick={handleSearch}
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
          >
            조회
          </button>
        </div>
      </div>
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-8">
        {filteredSchedules.length > 0 && (
          <div className="flex justify-end mt-2 mb-6">
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow-sm hover:bg-blue-700 transition"
              onClick={() => setModalOpen(true)}
            >
              스케줄 추가
            </button>
          </div>
        )}
        {filteredSchedules.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              선택한 기간에 등록된 스케줄이 없습니다.
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              첫 번째 스케줄 추가하기
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-2 sm:px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                      <th className="py-3 px-2 sm:px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">운전자</th>
                      <th className="py-3 px-2 sm:px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">버스</th>
                      <th className="py-3 px-2 sm:px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예정출발</th>
                      <th className="hidden md:table-cell py-3 px-2 sm:px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예정도착</th>
                      <th className="hidden lg:table-cell py-3 px-2 sm:px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">실제출발</th>
                      <th className="hidden lg:table-cell py-3 px-2 sm:px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">실제도착</th>
                      <th className="py-3 px-2 sm:px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                      <th className="hidden xl:table-cell py-3 px-2 sm:px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">경고</th>
                      <th className="hidden xl:table-cell py-3 px-2 sm:px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">점수</th>
                      <th className="py-3 px-2 sm:px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSchedules.map((item, idx) => (
                      <tr key={item.dispatchId || idx} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 px-2 sm:px-3 text-sm text-gray-900">
                          {item.dispatchDate ? (item.dispatchDate.replace(/-/g, ". ") + ".") : '-'}
                        </td>
                        <td className="py-4 px-2 sm:px-3 text-sm">
                          <div className="font-medium text-gray-900">{item.driverName || `#${item.driverId}` || '-'}</div>
                        </td>
                        <td className="py-4 px-2 sm:px-3 text-sm">
                          <div className="font-medium text-gray-900">{item.vehicleNumber || `#${item.busId}` || '-'}</div>
                          <div className="text-xs text-gray-500">{item.routeNumber ? item.routeNumber + '번' : '-'}</div>
                        </td>
                        <td className="whitespace-nowrap py-4 px-2 sm:px-3 text-sm font-mono text-gray-900">
                          {extractTime(item.scheduledDepartureTime)}
                        </td>
                        <td className="hidden md:table-cell whitespace-nowrap py-4 px-2 sm:px-3 text-sm font-mono text-gray-900">
                          {extractTime(item.scheduledArrivalTime)}
                        </td>
                        <td className="hidden lg:table-cell whitespace-nowrap py-4 px-2 sm:px-3 text-sm font-mono text-gray-900">
                          {extractTime(item.actualDeparture)}
                        </td>
                        <td className="hidden lg:table-cell whitespace-nowrap py-4 px-2 sm:px-3 text-sm font-mono text-gray-900">
                          {extractTime(item.actualArrival)}
                        </td>
                        <td className="py-4 px-2 sm:px-3 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                            item.status === "RUNNING" ? "bg-blue-100 text-blue-800" :
                            item.status === "SCHEDULED" ? "bg-gray-100 text-gray-800" :
                            item.status === "DELAYED" ? "bg-orange-100 text-orange-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {item.status === "COMPLETED" ? "완료" :
                             item.status === "RUNNING" ? "운행중" :
                             item.status === "SCHEDULED" ? "예정" :
                             item.status === "DELAYED" ? "지연" : 
                             item.status === "CANCELED" ? "취소" :
                             (item.status || '-')}
                          </span>
                        </td>
                        <td className="hidden xl:table-cell py-4 px-2 sm:px-3 text-sm text-center text-gray-900">
                          {item.warningCount ?? 0}
                        </td>
                        <td className="hidden xl:table-cell py-4 px-2 sm:px-3 text-sm text-center text-gray-900">
                          {item.drivingScore ? `${item.drivingScore}점` : "-"}
                        </td>
                        <td className="py-4 px-2 sm:px-3 text-sm">
                          <div className="flex items-center justify-center gap-1 sm:gap-2">
                            {/* 상태가 예정(SCHEDULED) 또는 지연(DELAYED)일 때만 수정/삭제 */}
                            {(item.status === "SCHEDULED" || item.status === "DELAYED") && (
                              <>
                                <button
                                  onClick={() => handleEditClick(item)}
                                  className="px-2 sm:px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                >
                                  <span className="hidden sm:inline">수정</span>
                                  <span className="sm:hidden">✏️</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteSchedule(item.dispatchId)}
                                  className="px-2 sm:px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                >
                                  <span className="hidden sm:inline">삭제</span>
                                  <span className="sm:hidden">🗑️</span>
                                </button>
                              </>
                            )}
                            {/* 상태가 완료(COMPLETED)일 때만 상세보기 */}
                            {item.status === "COMPLETED" && (
                              <button
                                onClick={() => navigate(`/drivedetail/${item.dispatchId}`)}
                                className="px-2 sm:px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                              >
                                <span className="hidden sm:inline">상세보기</span>
                                <span className="sm:hidden">📋</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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