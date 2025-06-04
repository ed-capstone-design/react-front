import React from "react";

const AddPage = () => {
  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6">사용자 상세 정보</h2>
      <div className="bg-white rounded shadow p-6">
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
          <span className="font-semibold">최근 운행 노선:</span> 101번, 202번
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
