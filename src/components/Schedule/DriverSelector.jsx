import { useMemo } from "react";
import dayjs from "dayjs";
import { useAvailableDrivers } from "../../hooks/QueryLayer/useDriver";
const DriverSelector = ({ value, onChange, required = false, selectedDate, selectedTime }) => {
  const { startTime, endTime } = useMemo(() => {
    if (!selectedDate || !selectedTime) return { startTime: null, endTime: null };
    // 시작 시점 객체 생성
    const start = dayjs(`${selectedDate}T${selectedTime}`);

    const end = start.add(3, "hour");

    return {
      startTime: start.format("YYYY-MM-DDTHH:mm:ss"),
      endTime: end.format("YYYY-MM-DDTHH:mm:ss")
    };
  }, [selectedDate, selectedTime]);
  const { data: drivers = [], isLoading: loading, isError: error } = useAvailableDrivers(startTime, endTime);



  return (
    <div className="mb-4">
      <label className="block mb-1 font-semibold">운전자</label>
      {!selectedDate || !selectedTime ? (
        <div className="text-gray-400 text-sm py-2">날짜와 시간을 먼저 선택하세요</div>
      ) : loading ? (
        <div className="text-gray-400 text-sm py-2">가용 운전자 조회 중...</div>
      ) : error ? (
        <div className="text-red-500 text-sm py-2">{error}</div>
      ) : (
        <select
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        >
          <option value="">운전자를 선택하세요</option>
          {drivers.map(driver => (
            <option key={driver.userId} value={driver.userId}>
              {driver.username} (면허: {driver.licenseNumber})
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default DriverSelector;
