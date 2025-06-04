import React, { useState } from "react";
import { IoPersonCircle } from "react-icons/io5";

const UserDetailPage = () => {
  const [name, setName] = useState("홍길동");
  const [email, setEmail] = useState("hong@example.com");
  const [joinDate, setJoinDate] = useState("2024-01-01");
  const [status, setStatus] = useState("활성");
  const [routes, setRoutes] = useState("101번, 202번");

  const dispatchHistory = [
    { date: "2024-05-01", route: "101번", time: "08:00~09:00", status: "운행완료" },
    { date: "2024-05-02", route: "202번", time: "09:00~10:00", status: "운행완료" },
    { date: "2024-05-03", route: "101번", time: "08:00~09:00", status: "운행중" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("저장되었습니다!");
  };

  // 삭제 처리 함수
  const handleDelete = () => {
    if (window.confirm('정말로 사용자를 삭제하시겠습니까?')) {
      alert('사용자가 삭제되었습니다.');
      setName("");
      setEmail("");
      setJoinDate("");
      setStatus("비활성");
      setRoutes("");
      // TODO: 실제 삭제 처리(예: 페이지 이동, API 호출 등)
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {/* 프로필 카드 */}
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm flex items-center gap-6 p-8 mb-4">
        <IoPersonCircle className="text-blue-500 text-7xl drop-shadow" />
        <div>
          <div className="text-2xl font-extrabold text-gray-900 mb-1">{name}</div>
          <div className="text-gray-500 text-sm mb-1">{email}</div>
          <div className="flex gap-2 text-xs">
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">가입일: {joinDate}</span>
            <span className={`px-2 py-1 rounded ${status === "활성" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>{status}</span>
          </div>
        </div>
      </div>
      {/* 정보 수정 폼 */}
      <form
        className="bg-white border border-gray-100 rounded-lg shadow-sm p-8 flex flex-col gap-5 mb-8"
        onSubmit={handleSubmit}
      >
        <h3 className="text-xl font-bold text-gray-900 mb-2">기본 정보 수정</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block font-semibold mb-1">이름</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={10}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">이메일</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">가입일</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={joinDate}
              onChange={e => setJoinDate(e.target.value)}
              type="date"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">상태</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="활성">활성</option>
              <option value="비활성">비활성</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1">최근 운행 노선</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={routes}
            onChange={e => setRoutes(e.target.value)}
            placeholder="예: 101번, 202번"
          />
        </div>
        <button
          type="submit"
          className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          저장
        </button>
        
      </form>

      {/* 배차 내역 */}
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">배차 내역</h3>
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="py-2 px-4 text-gray-600">날짜</th>
              <th className="py-2 px-4 text-gray-600">노선</th>
              <th className="py-2 px-4 text-gray-600">시간</th>
              <th className="py-2 px-4 text-gray-600">상태</th>
            </tr>
          </thead>
          <tbody>
            {dispatchHistory.map((item, idx) => (
              <tr key={idx} className="hover:bg-blue-50 transition rounded">
                <td className="py-2 px-4 rounded-l">{item.date}</td>
                <td className="py-2 px-4">{item.route}</td>
                <td className="py-2 px-4">{item.time}</td>
                <td className="py-2 px-4 rounded-r">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === "운행중" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserDetailPage;