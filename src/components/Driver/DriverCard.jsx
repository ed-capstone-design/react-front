import React from 'react';
import { IoCarSport, IoLogOut } from 'react-icons/io5'; // IoBed import 주석 처리

const statusIcon = {
  '운행중': <IoCarSport size={20} color="#22c55e" className="inline-block mr-2 align-middle" title="운행중" />,
  '대기': <IoLogOut size={20} color="#ef4444" className="inline-block mr-2 align-middle" title="대기" />,
};

const DriverCard = ({ driver, onNameClick }) => (
  <div className="bg-white rounded-lg shadow p-4 border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
    <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
      <div 
        className="text-lg font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          if (onNameClick) onNameClick(driver);
        }}
      >
        {driver.driverName}
      </div>
    </div>
    {statusIcon[driver.status] || <span className="inline-block w-3 h-3 rounded-full bg-gray-200 mr-2 align-middle" title={driver.status}></span>}
  </div>
);

export default DriverCard;