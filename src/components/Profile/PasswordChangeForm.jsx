import React from "react";
import { IoLockClosed, IoShieldCheckmark } from "react-icons/io5";

const PasswordChangeForm = ({ userInfo, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <IoLockClosed className="inline mr-1.5 text-gray-400" />
          현재 비밀번호
        </label>
        <input
          type="password"
          name="currentPassword"
          value={userInfo?.currentPassword || ""}
          onChange={onChange}
          placeholder="현재 비밀번호를 입력하세요"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <IoShieldCheckmark className="inline mr-1.5 text-gray-400" />
            새 비밀번호
          </label>
          <input
            type="password"
            name="newPassword"
            value={userInfo?.newPassword || ""}
            onChange={onChange}
            placeholder="새 비밀번호를 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <IoShieldCheckmark className="inline mr-1.5 text-gray-400" />
            새 비밀번호 확인
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={userInfo?.confirmPassword || ""}
            onChange={onChange}
            placeholder="새 비밀번호를 다시 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>
      
      <div className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <span className="font-medium">비밀번호 요구사항:</span> 8자 이상, 영문 대소문자, 숫자, 특수문자를 포함하여 설정하는 것을 권장합니다.
      </div>
    </div>
  );
};

export default PasswordChangeForm;
