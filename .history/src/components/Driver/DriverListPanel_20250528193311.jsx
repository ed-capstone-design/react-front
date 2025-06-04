import React, { useContext } from "react";
import { DriverContext } from "./DriverContext";
import DriverList from "./DriverList";

const 
const DriverListPanel = () => {
  const { drivers } = useContext(DriverContext);
  // 운행중 먼저, 그 외 아래로 정렬
  const 운행중 = drivers.filter((d) => d.status === "운행중");
  const 비운행 = drivers.filter((d) => d.status !== "운행중");
  const sortedDrivers = [...운행중, ...비운행];

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
      <div className="text-xl font-bold mb-4">운전자 목록</div>
      <DriverList drivers={sortedDrivers} />
    </div>
  );
};

export default DriverListPanel;
