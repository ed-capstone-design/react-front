import React from "react";
import { IoArrowBack, IoPersonCircle } from "react-icons/io5";

const ProfileHeader = ({ onBack, userInfo }) => {
  return (
    <>
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <IoArrowBack className="text-xl" />
          <span>돌아가기</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>
      </div> 

      {/* 프로필 정보 */}
      <div className="flex items-center gap-4 mb-8">
        <IoPersonCircle className="text-6xl text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{userInfo.username || "사용자"}</h2>
          <p className="text-gray-600">{userInfo.email|| "User@email.com"}</p>
        </div>
      </div>
    </>
  );
};

export default ProfileHeader;
