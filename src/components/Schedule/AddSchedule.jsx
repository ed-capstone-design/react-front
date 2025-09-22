import React, { useState, useEffect } from "react";
import ScheduleModal from "./ScheduleModal";
import DriverSelector from "./DriverSelector";
import BusSelector from "./BusSelector";
import DateTimeInputs from "./DateTimeInputs";

const AddSchedule = ({ open, onClose, onAdd, initialData = null, isEdit = false }) => {
  const [driverId, setDriverId] = useState("");
  const [busId, setBusId] = useState("");
  const [dispatchDate, setDispatchDate] = useState("");
  const [scheduledDeparture, setScheduledDeparture] = useState("");

  // 수정 모드일 때 초기 데이터 설정
  useEffect(() => {
    if (isEdit && initialData) {
      setDriverId(initialData.driverId ? String(initialData.driverId) : "");
      setBusId(initialData.busId ? String(initialData.busId) : "");
      setDispatchDate(initialData.dispatchDate || "");
      setScheduledDeparture(initialData.scheduledDeparture || "");
    } else if (!isEdit) {
      // 추가 모드일 때는 폼 초기화
      resetForm();
    }
  }, [isEdit, initialData]);

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
      title={isEdit ? "스케줄 수정" : "스케줄 추가"}
      onSubmit={handleSubmit}
      isEdit={isEdit}
    >
      <DateTimeInputs
        dispatchDate={dispatchDate}
        onDispatchDateChange={setDispatchDate}
        scheduledDeparture={scheduledDeparture}
        onScheduledDepartureChange={setScheduledDeparture}
        required
      />

      <DriverSelector
        value={driverId}
        onChange={setDriverId}
        selectedDate={dispatchDate}
        selectedTime={scheduledDeparture}
        required
      />

      <BusSelector
        value={busId}
        onChange={setBusId}
        selectedDate={dispatchDate}
        selectedTime={scheduledDeparture}
        required
      />
    </ScheduleModal>
  );
};

export default AddSchedule;
