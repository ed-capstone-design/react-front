import React, { useState, useEffect } from "react";
import KakaoMap from "../components/Map/Map";
import DriverListPanel from "../components/Driver/DriverListPanel";
import { DriverProvider } from "../components/Driver/DriverContext";
import { NotificationProvider } from "../components/Notification/contexts/NotificationContext";
import axios from "axios";

const Insight = ({ onDriverClick }) => {
  const [busLocations, setBusLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusLocations();
    // 실시간 위치 업데이트를 위한 인터벌 (15초마다)
    const interval = setInterval(fetchBusLocations, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchBusLocations = async () => {
    try {
      // 현재 운행 중인 버스들의 위치 정보 가져오기
      const response = await axios.get('/api/buses/locations');
      const locations = response.data.map(bus => ({
        lat: bus.location?.latitude || 37.5665,
        lng: bus.location?.longitude || 126.9780,
        imageSrc: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
        busInfo: {
          plateNumber: bus.plateNumber,
          busNumber: bus.busNumber,
          driverName: bus.driverName,
          status: bus.status
        }
      }));
      setBusLocations(locations);
    } catch (error) {
      console.error("버스 위치 정보 로딩 실패:", error);
      // 에러 시 기본 위치들로 설정
      setBusLocations([
        { 
          lat: 37.54699, 
          lng: 127.09598, 
          imageSrc: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
          busInfo: { plateNumber: "데모 01", busNumber: "101", status: "운행중" }
        },
        { 
          lat: 37.55000, 
          lng: 127.10000, 
          imageSrc: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
          busInfo: { plateNumber: "데모 02", busNumber: "102", status: "운행중" }
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <NotificationProvider>
      <div className="max-w-7xl mx-auto py-10 px-4">
        <h2 className="text-2xl font-bold mb-8 text-gray-900">인사이트</h2>
        <div className="flex flex-col md:flex-row gap-8">
          {/* 지도 (왼쪽, 메인) */}
          <div className="w-full md:w-[72%] order-1 md:order-1">
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">실시간 버스 위치</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  {loading ? "위치 업데이트 중..." : `${busLocations.length}대 운행중`}
                </div>
              </div>
              <div className="flex-1 min-h-[600px]">
                <KakaoMap markers={busLocations} />
              </div>
            </div>
          </div>
          {/* 우측 패널 */}
          <div className="w-full md:w-[25%] order-2 md:order-2 space-y-6">
            {/* 운전자 패널 */}
            <DriverProvider>
              <DriverListPanel onDriverClick={onDriverClick} />
            </DriverProvider>
          </div>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default Insight;