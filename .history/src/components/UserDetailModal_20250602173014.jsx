import React, { useState, useEffect } from "react";
import { IoPersonCircle } from "react-icons/io5";

const UserDetailModal = ({ open, onClose, user, onEdit, onDelete }) => {
  const [memo, setMemo] = useState("");
  const [memoSent, setMemoSent] = useState(false);

  useEffect(() => {
    setMemo("");
    setMemoSent(false);
  }, [user, open]);

  if (!open) return null;

  const handleSendMemo = () => {
    if (memo.trim() === "") return;
    setMemoSent(true);
    // 실제로는 서버로 전송하는 로직이 들어갈 수 있음
    setTimeout(() => setMemoSent(false), 2000); // 2초 후 알림 사라짐
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative animate-fade-in">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 text-3xl transition"
          onClick={onClose}
          aria-label="닫기"
        >
          &times;
        </button>
        <div className="flex flex-col items-center mb-6">
          <IoPersonCircle className="text-blue-500 text-6xl mb-2 drop-shadow" />
          <h2 className="text-2xl font-extrabold text-blue-700 mb-1">
            {user?.name}
          </h2>
          <span className="text-gray-500 text-sm">{user?.email}</span>
        </div>
        <div className="divide-y divide-blue-100 mb-6">
          <div className="py-3 flex justify-between">
            <span className="font-semibold text-blue-700">가입일</span>
            <span className="text-gray-700">{user?.joinDate}</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="font-semibold text-blue-700">상태</span>
            <span
              className={
                user?.status === "활성"
                  ? "text-green-600 font-bold"
                  : "text-gray-500 font-bold"
              }
            >
              {user?.status}
            </span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="font-semibold text-blue-700">노선</span>
            <span className="text-gray-700">{user?.route}</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="font-semibold text-blue-700">연락처</span>
            <span className="text-gray-700">{user?.phone}</span>
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-semibold text-blue-700 mb-1">
            메모 보내기
          </label>
          <textarea
            className="w-full border rounded p-2 min-h-[60px] resize-none focus:outline-none focus:border-blue-400"
            placeholder="운전자에게 전달할 메모를 입력하세요."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            disabled={memoSent}
          />
          <button
            className="mt-2 w-full py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:bg-gray-300"
            onClick={handleSendMemo}
            disabled={memo.trim() === "" || memoSent}
          >
            메모 보내기
          </button>
          {memoSent && (
            <div className="text-green-600 text-center mt-2 font-semibold">
              메모가 전송되었습니다!
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            className="flex-1 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition"
            onClick={() => onDelete && onDelete(user.email)}
          >
            삭제
          </button>
        </div>
      </div>
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