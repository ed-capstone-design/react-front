import React from 'react';
import { IoCarSport, IoLogOut, IoBed } from 'react-icons/io5';

const statusIcon = (status) => {
  if (status === "운행중") return (
    <span className="mr-2 align-middle" title="운행중">
      <IoCarSport size={20} color="#22c55e" className="inline-block" />
    </span>
  );
  if (status === "대기") return (
    <span className="mr-2 align-middle" title="대기">
      <IoLogOut size={20} color="#ef4444" className="inline-block" />
    </span>
  );
  if (status === "휴식") return (
    <span className="mr-2 align-middle" title="휴식">
      <IoBed size={20} color="#3b82f6" className="inline-block" />
    </span>
  );
  return <span className="inline-block w-3 h-3 rounded-full bg-gray-200 mr-2 align-middle" title={status}></span>;
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