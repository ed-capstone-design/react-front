import React, { useState, createContext, useContext, useEffect } from "react";
import axios from "axios";

// axios 기본 URL 설정
axios.defaults.baseURL = "http://localhost:8080";

export const DriverContext = createContext();
DriverContext.displayName = "DriverContext";

export const useDriver = () => {
  const context = useContext(DriverContext);
  if (!context) {
    throw new Error("useDriver must be used within a DriverProvider");
  }
  return context;
};

export const DriverProvider = ({ children }) => {
  const [drivers, setDrivers] = useState([]);

  // DB에서 운전자 목록 불러오기 (Table.md 기준)
  useEffect(() => {
    axios.get("/api/drivers")
      .then(res => setDrivers(res.data))
      .catch(() => setDrivers([]));
  }, []);

  // 운전자 추가
  const addDriver = async (driver) => {
    // driver: { driverName, phoneNumber, licenseType, operatorId }
    try {
      const res = await axios.post("/api/drivers", driver);
      setDrivers(prev => [...prev, res.data]);
    } catch (e) {
      alert("운전자 추가 실패");
    }
  };

  // 운전자 수정
  const updateDriver = async (driver) => {
    try {
      await axios.put(`/api/drivers/${driver.driverId}`, driver);
      setDrivers(prev => prev.map(d => d.driverId === driver.driverId ? driver : d));
    } catch (e) {
      alert("운전자 수정 실패");
    }
  };

  // 운전자 삭제
  const deleteDriver = async (driverId) => {
    try {
      await axios.delete(`/api/drivers/${driverId}`);
      setDrivers(prev => prev.filter(d => d.driverId !== driverId));
    } catch (e) {
      alert("운전자 삭제 실패");
    }
  };

  return (
    <DriverContext.Provider value={{ drivers, setDrivers, addDriver, updateDriver, deleteDriver }}>
      {children}
    </DriverContext.Provider>
  );
};