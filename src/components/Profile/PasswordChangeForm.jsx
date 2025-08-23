import React from "react";
import { IoLockClosed } from "react-icons/io5";

const PasswordChangeForm = ({ userInfo, onChange }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">비밀번호 변경</h3>
      <p className="text-sm text-gray-600 mb-4">비밀번호를 변경하지 않으려면 아래 필드를 비워두세요.</p>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            <IoLockClosed className="inline mr-2" />
            현재 비밀번호
          </label>
          <input
            type="password"
            name="currentPassword"
            value={userInfo.currentPassword}
            onChange={onChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              <IoLockClosed className="inline mr-2" />
              새 비밀번호
            </label>
            <input
              type="password"
              name="newPassword"
              value={userInfo.newPassword}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              <IoLockClosed className="inline mr-2" />
              새 비밀번호 확인
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={userInfo.confirmPassword}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeForm;
