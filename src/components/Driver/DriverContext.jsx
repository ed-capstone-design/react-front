import React, { useState, createContext, useContext, useEffect } from "react";
import { WebSocketContext } from "../WebSocket/WebSocketProvider";
import { useToken } from "../Token/TokenProvider";
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
  const { getToken } = useToken();
  // const ws = useContext(WebSocketContext);

  // DB에서 운전자 목록 불러오기 (Table.md 기준)
  useEffect(() => {
    axios.get("/api/drivers/me", {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then(res => setDrivers(res.data))
      .catch(() => {
        console.log("운전자 목록 조회 실패, 예시 데이터 사용");
        setDrivers([{
          userId: 1,
          username: "홍길동",
          email: "honggildong@example.com",
          phoneNumber: "010-1234-5678",
          licenseNumber: "12가3456",
          operatorName: "운수사A",
          grade: "A",
          careerYears: 5,
          avgDrivingScore: 4.5,
        }
        ]);
      });
  }, []);

  // useEffect(() => {
  //   if (!ws) return;
  //   ws.onmessage = (event) => {
  //     const message = JSON.parse(event.data);
  //     if (message.type === "DRIVER_UPDATE") {
  //       setDrivers(prev => prev.map(d => d.driverId === message.driver.driverId ? message.driver : d));
  //     } else if (message.type === "DRIVER_ADD") {
  //       setDrivers(prev => [...prev, message.driver]);
  //     } else if (message.type === "DRIVER_DELETE") {
  //       setDrivers(prev => prev.filter(d => d.driverId !== message.driverId));
  //     }
  //   };
  //   return () => {
  //     if (ws) ws.onmessage = null;
  //   };
  // }, [ws]);


  // 운전자 수정
  const updateDriver = async (driver) => {
    try {
      await axios.put(`/api/drivers/me/${driver.userId}`, driver);
      setDrivers(prev => prev.map(d => d.userId === driver.userId ? driver : d));
    } catch (e) {
      alert("운전자 수정 실패");
    }
  };

  // 운전자 삭제
  const deleteDriver = async (userId) => {

    try {
      await axios.delete(`/api/drivers/${userId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setDrivers(prev => prev.filter(d => d.userId !== userId));
    } catch (e) {
      alert("운전자 삭제 실패");
    }
  };
// addDriver
  return (
    <DriverContext.Provider value={{ drivers, setDrivers, updateDriver, deleteDriver }}>
      {children}
    </DriverContext.Provider>
  );
};
