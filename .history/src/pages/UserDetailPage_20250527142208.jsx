import React, { useState } from "react";

const UserDetailPage = () => {
  const [name, setName] = useState("홍길동");
  const [email, setEmail] = useState("hong@example.com");
  const [joinDate, setJoinDate] = useState("2024-01-01");
  const [status, setStatus] = useState("활성");
  const [routes, setRoutes] = useState("101번, 202번");

  const handleSubmit = (e) => {
    e.preventDefault();
    // 여기서 서버로 수정 요청을 보낼 수 있습니다.
    alert("저장되었습니다!");
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">사용자 정보 수정</h2>
      <form
        className="bg-white rounded-2xl shadow p-8 flex flex-col gap-5"
        onSubmit={handleSubmit}
      >
        <div>
          <label className="block font-semibold mb-1">이름</label>
          <input
            className="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={10}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">이메일</label>
          <input
            className="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">가입일</label>
          <input
            className="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-400"
            value={joinDate}
            onChange={(e) => setJoinDate(e.target.value)}
            type="date"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">상태</label>
          <select
            className="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-400"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="활성">활성</option>
            <option value="비활성">비활성</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">최근 운행 노선</label>
          <input
            className="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-400"
            value={routes}
            onChange={(e) => setRoutes(e.target.value)}
            placeholder="예: 101번, 202번"
          />
        </div>
        <button
          type="submit"
          className="w-full mt-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
        >
          저장
        </button>
      </form>
    </div>
  );
};

export default UserDetailPage;
