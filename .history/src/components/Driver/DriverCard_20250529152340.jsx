import React from 'react';

const statusIcon = (status) => {
  if (status === "운행중") return <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2 align-middle" title="운행중"></span>;
  if (status === "대기") return <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-2 align-middle" title="대기"></span>;
  if (status === "휴식") return <span className="inline-block w-3 h-3 rounded-full bg-blue-400 mr-2 align-middle" title="휴식"></span>;
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