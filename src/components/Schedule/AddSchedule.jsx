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
  const [scheduledArrival, setScheduledArrival] = useState("");

  // 수정 모드일 때 초기 데이터 설정
  useEffect(() => {
    if (isEdit && initialData) {
      setDriverId(initialData.driverId ? String(initialData.driverId) : "");
      setBusId(initialData.busId ? String(initialData.busId) : "");
      setDispatchDate(initialData.dispatchDate || "");
      
      // scheduledDepartureTime에서 시간 부분만 추출 (2024-09-24T14:30:00 -> 14:30)
      if (initialData.scheduledDepartureTime) {
        const timePart = initialData.scheduledDepartureTime.split('T')[1];
        if (timePart) {
          setScheduledDeparture(timePart.substring(0, 5)); // HH:MM 형식
        }
      }
      
      // scheduledArrivalTime에서 시간 부분만 추출
      if (initialData.scheduledArrivalTime) {
        const timePart = initialData.scheduledArrivalTime.split('T')[1];
        if (timePart) {
          setScheduledArrival(timePart.substring(0, 5)); // HH:MM 형식
        }
      }
    } else if (!isEdit) {
      // 추가 모드일 때는 폼 초기화
      resetForm();
    }
  }, [isEdit, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!driverId || !busId || !dispatchDate || !scheduledDeparture || !scheduledArrival) return;
    
    // 날짜와 시간을 ISO DateTime 형식으로 결합
    const scheduledDepartureDateTime = `${dispatchDate}T${scheduledDeparture}:00`;
    const scheduledArrivalDateTime = `${dispatchDate}T${scheduledArrival}:00`;
    
    console.log('📝 [AddSchedule] 폼 데이터:', {
      driverId: Number(driverId),
      busId: Number(busId),
      dispatchDate,
      scheduledDepartureTime: scheduledDepartureDateTime,
      scheduledArrivalTime: scheduledArrivalDateTime
    });
    
    onAdd && onAdd({
      driverId: Number(driverId),
      busId: Number(busId),
      dispatchDate,
      scheduledDepartureTime: scheduledDepartureDateTime,
      scheduledArrivalTime: scheduledArrivalDateTime
    });

    // 폼 초기화
    resetForm();
  };

  const resetForm = () => {
    setDriverId("");
    setBusId("");
    setDispatchDate("");
    setScheduledDeparture("");
    setScheduledArrival("");
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
        scheduledArrival={scheduledArrival}
        onScheduledArrivalChange={setScheduledArrival}
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
