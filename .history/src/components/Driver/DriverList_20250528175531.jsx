import React, { useContext, useState } from "react";
import { DriverProvider, DriverContext } from "./DriverContext";

const DriverList = ({ drivers, onSelect }) => (
  <table>
    <tbody>
      {drivers.map((driver) => (
        <tr key={driver.id}>
          <td>{driver.name}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const Driver = ({ driver }) => (
  <div className="mt-4 p-4 border rounded-lg bg-gray-50">
    <h2 className="text-lg font-semibold">{driver.name} 상세정보</h2>
    <p>
      <strong>상태:</strong> {driver.status}
    </p>
    <p>
      <strong>차량:</strong> {driver.car}
    </p>
    <p>
      <strong>운전경력:</strong> {driver.experience} 년
    </p>
  </div>
);

const Drivers = () => {
  const { drivers } = useContext(DriverContext);
  const [selectedId, setSelectedId] = useState(null);
  const selectedDriver = drivers.find((d) => d.id === selectedId);

  const 운행중 = drivers.filter((d) => d.status === "운행중");
  const 비운행 = drivers.filter((d) => d.status !== "운행중");
  const sortedDrivers = [...운행중, ...비운행];

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <div className="text-xl font-bold mb-4">운전자 목록</div>
        <DriverList
          drivers={sortedDrivers}
          onSelect={setSelectedId}
        />
        {selectedDriver && <Driver driver={selectedDriver} />}
      </div>
    </div>
  );
};

const App = () => (
  <DriverProvider>
    <Drivers />
  </DriverProvider>
);

export default App;
