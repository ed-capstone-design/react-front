import React from "react";
import { IoPersonCircle, IoMail } from "react-icons/io5";

const BasicInfoForm = ({ userInfo, onChange }) => {
  return (
    <div className="border-b border-gray-200 pb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            <IoPersonCircle className="inline mr-2" />
            이름
          </label>
          <input
            type="text"
            name="name"
            value={userInfo.name}
            onChange={onChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />
        </div>
        
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            <IoMail className="inline mr-2" />
            이메일
          </label>
          <input
            type="email"
            name="email"
            value={userInfo.email}
            onChange={onChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;
