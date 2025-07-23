import React, { useState } from "react";

const AddSchedule = ({ open, onClose, onAdd }) => {
  const [driverId, setDriverId] = useState("");
  const [busId, setBusId] = useState("");
  const [dispatchDate, setDispatchDate] = useState("");
  const [scheduledDeparture, setScheduledDeparture] = useState("");

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
          <label className="block mb-1 font-semibold">운전자 ID</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">버스 ID</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            value={busId}
            onChange={(e) => setBusId(e.target.value)}
            required
          />
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

