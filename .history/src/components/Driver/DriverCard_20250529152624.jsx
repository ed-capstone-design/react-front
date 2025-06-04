import React from 'react';

const statusIcon = (status) => {
  if (status === "운행중") return (
    <span className="mr-2 align-middle" title="운행중">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="inline-block">
        <rect x="2" y="8" width="16" height="6" rx="2" fill="#22c55e" />
        <circle cx="6" cy="16" r="2" fill="#22c55e" />
        <circle cx="14" cy="16" r="2" fill="#22c55e" />
      </svg>
    </span>
  );
  if (status === "대기") return (
    <span className="mr-2 align-middle" title="대기">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="inline-block">
        <rect x="4" y="10" width="12" height="4" rx="2" fill="#ef4444" />
        <circle cx="7" cy="16" r="2" fill="#ef4444" />
        <circle cx="13" cy="16" r="2" fill="#ef4444" />
        <rect x="7" y="6" width="6" height="2" rx="1" fill="#ef4444" />
      </svg>
    </span>
  );
  if (status === "휴식") return (
    <span className="mr-2 align-middle" title="휴식">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="inline-block">
        <path d="M4 14c0-2.21 3.134-4 7-4s7 1.79 7 4" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
        <circle cx="10" cy="8" r="3" fill="#3b82f6" />
      </svg>
    </span>
  );
  return <span className="inline-block w-3 h-3 rounded-full bg-gray-200 mr-2 align-middle" title={status}></span>;
};

const DriverCard = ({ driver }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
      <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
        <div className="text-lg font-bold text-gray-800">{driver.name}</div>
              {statusIcon(driver.status)}
      </div>
    </div>
  );
};

export default DriverCard;