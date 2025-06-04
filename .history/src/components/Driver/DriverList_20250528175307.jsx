import React, { useContext } from "react";
import { DriverProvider, DriverContext } from "./DriverContext";

const DriverList = () => {
  const { drivers } = useContext(DriverContext);

  const 운행중 = drivers.filter((d) => d.status === "운행중");
  const 비운행 = drivers.filter((d) => d.status !== "운행중");
  const sortedDrivers = [...운행중, ...비운행];

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <div className="text-xl font-bold mb-4">운전자 목록</div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-2 font-semibold text-gray-700">이름</th>
              <th className="py-2 px-2 font-semibold text-gray-700">연락처</th>
              <th className="py-2 px-2 font-semibold text-gray-700">면허번호</th>
              <th className="py-2 px-2 font-semibold text-gray-700">운행상태</th>
              <th className="py-2 px-2 font-semibold text-gray-700">상세보기</th>
            </tr>
          </thead>
          <tbody>
            {sortedDrivers && sortedDrivers.length > 0 ? (
              sortedDrivers.map((driver) => (
                <tr key={driver.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-2">{driver.name}</td>
                  <td className="py-2 px-2">{driver.phone}</td>
                  <td className="py-2 px-2">{driver.license_no}</td>
                  <td className="py-2 px-2">
                    <span className={
                      driver.status === "운행중" ? "text-green-600 font-bold" :
                      driver.status === "대기" ? "text-yellow-500 font-bold" :
                      driver.status === "퇴사" ? "text-gray-400 font-bold" : ""
                    }>{driver.status}</span>
                  </td>
                  <td className="py-2 px-2">
                    <button
                      className="px-3 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition text-sm"
                      onClick={() => window.open(`/drivers/${driver.id}`, "_blank")}
                    >
                      상세
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-400">운전자 정보가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Drivers = () => (
  <DriverProvider>
    <DriverList />
  </DriverProvider>
);

export default Drivers;
