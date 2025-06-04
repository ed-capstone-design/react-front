import React, { useState } from "react";
import { IoPersonCircle } from "react-icons/io5";

const UserDetailModal = ({ open, onClose, onEdit, user = {} }) => {
  // 예시: user prop이 없으면 기본값 사용
  const [name, setName] = useState(user.name || "홍길동");
  const [email, setEmail] = useState(user.email || "hong@example.com");
  const [status, setStatus] = useState(user.status || "활성");
  const [routes, setRoutes] = useState(user.routes || "101번, 202번");
  const [joinDate, setJoinDate] = useState(user.joinDate || "2024-01-01");

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // 수정된 정보 onEdit로 전달
    onEdit && onEdit({ name, email, status, routes, joinDate });
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
        <div className="flex flex-col items-center mb-6">
          <IoPersonCircle className="text-blue-500 text-6xl mb-2 drop-shadow" />
          <input
            className="text-2xl font-extrabold text-blue-700 mb-1 text-center bg-transparent border-b-2 border-blue-100 focus:border-blue-400 outline-none transition"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={10}
          />
          <input
            className="text-gray-500 text-sm text-center bg-transparent border-b border-blue-100 focus:border-blue-400 outline-none transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
        </div>
        <div className="divide-y divide-blue-100 mb-6">
          <div className="py-3 flex justify-between items-center">
            <span className="font-semibold text-blue-700">가입일</span>
            <input
              className="text-gray-700 text-right bg-transparent border-b border-blue-100 focus:border-blue-400 outline-none transition w-32"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
              type="date"
            />
          </div>
          <div className="py-3 flex justify-between items-center">
            <span className="font-semibold text-blue-700">상태</span>
            <select
              className="text-green-600 font-bold bg-transparent border-b border-blue-100 focus:border-blue-400 outline-none transition"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="활성">활성</option>
              <option value="비활성">비활성</option>
            </select>
          </div>
          <div className="py-3 flex justify-between items-center">
            <span className="font-semibold text-blue-700">최근 이용 노선</span>
            <input
              className="text-gray-700 text-right bg-transparent border-b border-blue-100 focus:border-blue-400 outline-none transition w-32"
              value={routes}
              onChange={(e) => setRoutes(e.target.value)}
              placeholder="예: 101번, 202번"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full mt-2 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
        >
          저장
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

export default UserDetailModal;