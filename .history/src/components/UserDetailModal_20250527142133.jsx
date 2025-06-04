import React from "react";
import { IoPersonCircle } from "react-icons/io5";

const UserDetailModal = ({ open, onClose, onEdit }) => {
  if (!open) return null;
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
          <h2 className="text-2xl font-extrabold text-blue-700 mb-1">홍길동</h2>
          <span className="text-gray-500 text-sm">hong@example.com</span>
        </div>
        <div className="divide-y divide-blue-100 mb-6">
          <div className="py-3 flex justify-between">
            <span className="font-semibold text-blue-700">가입일</span>
            <span className="text-gray-700">2024-01-01</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="font-semibold text-blue-700">상태</span>
            <span className="text-green-600 font-bold">활성</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="font-semibold text-blue-700">최근 이용 노선</span>
            <span className="text-gray-700">101번, 202번</span>
          </div>
        </div>
        <button
          className="w-full mt-2 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
          onClick={() => {
            onClose();
            onEdit && onEdit();
          }}
        >
          수정
        </button>
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