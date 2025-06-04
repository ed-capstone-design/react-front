import React, { useContext, useState } from "react";
import { DriverProvider, DriverContext } from "./DriverContext";
import Driver from "./Driver";

const DriverList = () => {
  const { drivers } = useContext(DriverContext);
  const 운행중 = drivers.filter((d) => d.status === "운행중");
  const 비운행 = drivers.filter((d) => d.status !== "운행중");
  const sortedDrivers = [...운행중, ...비운행];

  return (
    <div className="flex flex-col gap-4">
      {sortedDrivers.length > 0 ? (
        sortedDrivers.map((driver) => (
          <Driver key={driver.id} driver={driver} />
        ))
      ) : (
        <div className="text-gray-400 text-center py-8">운전자 정보가 없습니다.</div>
      )}
    </div>
  );
};

const Drivers = () => {
  const { drivers } = useContext(DriverContext);
  const [selectedId, setSelectedId] = useState(null);
  const selectedDriver = drivers.find((d) => d.id === selectedId);

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <div className="text-xl font-bold mb-4">운전자 목록</div>
        <DriverList />
        {selectedDriver && <Driver driver={selectedDriver} />}
      </div>
    </div>
  );
};

const statusIcon = (status) => {
  if (status === "운행중") return <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2 align-middle" title="운행중"></span>;
  if (status === "대기") return <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-2 align-middle" title="대기"></span>;
  if (status === "휴식") return <span className="inline-block w-3 h-3 rounded-full bg-blue-400 mr-2 align-middle" title="휴식"></span>;
  return <span className="inline-block w-3 h-3 rounded-full bg-gray-200 mr-2 align-middle" title={status}></span>;
};

const App = () => (
  <DriverProvider>
    <Drivers />
  </DriverProvider>
);

export default App;
