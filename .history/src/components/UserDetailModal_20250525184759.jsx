import React from "react";

const UserDetailModal = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6">사용자 상세 정보</h2>
        <div className="mb-4">
          <span className="font-semibold">이름:</span> 홍길동
        </div>
        <div className="mb-4">
          <span className="font-semibold">이메일:</span> hong@example.com
        </div>
        <div className="mb-4">
          <span className="font-semibold">가입일:</span> 2024-01-01
        </div>
        <div className="mb-4">
          <span className="font-semibold">상태:</span> 활성
        </div>
        <div className="mb-4">
          <span className="font-semibold">최근 이용 노선:</span> 101번, 202번
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;