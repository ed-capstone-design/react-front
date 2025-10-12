
import React from "react";
import { IoPersonCircle, IoMail, IoCall } from "react-icons/io5";

const BasicInfoForm = ({ userInfo }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <IoPersonCircle className="inline mr-1.5 text-gray-400" />
            사용자명
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
            {userInfo.username || "사용자"}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <IoMail className="inline mr-1.5 text-gray-400" />
            이메일
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
            {userInfo.email || "user@email.com"}
          </div>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <IoCall className="inline mr-1.5 text-gray-400" />
            전화번호
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
            {userInfo.phoneNumber || "010-0000-0000"}
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <span className="font-medium">안내:</span> 기본 정보는 읽기 전용입니다. 변경이 필요한 경우 관리자에게 문의하세요.
      </div>
    </div>
  );
};

export default BasicInfoForm;
