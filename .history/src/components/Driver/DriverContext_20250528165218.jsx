import React, { useState, createContext } from "react";

const DriverContext = createContext();

export const DriverProvider = ({ children }) => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 추후 fetchDrivers, addDriver, updateDriver, removeDriver 등 함수 추가 가능

  return (
    <DriverContext.Provider
      value={{
        drivers,
        setDrivers,
        selectedDriver,
        setSelectedDriver,
        loading,
        setLoading,
        error,
        setError,
      }}
    >
      {children}
    </DriverContext.Provider>
  );
};

export default DriverContext;