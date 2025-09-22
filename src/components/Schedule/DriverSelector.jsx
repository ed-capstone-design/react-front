import React, { useState, useEffect } from "react";
import { useDriverAPI } from "../../hooks/useDriverAPI";

const DriverSelector = ({ value, onChange, required = false, selectedDate, selectedTime }) => {
  const { fetchAvailableDrivers } = useDriverAPI();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 날짜/시간이 선택되었을 때 가용 운전자 조회
  useEffect(() => {
    if (selectedDate && selectedTime) {
      loadAvailableDrivers();
    } else {
      setDrivers([]);
    }
  }, [selectedDate, selectedTime]);

  const loadAvailableDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const availableDrivers = await fetchAvailableDrivers(selectedDate, selectedTime);
      setDrivers(availableDrivers);
    } catch (err) {
      setError("가용 운전자 조회에 실패했습니다.");
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

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
