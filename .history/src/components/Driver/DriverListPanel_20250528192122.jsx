import React, { useContext } from "react";
import { DriverContext } from "./DriverContext";


const statusIcon = (status) => {
  if (status === "운행중") return <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2 align-middle" title="운행중"></span>;
  if (status === "대기") return <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-2 align-middle" title="대기"></span>;
  if (status === "휴식") return <span className="inline-block w-3 h-3 rounded-full bg-blue-400 mr-2 align-middle" title="휴식"></span>;
  return <span className="inline-block w-3 h-3 rounded-full bg-gray-200 mr-2 align-middle" title={status}></span>;
};

const DriverListPanel = () => {
  const { drivers } = useContext(DriverContext);
  const 운행중 = drivers.filter((d) => d.status === "운행중");
  const 비운행 = drivers.filter((d) => d.status !== "운행중");
  const sortedDrivers = [...운행중, ...비운행];

  return (
    <div className="flex flex-col gap-4">
      {sortedDrivers.length > 0 ? (
        sortedDrivers.map((driver) => (
          <div key={driver.id} className="flex items-center gap-2 p-3 bg-white rounded shadow-sm border border-gray-100">
            {statusIcon(driver.status)}
            <Driver driver={driver} />
          </div>
        ))
      ) : (
        <div className="text-gray-400 text-center py-8">운전자 정보가 없습니다.</div>
      )}
    </div>
  );
};

export default DriverListPanel;
