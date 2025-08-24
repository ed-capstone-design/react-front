import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const BusContext = createContext();

export const useBus = () => {
  const context = useContext(BusContext);
  if (!context) {
    throw new Error("useBus must be used within a BusProvider");
  }
  return context;
};

export const BusProvider = ({ children }) => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 버스 목록 조회
  const fetchBuses = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("/api/buses");
      setBuses(response.data);
    } catch (error) {
      console.error("버스 목록 조회 실패:", error);
      setError("버스 목록을 불러오는데 실패했습니다.");
      // 예시 데이터로 대체
      setBuses([
        {
          busId: 1,
          routeNumber: "101",
          routeType: "CITY",
          capacity: 45,
          vehicleNumber: "서울70가1234",
          vehicleType: "STANDARD",
          vehicleYear: 2020,
          lastMaintenance: "2024-01-15",
          repairCount: 3,
          fuelType: "DIESEL"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchBuses();
  }, []);

  // 버스 추가
  const addBus = async (busData) => {
    try {
      setLoading(true);
      const response = await axios.post("/api/buses", busData);
      setBuses(prev => [...prev, response.data]);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("버스 추가 실패:", error);
      const errorMessage = error.response?.data?.message || "버스 추가에 실패했습니다.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // 버스 수정
  const updateBus = async (busId, busData) => {
    try {
      setLoading(true);
      const response = await axios.put(`/api/buses/${busId}`, busData);
      setBuses(prev => prev.map(bus => 
        bus.busId === busId ? { ...bus, ...response.data } : bus
      ));
      return { success: true, data: response.data };
    } catch (error) {
      console.error("버스 수정 실패:", error);
      const errorMessage = error.response?.data?.message || "버스 수정에 실패했습니다.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // 버스 삭제
  const deleteBus = async (busId) => {
    try {
      setLoading(true);
      await axios.delete(`/api/buses/${busId}`);
      setBuses(prev => prev.filter(bus => bus.busId !== busId));
      return { success: true };
    } catch (error) {
      console.error("버스 삭제 실패:", error);
      const errorMessage = error.response?.data?.message || "버스 삭제에 실패했습니다.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // 특정 버스 조회
  const getBusById = (busId) => {
    return buses.find(bus => bus.busId === parseInt(busId));
  };

  // 버스 통계
  const getBusStats = () => {
    return {
      total: buses.length,
      byRouteType: buses.reduce((acc, bus) => {
        acc[bus.routeType] = (acc[bus.routeType] || 0) + 1;
        return acc;
      }, {}),
      byVehicleType: buses.reduce((acc, bus) => {
        acc[bus.vehicleType] = (acc[bus.vehicleType] || 0) + 1;
        return acc;
      }, {}),
      byFuelType: buses.reduce((acc, bus) => {
        acc[bus.fuelType] = (acc[bus.fuelType] || 0) + 1;
        return acc;
      }, {}),
      avgAge: buses.length > 0 ? 
        Math.round(buses.reduce((sum, bus) => sum + (new Date().getFullYear() - bus.vehicleYear), 0) / buses.length) : 0
    };
  };

  const value = {
    buses,
    loading,
    error,
    fetchBuses,
    addBus,
    updateBus,
    deleteBus,
    getBusById,
    getBusStats,
    clearError: () => setError("")
  };

  return (
    <BusContext.Provider value={value}>
      {children}
    </BusContext.Provider>
  );
};
