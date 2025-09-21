import React, { useState, useEffect } from "react";
import ScheduleModal from "./ScheduleModal";
import DriverSelector from "./DriverSelector";
import BusSelector from "./BusSelector";
import DateTimeInputs from "./DateTimeInputs";
import { useDriver } from "../Driver/DriverContext";
import { useBus } from "../Bus/BusContext";

const AddSchedule = ({ open, onClose, onAdd, initialData = null, isEdit = false }) => {
  const [driverId, setDriverId] = useState("");
  const [busId, setBusId] = useState("");
  const [dispatchDate, setDispatchDate] = useState("");
  const [scheduledDeparture, setScheduledDeparture] = useState("");

  const { drivers, loading: driversLoading, error: driversError } = useDriver();
  const { buses, loading: busesLoading, error: busesError } = useBus();

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
      {(driversError || busesError) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{driversError || busesError}</p>
        </div>
      )}

      <DriverSelector
        value={driverId}
        onChange={setDriverId}
        drivers={drivers}
        loading={driversLoading}
        required
      />

      <BusSelector
        value={busId}
        onChange={setBusId}
        buses={buses}
        loading={busesLoading}
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
