import React, { useState, createContext } from "react";

const DriverContext = createContext();

exampleDrivers = []
export const DriverProvider = ({ children }) => {
  const [drivers, setDrivers] = useState([]);


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