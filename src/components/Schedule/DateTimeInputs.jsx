import React from "react";

const DateTimeInputs = ({ 
  dispatchDate, 
  onDispatchDateChange, 
  scheduledDeparture, 
  onScheduledDepartureChange,
  required = false 
}) => {
  return (
    <>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">배차일</label>
        <input
          type="date"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={dispatchDate}
          onChange={(e) => onDispatchDateChange(e.target.value)}
          required={required}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">예정 출발</label>
        <input
          type="time"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={scheduledDeparture}
          onChange={(e) => onScheduledDepartureChange(e.target.value)}
          required={required}
        />
      </div>
    </>
  );
};

export default DateTimeInputs;
