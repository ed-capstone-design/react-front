import React from 'react';
import { FaCarSide } from "react-icons/fa";
import { MdHotel } from "react-icons/md";
import { FaRegSmile } from "react-icons/fa";

const statusIcon = (status) => {
  if (status === "운행중") return <FaCarSide className="text-green-500 mr-2" title="운행중" size={20} />;
  if (status === "대기") return <MdHotel className="text-red-500 mr-2" title="대기" size={20} />;
  if (status === "휴식") return <FaRegSmile className="text-blue-500 mr-2" title="휴식" size={20} />;
  return null;
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