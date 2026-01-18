import { useMemo } from "react";
import dayjs from "dayjs";
import { useAvailableBuses } from "../../hooks/QueryLayer/useBus";

const BusSelector = ({ value, onChange, required = false, selectedDate, selectedTime }) => {
  // 1. 시간 계산 로직: 가독성을 위해 format 문자열 상수로 관리 가능
  const { startTime, endTime } = useMemo(() => {
    if (!selectedDate || !selectedTime) return { startTime: null, endTime: null };

    const start = dayjs(`${selectedDate}T${selectedTime}`);
    const end = start.add(3, "hour"); // 3시간 고정 정책 적용

    return {
      startTime: start.format("YYYY-MM-DDTHH:mm:ss"),
      endTime: end.format("YYYY-MM-DDTHH:mm:ss")
    };
  }, [selectedDate, selectedTime]);

  // 2. 쿼리 실행: startTime이 있을 때만 동작하도록 이미 useAvailableBuses 내부에 enabled 처리가 되어있어야 함
  const {
    data: buses = [],
    isLoading: loading,
    isError,
    error
  } = useAvailableBuses(startTime, endTime);

  return (
    <div className="mb-4 text-left"> {/* 텍스트 정렬 명시 */}
      <label className="block mb-1 font-semibold text-gray-700 text-sm">버스 선택</label>

      {!selectedDate || !selectedTime ? (
        <div className="bg-gray-50 text-gray-400 text-xs py-2.5 px-3 border border-dashed rounded-lg">
          날짜와 시간을 먼저 선택하면 가용 버스가 표시됩니다.
        </div>
      ) : loading ? (
        <div className="flex items-center space-x-2 text-blue-500 text-xs py-2 px-1">
          <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span>가용 버스 조회 중...</span>
        </div>
      ) : isError ? (
        <div className="text-red-500 text-xs py-2 px-1">
          ⚠️ {error?.response?.data?.message || "가용 버스 조회 실패"}
        </div>
      ) : (
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        >
          <option value="">버스를 선택하세요</option>
          {buses.length > 0 ? (
            buses.map((bus) => (
              <option key={bus.busId} value={bus.busId}>
                {bus.routeNumber}번 - {bus.vehicleNumber} ({bus.capacity}석)
              </option>
            ))
          ) : (
            <option disabled>해당 시간대에 선택 가능한 버스가 없습니다.</option>
          )}
        </select>
      )}
    </div>
  );
};

export default BusSelector;