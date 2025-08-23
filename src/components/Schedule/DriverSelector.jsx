import React from "react";

const DriverSelector = ({ value, onChange, drivers, loading, required = false }) => {
  return (
    <div className="mb-4">
      <label className="block mb-1 font-semibold">운전자</label>
      {loading ? (
        <div className="text-gray-400 text-sm py-2">운전자 목록 로딩 중...</div>
      ) : (
        <select
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        >
          <option value="">운전자를 선택하세요</option>
          {drivers.map(driver => (
            <option key={driver.driverId} value={driver.driverId}>
              {driver.name} (ID: {driver.driverId})
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default DriverSelector;
