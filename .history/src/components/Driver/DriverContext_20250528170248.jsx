import React, { useState, createContext } from "react";

const DriverContext = createContext();

cosnt exampleDrivers = [{
    "1": {
        id: "1",
        name: "홍길동",
        phone: "010-1234-5678",
        license: "1234567890",
        status: "운행중"
    },
    "2": {
        id: "2",
        name: "김철수",
        phone: "010-9876-5432",
        license: "0987654321",
        status: "대기"
    } 
}]
export const DriverProvider = ({ children }) => {
  const [drivers, setDrivers] = useState([exampleDrivers]);


  // 추후 fetchDrivers, addDriver, updateDriver, removeDriver 등 함수 추가 가능

  return (
    <DriverContext.Provider
      value={{
        drivers,
        setDrivers
      }}
    >
      {children}
    </DriverContext.Provider>
  );
};

export default DriverContext;