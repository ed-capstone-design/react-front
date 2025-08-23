import React, { useState } from "react";
import ScheduleModal from "./Schedule/ScheduleModal";
import DriverSelector from "./Schedule/DriverSelector";
import BusSelector from "./Schedule/BusSelector";
import DateTimeInputs from "./Schedule/DateTimeInputs";
import { useSchedule } from "./Schedule/ScheduleContext";

const AddSchedule = ({ open, onClose, onAdd }) => {
  const [driverId, setDriverId] = useState("");
  const [busId, setBusId] = useState("");
  const [dispatchDate, setDispatchDate] = useState("");
  const [scheduledDeparture, setScheduledDeparture] = useState("");

  const { drivers, error } = useSchedule();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!driverId || !busId || !dispatchDate || !scheduledDeparture) return;
    
    onAdd && onAdd({
      driverId: Number(driverId),
      busId: Number(busId),
      dispatchDate,
      scheduledDeparture,
      actualDeparture: null,
      actualArrival: null,
    });

    // 폼 초기화
    resetForm();
  };

  const resetForm = () => {
    setDriverId("");
    setBusId("");
    setDispatchDate("");
    setScheduledDeparture("");
  };

  const handleClose = () => {
    resetForm();
    onClose && onClose();
  };

  return (
    <ScheduleModal 
      open={open} 
      onClose={handleClose} 
      title="스케줄 추가"
      onSubmit={handleSubmit}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <DriverSelector
        value={driverId}
        onChange={setDriverId}
        drivers={drivers}
        loading={false}
        required
      />

      <BusSelector
        value={busId}
        onChange={setBusId}
        required
      />

      <DateTimeInputs
        dispatchDate={dispatchDate}
        onDispatchDateChange={setDispatchDate}
        scheduledDeparture={scheduledDeparture}
        onScheduledDepartureChange={setScheduledDeparture}
        required
      />
    </ScheduleModal>
  );
};

export default AddSchedule;

