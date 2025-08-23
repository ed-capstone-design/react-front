import React from "react";
import { useBus } from "../Bus/BusContext";

const BusSelector = ({ value, onChange, required = false }) => {
  const { buses, loading } = useBus();

  return (
    <div className="mb-4">
      <label className="block mb-1 font-semibold">버스</label>
      {loading ? (
        <div className="text-gray-400 text-sm py-2">버스 목록 로딩 중...</div>
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
