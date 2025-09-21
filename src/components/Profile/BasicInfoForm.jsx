
import React from "react";
import { IoPersonCircle, IoMail } from "react-icons/io5";

const BasicInfoForm = ({ userInfo }) => {
  return (
    <div className="border-b border-gray-200 pb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            <IoPersonCircle className="inline mr-2" />
            이름
          </label>
          <div className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-2 text-gray-900 border border-gray-200">
            {userInfo.username || "사용자"}
          </div>
        </div>
            <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            <IoPersonCircle className="inline mr-2" />
            전화번호
          </label>
          <div className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-2 text-gray-900 border border-gray-200">
            {userInfo.phoneNumber || "010-1234-1234"}
          </div>
        </div>
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            <IoMail className="inline mr-2" />
            이메일
          </label>
          <div className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-2 text-gray-900 border border-gray-200">
            {userInfo.email || "User@email.com"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;
