import React, { useState, useEffect } from "react";
import axios from "axios";

const AddSchedule = ({ open, onClose, onAdd }) => {
  const [driverId, setDriverId] = useState("");
  const [busId, setBusId] = useState("");
  const [dispatchDate, setDispatchDate] = useState("");
  const [scheduledDeparture, setScheduledDeparture] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [driversRes, busesRes] = await Promise.all([
        axios.get("/api/drivers"),
        axios.get("/api/buses")
      ]);
      setDrivers(driversRes.data);
      setBuses(busesRes.data);
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

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
      // 상태, 경고수, 운행점수는 기본값으로 전달하지 않음
    });
    setDriverId("");
    setBusId("");
    setDispatchDate("");
    setScheduledDeparture("");
    onClose && onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative animate-fade-in"
        onSubmit={handleSubmit}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 text-3xl transition"
          onClick={onClose}
          type="button"
          aria-label="닫기"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-6 text-blue-700">스케줄 추가</h2>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">운전자</label>
          {loading ? (
            <div className="text-gray-400 text-sm py-2">운전자 목록 로딩 중...</div>
          ) : (
            <select
              className="w-full border rounded px-3 py-2"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              required
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
        <div className="mb-4">
          <label className="block mb-1 font-semibold">버스</label>
          {loading ? (
            <div className="text-gray-400 text-sm py-2">버스 목록 로딩 중...</div>
          ) : (
            <select
              className="w-full border rounded px-3 py-2"
              value={busId}
              onChange={(e) => setBusId(e.target.value)}
              required
            >
              <option value="">버스를 선택하세요</option>
              {buses.map(bus => (
                <option key={bus.busId} value={bus.busId}>
                  {bus.plateNumber} ({bus.busNumber}번)
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">배차일</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={dispatchDate}
            onChange={(e) => setDispatchDate(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">예정 출발</label>
          <input
            type="time"
            className="w-full border rounded px-3 py-2"
            value={scheduledDeparture}
            onChange={(e) => setScheduledDeparture(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
        >
          추가
        </button>
      </form>
      <style>{`
        .animate-fade-in {
          animation: fade-in 0.25s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
};

export default AddSchedule;

