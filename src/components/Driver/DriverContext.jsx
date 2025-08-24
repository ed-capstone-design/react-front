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
      .catch(() => {
        console.log("운전자 목록 조회 실패, 예시 데이터 사용");
        setDrivers([
          {
            driverId: 1,
            driverName: "김철수",
            phoneNumber: "010-1234-5678",
            licenseType: "1종 대형",
            licenseNumber: "12-34-567890",
            operatorId: 1,
            careerYears: 5,
            avgDrivingScore: 85,
            grade: "A",
            status: "운행중",
            createdAt: "2024-01-15T09:00:00Z"
          },
          {
            driverId: 2,
            driverName: "박영희",
            phoneNumber: "010-2345-6789",
            licenseType: "1종 대형",
            licenseNumber: "12-34-567891",
            operatorId: 1,
            careerYears: 3,
            avgDrivingScore: 92,
            grade: "A",
            status: "대기",
            createdAt: "2024-02-10T09:00:00Z"
          },
          {
            driverId: 3,
            driverName: "이민수",
            phoneNumber: "010-3456-7890",
            licenseType: "1종 대형", 
            licenseNumber: "12-34-567892",
            operatorId: 1,
            careerYears: 7,
            avgDrivingScore: 88,
            grade: "A",
            status: "운행중",
            createdAt: "2024-01-20T09:00:00Z"
          },
          {
            driverId: 4,
            driverName: "정수영",
            phoneNumber: "010-4567-8901",
            licenseType: "1종 대형",
            licenseNumber: "12-34-567893", 
            operatorId: 1,
            careerYears: 2,
            avgDrivingScore: 79,
            grade: "B",
            status: "대기",
            createdAt: "2024-03-05T09:00:00Z"
          }
        ]);
      });
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