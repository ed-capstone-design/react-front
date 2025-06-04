import React, { useState } from "react";

const AddSchedule = ({ onAdd }) => {
  const [route, setRoute] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [status, setStatus] = useState("대기");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!route || !start || !end) return;
    onAdd && onAdd({ route, start, end, status });
    setRoute("");
    setStart("");
    setEnd("");
    setStatus("대기");
  };

  return (
    <form
      className="bg-white rounded-xl shadow p-6 max-w-md mx-auto mt-10"
      onSubmit={handleSubmit}
    >
      <h2 className="text-xl font-bold mb-6">운행 스케줄 추가</h2>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">노선</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={route}
          onChange={(e) => setRoute(e.target.value)}
          placeholder="예: 101번"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">출발 시간</label>
        <input
          type="time"
          className="w-full border rounded px-3 py-2"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">도착 시간</label>
        <input
          type="time"
          className="w-full border rounded px-3 py-2"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
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
        className="w-full py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
      >
        추가
      </button>
    </form>
  );
};

export default AddSchedule;

