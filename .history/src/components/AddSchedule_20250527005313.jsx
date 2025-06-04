import React, { useState } from "react";

const AddSchedule = ({ open, onClose, onAdd }) => {
  const [route, setRoute] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [status, setStatus] = useState("대기");

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!route || !start || !end) return;
    onAdd && onAdd({ route, start, end, status });
    setRoute("");
    setStart("");
    setEnd("");
    setStatus("대기");
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
          <label className="block mb-1 font-semibold">노선</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            placeholder="예: 101번"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">출발 시간</label>
          <input
            type="time"
            className="w-full border rounded px-3 py-2"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">도착 시간</label>
          <input
            type="time"
            className="w-full border rounded px-3 py-2"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-semibold">상태</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="대기">대기</option>
            <option value="운행중">운행중</option>
          </select>
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


