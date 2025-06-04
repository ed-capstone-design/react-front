import React from 'react';

const statusIcon = (status) => {
  if (status === "운행중") return <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2 align-middle" title="운행중"></span>;
  if (status === "대기") return <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-2 align-middle" title="대기"></span>;
  if (status === "휴식") return <span className="inline-block w-3 h-3 rounded-full bg-blue-400 mr-2 align-middle" title="휴식"></span>;
  return <span className="inline-block w-3 h-3 rounded-full bg-gray-200 mr-2 align-middle" title={status}></span>;
};

const DriverCard = ({ driver }) => {
  return (

        <div className="text-lg font-bold text-gray-800 mb-1">{driver.name}</div>    <div className="bg-white rounded-lg shadow p-4 border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
      {statusIcon(driver.status)}
      <div className="flex-1">
      </div>
    </div>
  );
};

export default DriverCard;