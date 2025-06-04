import React from 'react';
import { IoCarSport, IoLogOut, IoBed } from "react-icons/io5";

const statusIcon = (status) => {
  if (status === "운행중") return <IoCarSport className="text-green-500 mr-2" title="운행중" size={22} />;
  if (status === "대기") return <IoLogOut className="text-red-500 mr-2" title="대기" size={22} />;
  if (status === "휴식") return <IoBed className="text-blue-500 mr-2" title="휴식" size={22} />;
  return null;
};

const DriverCard = ({ driver }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
      {statusIcon(driver.status)}
      <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
        <div className="text-lg font-bold text-gray-800">{driver.name}</div>
        <div className="text-sm text-gray-600">연락처: {driver.phone}</div>
        <div className="text-sm text-gray-600">면허번호: {driver.license_no}</div>
        <div className="text-xs text-gray-400">입사일: {driver.hire_date}</div>
      </div>
    </div>
  );
};

export default DriverCard;