import React, { useState, useEffect } from "react";
import { useScheduleAPI } from "../../hooks/useScheduleAPI";

const BusSelector = ({ value, onChange, required = false, selectedDate, selectedTime }) => {
  const { fetchAvailableBuses } = useScheduleAPI();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 날짜/시간이 선택되었을 때 가용 버스 조회
  useEffect(() => {
    if (selectedDate && selectedTime) {
      loadAvailableBuses();
    } else {
      setBuses([]);
    }
  }, [selectedDate, selectedTime]);

  const loadAvailableBuses = async () => {
    setLoading(true);
    setError(null);
    try {
      // selectedDate와 selectedTime을 startTime, endTime 형식으로 변환
      const startTime = `${selectedDate}T${selectedTime}:00`;
      const endTime = `${selectedDate}T${selectedTime}:00`; // 임시로 같은 시간 사용
      
      const availableBuses = await fetchAvailableBuses(startTime, endTime);
      setBuses(availableBuses);
    } catch (err) {
      setError("가용 버스 조회에 실패했습니다.");
      setBuses([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 font-semibold">버스</label>
      {!selectedDate || !selectedTime ? (
        <div className="text-gray-400 text-sm py-2">날짜와 시간을 먼저 선택하세요</div>
      ) : loading ? (
        <div className="text-gray-400 text-sm py-2">가용 버스 조회 중...</div>
      ) : error ? (
        <div className="text-red-500 text-sm py-2">{error}</div>
      ) : (
        <select
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        >
          <option value="">버스를 선택하세요</option>
          {buses.map(bus => (
            <option key={bus.busId} value={bus.busId}>
              {bus.routeNumber}번 - {bus.vehicleNumber} ({bus.capacity}석)
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default BusSelector;
