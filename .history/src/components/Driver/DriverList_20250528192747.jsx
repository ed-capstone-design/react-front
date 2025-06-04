import React, { useContext } from "react";
import { DriverContext } from "./DriverContext";

const statusIcon = (status) => {
  if (status === "운행중") return <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2 align-middle" title="운행중"></span>;
  if (status === "대기") return <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-2 align-middle" title="대기"></span>;
  if (status === "휴식") return <span className="inline-block w-3 h-3 rounded-full bg-blue-400 mr-2 align-middle" title="휴식"></span>;
  return <span className="inline-block w-3 h-3 rounded-full bg-gray-200 mr-2 align-middle" title={status}></span>;
};

const DriverList = ({ drivers }) => {
  return (
    <div className="flex flex-col gap-4">
      {drivers && drivers.length > 0 ? (
        drivers.map((driver) => (
          <div key={driver.id} className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="text-lg font-bold text-gray-800 mb-1">{driver.name}</div>
            {}
            <div className="text-sm text-gray-600">상태: {driver.status}</div>
          </div>
        ))
      ) : (
        <div className="text-gray-400 text-center py-8">운전자 정보가 없습니다.</div>
      )}
    </div>
  );
};

export default DriverList;
